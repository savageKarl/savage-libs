import { extname } from 'node:path'
import { writeFile } from 'node:fs/promises'

import { debounce, merge } from 'lodash-es'

import type { ResourceRecord, PkgDepsRecord, DepRecord } from '../types/types'

import { resourcePath, pkg } from './constants'
import { cdn } from '../cdn/cdn'
import { logger } from './logger'

export class DepCollection {
	private regExclusion: RegExp
	private manuallyDeps: string[]
	private manuallyResources: DepRecord[]

	private collectDeps: string[] = []

	private readonly resourceRecord = {
		globalVariableNameRecord: {},
		externals: [],
		categoryRecord: {}
	} as ResourceRecord

	private readonly pkgDeps = Object.keys(pkg.dependencies ?? {})
	private readonly regPkgDep = new RegExp(this.pkgDeps.join('|'))

	constructor(exclusions: string[], manuallyResources: DepRecord[]) {
		this.regExclusion = new RegExp(exclusions.join('|'))
		this.manuallyResources = manuallyResources

		this.manuallyDeps = manuallyResources.map(v => v.pkgName)
	}

	private pushDep(id: string) {
		const isNotCollect = this.collectDeps.every(v => v !== id)
		if (isNotCollect) this.collectDeps.push(id)
	}

	public collectCssDep(id: string) {
		if (/node_modules/.test(id) && /css$/.test(id)) {
			this.pushDep(id)
			return null
		}
	}

	public collectDep(code: string, id: string) {
		const isLocal = !/node_modules/.test(id)
		const isFile = !!extname(id)
		const isOriginalFile = id.split('?').length === 1

		if (!isLocal || !isFile || !isOriginalFile) return false

		const regPkg = /import[\s\d\w{},]+(?<quote>'|")(?<path>[^./].+?)\k<quote>/g

		const matchAllResult = [...code.matchAll(regPkg)]

		matchAllResult.forEach(v => {
			const importPath = v.groups?.path as string

			const isInPkg = this.regPkgDep.test(importPath)
			const isNotExclude = !this.regExclusion.test(importPath)
			const isCssFile = extname(importPath) === '.css'
			const isJsFile = extname(importPath) === ''
			const isNotManualy = !this.manuallyDeps.includes(importPath)

			if (isInPkg) {
				if (isCssFile || (isJsFile && isNotExclude && isNotManualy)) {
					return this.pushDep(importPath)
				}
			}
		})
	}

	private removeNodeModulesFromPath() {
		return [...this.collectDeps].map(v => {
			const splitArr = v.split('node_modules')
			v = (splitArr.pop() as string).replace(/^\//, '')
			return v
		})
	}

	private getExternals(depsRecords: DepRecord[]) {
		const external = depsRecords
			.filter(v => extname(v.url) === '.js')
			.map(v => v.pkgName)
		return external
	}

	private getPkgNameByPath(path: string) {
		let pkgNmae: string
		const splitArr = path.split('/')
		if (/^@/.test(path)) {
			pkgNmae = [splitArr[0], splitArr[1]].join('/')
		} else {
			pkgNmae = splitArr[0]
		}

		return pkgNmae
	}

	private getPkgDepsRecord(paths: string[]) {
		const pkgDepsRecord: PkgDepsRecord = {}

		paths.forEach(v => {
			const pkgname = this.getPkgNameByPath(v)

			if (!pkgDepsRecord[pkgname])
				pkgDepsRecord[pkgname] = { paths: [], version: '' }

			pkgDepsRecord[pkgname].version = pkg.dependencies?.[pkgname] as string

			if (pkgDepsRecord[pkgname].paths) pkgDepsRecord[pkgname].paths.push(v)
			else pkgDepsRecord[pkgname].paths = [v]
		})
		return { pkgDepsRecord }
	}

	private async getVariableNameRecord(depsRecords: DepRecord[]) {
		const names = depsRecords
			.filter(v => extname(v.url) === '.js')
			.map(v => ({ [v.pkgName]: v.globalVariableName }))
			.reduce(
				(preValue, curValue) => Object.assign(preValue, curValue),
				{} as Record<string, string>
			)

		return names
	}

	private getExtByUrl(url: string) {
		let ext = extname(url).replace('.', '')

		if (/data:application\/javascript/.test(url)) ext = 'js'

		return ext
	}

	private classifyUrl(depRecords: DepRecord[]) {
		const categoryRecord: Record<string, DepRecord[]> = {}
		depRecords.forEach(v => {
			const ext = this.getExtByUrl(v.url)
			categoryRecord[ext]
				? categoryRecord[ext]?.push(v)
				: (categoryRecord[ext] = [v])
		})

		return { categoryRecord }
	}

	public resovleDep = debounce(async () => {
		logger.info('Collecting dependencies for automated CDN...', { time: true })

		const paths = this.removeNodeModulesFromPath()
		const { pkgDepsRecord } = this.getPkgDepsRecord(paths)
		const depsRecords = this.manuallyResources.concat(
			await cdn.getDepsRecords(pkgDepsRecord)
		)
		const { categoryRecord } = this.classifyUrl(depsRecords)

		const globalNames = await this.getVariableNameRecord(depsRecords)

		this.resourceRecord.externals = this.resourceRecord.externals.concat(
			this.getExternals(depsRecords)
		)
		this.resourceRecord.globalVariableNameRecord = merge(
			this.resourceRecord.globalVariableNameRecord,
			globalNames
		)
		this.resourceRecord.categoryRecord = merge(
			this.resourceRecord.categoryRecord,
			categoryRecord
		)

		await writeFile(
			resourcePath,
			JSON.stringify(this.resourceRecord, null, 4),
			{
				encoding: 'utf-8'
			}
		)

		this.collectDeps = []
		this.manuallyResources = []

		logger.info('Dependencies used for automated CDNs are resolved.', {
			time: true
		})
		if (categoryRecord.js) {
			console.table(categoryRecord.js.filter(v => extname(v.url) === '.js'))
		}
	}, 100)
}
