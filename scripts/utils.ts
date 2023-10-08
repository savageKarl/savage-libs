import fs from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

import pico from 'picocolors'
import spawn from 'cross-spawn'

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

export function getChangedPkgNames() {
	const result = spawn.sync('git', ['status', '-s'])
	const stdout = result.stdout.toString()

	const matchs = [...stdout.matchAll(/\bpackages\/(?<pkgName>[\w-]+)\//g)]
	const pkgNames = [...new Set(matchs.map(v => v.groups?.pkgName))]
	return pkgNames as string[]
}

export function fuzzyMatchPkgName(partialPkgNames: string[]) {
	const matchResult = pkgNames.filter(name => {
		return partialPkgNames.some(v => name.match(v))
	})

	if (matchResult.length) return matchResult

	console.error(
		`  ${pico.bgRed(pico.white(' ERROR '))} ${pico.red(
			`Target pkgName ${pico.underline(
				JSON.stringify(partialPkgNames)
			)} not found!`
		)}`
	)

	process.exit(1)
}
