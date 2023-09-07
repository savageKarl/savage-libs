// @ts-check
import { parse } from '@babel/parser'
import { existsSync, readdirSync, readFileSync } from 'fs'
import MagicString from 'magic-string'
import dts from 'rollup-plugin-dts'
import { walk } from 'estree-walker'

if (!existsSync('temp/packages')) {
	console.warn(
		'no temp dts files found. run `tsc -p tsconfig.build.json` first.'
	)
	process.exit(1)
}

const packages = readdirSync('temp/packages')
const targets = process.env.TARGETS ? process.env.TARGETS.split(',') : null
const targetPackages = targets
	? packages.filter(pkg => targets.includes(pkg))
	: packages

export default targetPackages.map(pkg => {
	return {
		input: `./temp/packages/${pkg}/src/index.d.ts`,
		output: {
			file: `packages/${pkg}/dist/${pkg}.d.ts`,
			format: 'es'
		},
		plugins: [dts(), patchTypes(pkg)],
		onwarn(warning, warn) {
			// during dts rollup, everything is externalized by default
			if (
				warning.code === 'UNRESOLVED_IMPORT' &&
				!warning.exporter.startsWith('.')
			) {
				return
			}
			warn(warning)
		}
	}
})

/**
 * Patch the dts generated by rollup-plugin-dts
 * 1. remove exports marked as @internal
 * 2. Convert all types to inline exports
 *    and remove them from the big export {} declaration
 *    otherwise it gets weird in vitepress `defineComponent` call with
 *    "the inferred type cannot be named without a reference"
 * 3. Append custom augmentations (jsx, macros)
 * @returns {import('rollup').Plugin}
 */
function patchTypes(pkg) {
	return {
		name: 'patch-types',
		renderChunk(code, chunk) {
			const s = new MagicString(code)
			const ast = parse(code, {
				plugins: ['typescript'],
				sourceType: 'module'
			})

			function processDeclaration(node, parentDecl) {
				if (!node.id) {
					return
				}
				// @ts-ignore
				const name = node.id.name
				if (name.startsWith('_')) {
					return
				}
				shouldRemoveExport.add(name)
				if (!removeInternal(parentDecl || node)) {
					if (isExported.has(name)) {
						// @ts-ignore
						s.prependLeft((parentDecl || node).start, `export `)
					}
					// traverse further for internal properties
					if (
						node.type === 'TSInterfaceDeclaration' ||
						node.type === 'ClassDeclaration'
					) {
						node.body.body.forEach(removeInternal)
					} else if (node.type === 'TSTypeAliasDeclaration') {
						// @ts-ignore
						walk(node.typeAnnotation, {
							enter(node) {
								// @ts-ignore
								if (removeInternal(node)) this.skip()
							}
						})
					}
				}
			}

			/**

			 * @returns {boolean}
			 */
			function removeInternal(node) {
				if (
					node.leadingComments &&
					node.leadingComments.some(c => {
						return c.type === 'CommentBlock' && /@internal\b/.test(c.value)
					})
				) {
					/** @type {any} */
					const n = node
					let id
					if (n.id && n.id.type === 'Identifier') {
						id = n.id.name
					} else if (n.key && n.key.type === 'Identifier') {
						id = n.key.name
					}
					if (id) {
						s.overwrite(
							// @ts-ignore
							node.leadingComments[0].start,
							node.end,
							`/* removed internal: ${id} */`
						)
					} else {
						// @ts-ignore
						s.remove(node.leadingComments[0].start, node.end)
					}
					return true
				}
				return false
			}

			const isExported = new Set()
			const shouldRemoveExport = new Set()

			// pass 0: check all exported types
			for (const node of ast.program.body) {
				if (node.type === 'ExportNamedDeclaration' && !node.source) {
					for (let i = 0; i < node.specifiers.length; i++) {
						const spec = node.specifiers[i]
						if (spec.type === 'ExportSpecifier') {
							isExported.add(spec.local.name)
						}
					}
				}
			}

			// pass 1: remove internals + add exports
			for (const node of ast.program.body) {
				if (node.type === 'VariableDeclaration') {
					processDeclaration(node.declarations[0], node)
					if (node.declarations.length > 1) {
						throw new Error(
							`unhandled declare const with more than one declarators:\n${code.slice(
								// @ts-ignore
								node.start,
								node.end
							)}`
						)
					}
				} else if (
					node.type === 'TSTypeAliasDeclaration' ||
					node.type === 'TSInterfaceDeclaration' ||
					node.type === 'TSDeclareFunction' ||
					node.type === 'TSEnumDeclaration' ||
					node.type === 'ClassDeclaration'
				) {
					processDeclaration(node)
				} else if (removeInternal(node)) {
					throw new Error(
						`unhandled export type marked as @internal: ${node.type}`
					)
				}
			}

			// pass 2: remove exports
			for (const node of ast.program.body) {
				if (node.type === 'ExportNamedDeclaration' && !node.source) {
					let removed = 0
					for (let i = 0; i < node.specifiers.length; i++) {
						const spec = node.specifiers[i]
						if (
							spec.type === 'ExportSpecifier' &&
							shouldRemoveExport.has(spec.local.name)
						) {
							// @ts-ignore
							const exported = spec.exported.name
							if (exported !== spec.local.name) {
								// this only happens if we have something like
								//   type Foo
								//   export { Foo as Bar }
								continue
							}
							const next = node.specifiers[i + 1]
							if (next) {
								// @ts-ignore
								s.remove(spec.start, next.start)
							} else {
								// last one
								const prev = node.specifiers[i - 1]
								// @ts-ignore
								s.remove(prev ? prev.end : spec.start, spec.end)
							}
							removed++
						}
					}
					if (removed === node.specifiers.length) {
						// @ts-ignore
						s.remove(node.start, node.end)
					}
				}
			}
			code = s.toString()

			if (/@internal/.test(code)) {
				throw new Error(
					`unhandled @internal declarations detected in ${chunk.fileName}.`
				)
			}

			// append pkg specific types
			const additionalTypeDir = `packages/${pkg}/types`
			if (existsSync(additionalTypeDir)) {
				code +=
					'\n' +
					readdirSync(additionalTypeDir)
						.map(file => readFileSync(`${additionalTypeDir}/${file}`, 'utf-8'))
						.join('\n')
			}
			return code
		}
	}
}
