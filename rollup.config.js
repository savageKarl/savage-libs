// @ts-check
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import json from '@rollup/plugin-json'
import chalk from 'chalk'
import commonJS from '@rollup/plugin-commonjs'
import polyfillNode from 'rollup-plugin-polyfill-node'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import alias from '@rollup/plugin-alias'
import { entries } from './scripts/aliases.js'

if (!process.env.TARGET) {
	throw new Error('TARGET package must be specified via --environment flag.')
}

const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)

const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))
const packageOptions = pkg.buildOptions || {}
const name = packageOptions.filename || path.basename(packageDir)

const isPro = process.env.NODE_ENV === 'production'

const outputConfigs = {
	'esm-bundler': {
		file: resolve(`dist/${name}.esm-bundler.js`),
		format: `es`
	},
	cjs: {
		file: resolve(`dist/${name}.cjs.js`),
		format: `cjs`
	}
}

const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const packageConfigs = process.env.PROD_ONLY
	? []
	: packageFormats.map(format => createConfig(format, outputConfigs[format]))

if (process.env.NODE_ENV === 'production') {
	packageFormats.forEach(format => {
		if (packageOptions.prod === false) {
			return
		}
		if (format === 'cjs') {
			packageConfigs.push(createProductionConfig(format))
		}
	})
}

export default packageConfigs

function createConfig(format, output, plugins = []) {
	if (!output) {
		console.log(chalk.yellow(`invalid format: "${format}"`))
		process.exit(1)
	}

	const isNodeBuild = format === 'cjs'

	const entryFile = `src/index.ts`

	function resolveExternal() {
		const treeShakenDeps = ['source-map-js', '@babel/parser', 'estree-walker']
		return [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {}),
			// for @vue/compiler-sfc / server-renderer
			...['path', 'url', 'stream'],
			// somehow these throw warnings for runtime-* package builds
			...treeShakenDeps
		]
	}

	function resolveNodePlugins() {
		const nodePlugins =
			(format === 'cjs' && Object.keys(pkg.devDependencies || {}).length) ||
			packageOptions.enableNonBrowserBranches
				? [
						commonJS({
							sourceMap: false
						}),
						...(format === 'cjs' ? [] : [polyfillNode()]),
						nodeResolve()
				  ]
				: []

		return nodePlugins
	}

	return {
		input: resolve(entryFile),
		external: resolveExternal(),
		plugins: [
			json({
				namedExports: false
			}),
			alias({
				entries
			}),
			esbuild({
				tsconfig: path.resolve(__dirname, 'tsconfig.json'),
				sourceMap: output.sourcemap,
				// minify: isPro,
				target: isNodeBuild ? 'es2019' : 'es2015'
			}),
			...resolveNodePlugins(),
			...plugins
		],
		output,
		onwarn: (msg, warn) => {
			if (!/Circular/.test(msg)) {
				warn(msg)
			}
		},
		treeshake: {
			moduleSideEffects: false
		}
	}
}

function createProductionConfig(format) {
	return createConfig(format, {
		file: resolve(`dist/${name}.${format}.prod.js`),
		format: outputConfigs[format].format
	})
}

// function createMinifiedConfig(format) {
// 	return createConfig(
// 		format,
// 		{
// 			file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
// 			format: outputConfigs[format].format
// 		},
// 		[
// 			terser({
// 				module: /^esm/.test(format),
// 				compress: {
// 					ecma: 2015,
// 					pure_getters: true
// 				},
// 				safari10: true
// 			})
// 		]
// 	)
// }
