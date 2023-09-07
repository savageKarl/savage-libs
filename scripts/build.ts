// @ts-check

/*
Produces production builds and stitches together d.ts files.

To specify the package to build, simply pass its name and the desired build
formats to output (defaults to `buildOptions.formats` specified in that package,
or "esm,cjs"):

```
# name supports fuzzy match. will build all packages with name containing "dom":
nr build dom

# specify the format to output
nr build core --formats cjs
```
*/

import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import minimist from 'minimist'
import execa from 'execa'
import { cpus } from 'node:os'
import { createRequire } from 'node:module'
import { targets as allTargets, fuzzyMatchTarget } from './utils.js'

const require = createRequire(import.meta.url)
const args = minimist(process.argv.slice(2))
const targets = args._
const formats = args.formats || args.f
const devOnly = args.devOnly || args.d
// const prodOnly = !devOnly && (args.prodOnly || args.p)
const buildTypes = args.withTypes || args.t
// const sourceMap = args.sourcemap || args.s
const isRelease = args.release
const buildAllMatching = args.all || args.a
// const writeSize = args.size
// const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

run()

async function run() {
	try {
		const resolvedTargets = targets.length
			? fuzzyMatchTarget(targets, buildAllMatching)
			: allTargets

		await buildAll(resolvedTargets)
		if (buildTypes) {
			await execa(
				'pnpm',
				[
					'run',
					'build-dts',
					...(targets.length
						? ['--environment', `TARGETS:${resolvedTargets.join(',')}`]
						: [])
				],
				{
					stdio: 'inherit'
				}
			)
		}
	} catch (e) {
		console.error(e)
	}
}

async function buildAll(targets: string[]) {
	await runParallel(cpus().length, targets, build)
}

async function runParallel(
	maxConcurrency: number,
	source: any,
	iteratorFn: (...args: any) => void
) {
	const ret: Promise<any>[] = []
	const executing: Promise<any>[] = []
	for (const item of source) {
		const p = Promise.resolve().then(() => iteratorFn(item, source))
		ret.push(p)

		if (maxConcurrency <= source.length) {
			const e: Promise<any> = p.then(() =>
				executing.splice(executing.indexOf(e), 1)
			)
			executing.push(e)
			if (executing.length >= maxConcurrency) {
				await Promise.race(executing)
			}
		}
	}
	return Promise.all(ret)
}

async function build(target: string) {
	const pkgDir = path.resolve(`packages/${target}`)
	const pkg = require(`${pkgDir}/package.json`)

	// if this is a full build (no specific targets), ignore private packages
	if ((isRelease || !targets.length) && pkg.private) {
		return
	}

	// if building a specific format, do not remove dist.
	if (!formats && existsSync(`${pkgDir}/dist`)) {
		await fs.rm(`${pkgDir}/dist`, { recursive: true })
	}

	const env =
		(pkg.buildOptions && pkg.buildOptions.env) ||
		(devOnly ? 'development' : 'production')
	await execa(
		'rollup',
		[
			'-c',
			'--environment',
			[`NODE_ENV:${env}`, `TARGET:${target}`].filter(Boolean).join(',')
		],
		{ stdio: 'inherit' }
	)
}
