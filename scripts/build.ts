import { resolve } from 'node:path'

import { build } from 'tsup'
import type { Options as TsupOptions } from 'tsup'

import type { BuildOptions } from './types'
import {
	packagesRoot,
	getFullpath,
	resolveCliOption,
	resolveTargetPkgNames,
	getPkgJson
} from './utils'

const { targetPkgNames, all, watch } = resolveCliOption(process)

const resolvedPkgNames = resolveTargetPkgNames(targetPkgNames, all)

async function createConfig(pkgName: string) {
	const pkgJson = getPkgJson(resolve(packagesRoot, pkgName))
	const buildOptions = pkgJson.buildOptions as BuildOptions
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
		external === 'dependencies'
			? Object.keys(pkgJson.dependencies || {})
			: external

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

	const outExtension = (ctx: { format: 'esm' | 'cjs' | 'iife' | 'umd' }) => ({
		js: { esm: '.js', cjs: '.cjs', iife: '.global.js', umd: '.umd.js' }[
			ctx.format
		]
	})

	return {
		entry: [path],
		minify: watch ? false : minify,
		dts: watch ? false : dts,
		outDir,
		watch,
		clean: false,
		esbuildPlugins: plugins,
		external: _external,
		outExtension,
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
