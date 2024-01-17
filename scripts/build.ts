import { join, resolve } from 'node:path'

import { clone } from 'esbuild-plugin-clone'

import { build } from 'savage-tsup'
import type { Options as TsupOptions } from 'savage-tsup'

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
		copy,
		...rest
	} = buildOptions

	const path = getFullpath(pkgName)
	const outDir = getFullpath(pkgName, 'dist')

	const deps = Object.keys(pkgJson.dependencies || {})

	const _external = external === 'dependencies' ? deps : external

	const plugins = []

	if (pkgName !== 'esbuild-plugin-umd') {
		plugins.push(
			// @ts-ignore
			(await import('esbuild-plugin-umd')).umd({
				libraryName,
				external: _external,
				globalVariableName
			})
		)
	}

	if (copy) {
		const from = join(resolve(packagesRoot, pkgName, copy.from), '**/*')
		const to = resolve(packagesRoot, pkgName, copy.to)
		plugins.push(
			clone({
				to,
				from
			})
		)
	}

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
		...rest,
		external: deps,
		outExtension
	} as TsupOptions
}

main()
function main() {
	const tasks = resolvedPkgNames.map(
		name => async () => build(await createConfig(name))
	)
	Promise.all(tasks.map(v => v()))
}
