import { resolve } from 'node:path'
import { mdtable } from 'savage-mdtable'
import { capitalize } from 'savage-utils'
import { generateFiles } from 'savage-node'
import {
	projectRoot,
	packagesRoot,
	getPkgJson,
	resolveCliOption,
	resolveTargetPkgNames,
	spliceTemplate,
	replaceTemplateVariable,
	pkgNames
} from './utils'

const { targetPkgNames, all } = resolveCliOption(process)

const resolvedPkgNames = resolveTargetPkgNames(targetPkgNames, all)

async function genereateReadme(pkgPath: string, type: 'root' | 'subPkg') {
	const readmePath = resolve(pkgPath, 'README.md')
	const pkgJson = getPkgJson(pkgPath)

	const strategy = {
		async root() {
			const template = await spliceTemplate(['commonHeader'])

			const content = replaceTemplateVariable(template, {
				capitalizeName: capitalize(pkgJson.name),
				description: pkgJson.description,
				name: pkgJson.name
			})

			const table = mdtable({
				header: ['Package', 'Version', 'Documention', 'Changelog', 'platform'],
				alignment: ['C', 'C', 'C', 'C', 'C'],
				rows: pkgNames.map(pkgName => {
					const { version } = getPkgJson(resolve(packagesRoot, pkgName))
					return [
						`[${pkgName}](./packages/${pkgName}#readme)`,
						version,
						`[Documention](https://savage181855.github.io/savage-libs/${pkgName}/modules.html)`,
						`[Changelog](./packages/${pkgName}/CHANGELOG.md)`,
						`[NPM](https://www.npmjs.com/package/${pkgName})`
					]
				})
			})

			return { content: [content, '# Packages', table].join('\n') }
		},
		async subPkg() {
			const template = await spliceTemplate(['commonHeader', 'readme'])
			const content = replaceTemplateVariable(template, {
				capitalizeName: capitalize(pkgJson.name),
				description: pkgJson.description,
				name: pkgJson.name
			})
			return { content }
		}
	}

	const { content } = await strategy[type]()

	generateFiles({ [readmePath]: content })
}

main()
function main() {
	const projectName = getPkgJson(projectRoot).name

	if (targetPkgNames[0] === projectName) {
		genereateReadme(projectRoot, 'root')
	} else {
		const tasks = resolvedPkgNames.map(
			name => () => genereateReadme(resolve(packagesRoot, name), 'subPkg')
		)
		Promise.all(tasks.map(v => v()))
	}
}
