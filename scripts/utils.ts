import fs from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import minimist from 'minimist'

import pico from 'picocolors'
import spawn from 'cross-spawn'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const require = createRequire(import.meta.url)
export const packagesRoot = resolve(__dirname, '../packages')

export function getFullpath(pkgName: string, subPath = 'src/index.ts') {
	return resolve(packagesRoot, pkgName, subPath).replaceAll('\\', '/')
}

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

	return [...new Set(matchs.map(v => v.groups?.pkgName))].filter(name =>
		pkgNames.includes(name as string)
	) as string[]
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

export function getFilesByFolderSync(folerPath: string) {
	const files: string[] = []
	fs.readdirSync(folerPath).forEach(f => {
		const fullpath = resolve(folerPath, f)
		const stat = fs.statSync(fullpath)
		if (!stat.isDirectory()) {
			files.push(fullpath)
		} else {
			files.push(...getFilesByFolderSync(fullpath))
		}
	})

	return files
}

export function resolveCliOption(process: NodeJS.Process) {
	const argv = minimist(process.argv.slice(2))

	const targetPkgNames: string[] = (argv.t || argv.target)?.split(',') || []
	const watch: boolean = argv.watch || argv.w
	const all: boolean = argv.all || argv.a
	const mode: 'dev' | 'preview' | 'build' = argv.mode || argv.m

	return {
		targetPkgNames,
		watch,
		all,
		mode
	}
}

export function resolveTargetPkgNames(targetPkgNames: string[], all: boolean) {
	if (all) return pkgNames

	if (targetPkgNames.length) return fuzzyMatchPkgName(targetPkgNames)

	return getChangedPkgNames()
}
