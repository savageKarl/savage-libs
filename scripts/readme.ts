import { resolve } from 'node:path'
import { writeFile } from 'node:fs/promises'

import { capitalize } from 'savage-utils'

import {
	packagesRoot,
	getPkgJson,
	resolveCliOption,
	resolveTargetPkgNames,
	getCompleteTemplate,
	replaceTemplateVariable
} from './utils'

const { targetPkgNames, all } = resolveCliOption(process)

const resolvedPkgNames = resolveTargetPkgNames(targetPkgNames, all)

async function genereateReadme(name: string) {
	const readmePath = resolve(packagesRoot, name, 'README.md')
	const pkgJsonPath = resolve(packagesRoot, name, 'package.json')

	const pkgJson = getPkgJson(pkgJsonPath)

	const template = await getCompleteTemplate(['commonHeader', 'readme'])

	const content = replaceTemplateVariable(template, {
		capitalizeName: capitalize(pkgJson.name),
		description: pkgJson.description,
		name: pkgJson.name
	})

	writeFile(readmePath, content, { encoding: 'utf-8' })
}

main()
function main() {
	const tasks = resolvedPkgNames.map(name => () => genereateReadme(name))
	Promise.all(tasks.map(v => v()))
}
