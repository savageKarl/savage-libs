import { resolve } from 'node:path'

import { build } from 'tsup'
import type { Options as TsupOptions } from 'tsup'
import type { IPackageJson } from '@ts-type/package-dts'

import type { BuildOptions } from './types'
import {
	packagesRoot,
	require,
	getFullpath,
	resolveCliOption,
	resolveTargetPkgNames
} from './utils'

const { targetPkgNames, all, watch } = resolveCliOption(process)

const resolvedPkgNames = resolveTargetPkgNames(targetPkgNames, all)

async function createConfig(pkgName: string) {
	const pkgPath = resolve(packagesRoot, pkgName, 'package.json')
	const pkg = require(pkgPath) as IPackageJson
	const buildOptions = pkg.buildOptions as BuildOptions
	const {
		libraryName = '',
		external = 'dependencies',
		globalVariableName = {},
		minify,
		dts,
		...rest
	} = buildOptions

	const path = getFullpath(pkgName)
	const outDir = getFullpath(pkgName, 'dist')

	const _external =
		external === 'dependencies' ? Object.keys(pkg.dependencies || {}) : external

	const plugins =
		pkgName !== 'esbuild-plugin-umd'
			? [
					// @ts-ignore
					(await import('esbuild-plugin-umd')).umd({
						libraryName,
						external: _external,

						globalVariableName
					})
			  ]
			: []

	return {
		entry: [path],
		minify: watch ? false : minify,
		dts: watch ? false : dts,
		outDir,
		watch,
		clean: false,
		esbuildPlugins: plugins,
		external: _external,
		...rest
	} as TsupOptions
}

main()
function main() {
	const tasks = resolvedPkgNames.map(
		name => async () => build(await createConfig(name))
	)
	Promise.all(tasks.map(v => v()))
}
