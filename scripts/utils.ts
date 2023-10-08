// @ts-check
import fs from 'node:fs'
import chalk from 'chalk'
import { createRequire } from 'node:module'
import { cpus } from 'node:os'
import { resolve } from 'node:path'

export const require = createRequire(import.meta.url)
export const packagesRoot = resolve('packages')

export function getFolderByPath(path: string) {
	const folders: string[] = []
	fs.readdirSync(path).forEach(f => {
		if (fs.statSync(`${path}/${f}`).isDirectory()) {
			folders.push(f)
		}
	})

	return folders
}

/** sub package name of packages path */
export const pkgNames = fs.readdirSync(packagesRoot).filter(f => {
	if (!fs.statSync(`${packagesRoot}/${f}`).isDirectory()) return false

	const pkg = require(`${packagesRoot}/${f}/package.json`)
	if (pkg.private && !pkg.buildOptions) return false

	return true
})

export function fuzzyMatchPkgName(partialPkgNames: string[]) {
	return pkgNames.filter(name => {
		return partialPkgNames.some(v => name.match(v))
	})
}

export function fuzzyMatchTarget(
	partialTargets: string[],
	includeAllMatching: boolean
) {
	const matched: string[] = []
	partialTargets.forEach(partialTarget => {
		for (const target of pkgNames) {
			if (target.match(partialTarget)) {
				matched.push(target)
				if (!includeAllMatching) {
					break
				}
			}
		}
	})
	if (matched.length) {
		return matched
	} else {
		console.error(
			`  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
				`Target ${chalk.underline(partialTargets)} not found!`
			)}`
		)
		console.log()

		process.exit(1)
	}
}

export async function runParallel(
	source: any,
	iteratorFn: (...args: any) => void
) {
	const maxConcurrency = cpus().length
	const ret: Promise<any>[] = []
	const executing: Promise<any>[] = []
	for (const item of source) {
		const p = Promise.resolve().then(() => iteratorFn(item, source))
		ret.push(p)

		if (maxConcurrency <= source.length) {
			const e: Promise<any> = p.then(() => {
				const e2 = executing.splice(executing.indexOf(e), 1)
				return e2
			})
			executing.push(e)
			if (executing.length >= maxConcurrency) {
				await Promise.race(executing)
			}
		}
	}
	return Promise.all(ret)
}
