import fs from 'node:fs'

import { readdir, readFile, writeFile } from 'node:fs/promises'

import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import minimist from 'minimist'
import spawn from 'cross-spawn'

import pico from 'picocolors'

import type { IPackageJson } from '@ts-type/package-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const require = createRequire(import.meta.url)
export const packagesRoot = resolve(__dirname, '../packages')
export const projectRoot = resolve(packagesRoot, '..')

export function getFullpath(pkgName: string, subPath = 'src/index.ts') {
	return normalizePath(resolve(packagesRoot, pkgName, subPath))
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

export function replaceTemplateVariable(
	template: string,
	variableRecord: Record<string, string>
) {
	return Object.keys(variableRecord).reduce(
		(preV, curV) => preV.replaceAll(`[${curV}]`, variableRecord[curV]),
		template
	)
}

export function getPkgJson(path: string) {
	return require(path) as Required<IPackageJson>
}

export const getCompleteTemplate = (() => {
	const templateRecord: Record<string, string> = {}

	return async function (names: string[]) {
		if (Object.keys(templateRecord).length === 0) {
			const templatePath = resolve(process.cwd(), 'scripts/templates')
			const files = await readdir(templatePath)

			const removeExt = (name: string) => name.replace(/\.\w+$/, '')

			;(
				await Promise.all(
					files.map(f =>
						readFile(resolve(templatePath, f), { encoding: 'utf-8' })
					)
				)
			).map((v, i) =>
				Object.assign(templateRecord, {
					[removeExt(files[i])]: v
				})
			)
		}

		return names
			.reduce((preV, curV) => preV.concat(templateRecord[curV]), [] as string[])
			.join('\n')
	}
})()

export function normalizePath(path: string) {
	return path.replaceAll('\\', '/')
}

export function generateFiles(pathRecord: Record<string, string>) {
	for (let [path, content] of Object.entries(pathRecord)) {
		path = normalizePath(path)

		const dirs = path
			.split('/')
			.map((v, i, arr) => arr.slice(0, i).join('/'))
			.filter((v, i, arr) => i !== 0 && i !== 1 && i !== arr.length)

		const index = dirs.reduce((preV, curV, i, arr) => {
			const status = fs.existsSync(curV)
			if (status) return arr.length
			else return i
		}, 0)

		if (index !== dirs.length) {
			dirs.slice(index).forEach(path => fs.mkdirSync(path))
		}

		writeFile(path, content, { encoding: 'utf-8' })
	}
}
