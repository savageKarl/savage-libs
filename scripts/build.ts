import { resolve } from 'node:path'

import minimist from 'minimist'

import { build } from 'tsup'
import type { Options as TsupOptions } from 'tsup'
import type { IPackageJson } from '@ts-type/package-dts'

import type { BuildOptions } from './types'
import {
	packagesRoot,
	fuzzyMatchPkgName,
	require,
	pkgNames,
	getChangedPkgNames
} from './utils'

const argv = minimist(process.argv.slice(2))

const targetPkgNames = (argv.t || argv.target)?.split(',') || []
const watch = argv.watch || argv.w
const all = argv.all || argv.a

const tasks: (() => Promise<void>)[] = []

const resolvedPkgNames = resolveTargetPkgNames()

function resolveTargetPkgNames() {
	if (all) return pkgNames

	if (targetPkgNames.length) return fuzzyMatchPkgName(targetPkgNames)

	return getChangedPkgNames()
}

resolvedPkgNames.forEach(name => {
	tasks.push(async () => build(await createConfig(name)))
})

async function createConfig(pkgName: string) {
	const entryFile = `src/index.ts`
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

	const path = resolve(packagesRoot, pkgName, entryFile).replace(/\\/g, '/')
	const outDir = resolve(packagesRoot, pkgName, 'dist').replace(/\\/g, '/')

	const plugins =
		pkgName !== 'esbuild-plugin-umd'
			? [
					// @ts-ignore
					(await import('esbuild-plugin-umd')).umd({
						libraryName,
						external:
							external === 'dependencies'
								? Object.keys(pkg.dependencies || {})
								: external,
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
		clean: true,
		esbuildPlugins: plugins,
		external:
			external === 'dependencies'
				? Object.keys(pkg.dependencies || {})
				: external,
		...rest
	} as TsupOptions
}

run()
function run() {
	Promise.all(tasks.map(v => v()))
}
