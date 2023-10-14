import { resolve } from 'node:path'
import { writeFile } from 'node:fs/promises'

import type { IPackageJson } from '@ts-type/package-dts'

import { capitalize } from 'savage-utils'

import {
	packagesRoot,
	require,
	resolveCliOption,
	resolveTargetPkgNames
} from './utils'

const { targetPkgNames, all } = resolveCliOption(process)

const resolvedPkgNames = resolveTargetPkgNames(targetPkgNames, all)

async function genereateReadme(name: string) {
	const readmePath = resolve(packagesRoot, name, 'README.md')
	const pkgJsonPath = resolve(packagesRoot, name, 'package.json')

	const pkgJson = require(pkgJsonPath) as Required<IPackageJson>

	const content = [
		`# ${capitalize(pkgJson.name)}`,
		pkgJson.description,
		'# Documentation',
		`See [here](https://savage181855.github.io/savage-libs/${pkgJson.name}/modules)`
	].join('\n\n')

	writeFile(readmePath, content, { encoding: 'utf-8' })
}

main()
function main() {
	const tasks = resolvedPkgNames.map(name => () => genereateReadme(name))
	Promise.all(tasks.map(v => v()))
}
