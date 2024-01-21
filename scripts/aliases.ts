import { resolve } from 'node:path'
import { generateFiles } from 'savage-node'
import { projectRoot, resolveCliOption, resolveTargetPkgNames } from './utils'

const { targetPkgNames, all } = resolveCliOption(process)

const resolvedPkgNames = resolveTargetPkgNames(targetPkgNames, all)

function generatePathFile(pkgNames: string[]) {
	const template = {
		compilerOptions: {
			paths: {}
		}
	}

	const paths = pkgNames.reduce(
		(preV, curV) => Object.assign(preV, { [curV]: [`packages/${curV}/src`] }),
		{}
	)

	template.compilerOptions.paths = paths

	const aliasFilePath = resolve(projectRoot, 'tsconfig.path.json')
	generateFiles({ [aliasFilePath]: JSON.stringify(template, null, 4) })
}

main()
function main() {
	generatePathFile(resolvedPkgNames)
}
