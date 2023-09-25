import { extname } from 'node:path'
import { writeFile } from 'node:fs/promises'

import type { PluginOption } from 'vite'
import { debounce, merge, cloneDeep } from 'lodash-es'

import type {
	UsOptions,
	ResourceRecord,
	PkgDepsRecord,
	DepsRecord
} from '../types/types'

import { collectCssDependencies, resourcePath, pkg } from '../utils/utils'
import { getPkgCdnUrlsRecord } from '../cdn/cdn'
import { getGlobalNameFromUrl } from '../cdn/getNameOfCode'

class DepCollection {
	private regExclusion: RegExp
	private manuallyDeps: string[]

	private readonly collectDeps: string[] = []

	private readonly resource = {
		globalVariableNameRecord: {},
		external: [],
		categoryRecord: {}
	} as ResourceRecord

	private readonly pkgDeps = Object.keys(pkg.dependencies ?? {})
	private readonly regPkgDep = new RegExp(
		this.pkgDeps.join('|').replace(/|$/, '')
	)

	constructor(exclusions: string[], manuallyDeps: string[]) {
		this.regExclusion = new RegExp(exclusions.join('|').replace(/|$/, ''))
		this.manuallyDeps = manuallyDeps
	}

	private pushDep(id: string) {
		const isNotCollect = this.collectDeps.every(v => v !== id)
		if (isNotCollect) this.collectDeps.push(id)
	}

	public collectCssDep(id: string, type: 'collect' | 'prevent') {
		if (/node_modules/.test(id) && /css$/.test(id)) {
			if (type === 'collect') {
				this.pushDep(id)
				return null
			} else {
				return ''
			}
		}
	}

	public collectDep(code: string, id: string) {
		const isLocal = !/node_modules/.test(id)
		const isFile = !!extname(id)
		const isOriginalFile = id.split('?').length === 1

		if (!isLocal || !isFile || !isOriginalFile) return false

		const regPkg = /import[\s\d\w{},]+(?<quote>'|")(?<path>[^.].+?)\k<quote>/g

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

	private getExternal() {
		const external = this.pkgDeps.filter(v => {
			const isNotExclude = !this.regExclusion.test(v)
			return isNotExclude
		})
		return { external }
	}

	private getDepsRecord() {
		const pkgDepsRecord: PkgDepsRecord = {}

		this.collectDeps.forEach(v => {
			const pkgname = this.regPkgDep.exec(v)?.[0] as string

			if (!pkgDepsRecord[pkgname])
				pkgDepsRecord[pkgname] = { paths: [], version: '' }

			pkgDepsRecord[pkgname].version = pkg.dependencies?.[pkgname] as string

			if (pkgDepsRecord[pkgname].paths) pkgDepsRecord[pkgname].paths.push(v)
			else pkgDepsRecord[pkgname].paths = [v]
		})
		return { pkgDepsRecord }
	}

	async getGlobalNames(external: string[], urls: string[]) {
		const names: Record<string, string> = {}

		const records = external.map(pkgName => {
			const url = urls.filter(url => new RegExp(pkgName).test(url))[0]
			return { pkgName, url }
		})

		const res = await Promise.all(
			records.map(v => getGlobalNameFromUrl(v.pkgName, v.url))
		)

		res.forEach(v => (names[v.pkgName] = v.globalVariableName))

		return names
	}

	private classifyPath() {
		const categoryRecord: Record<string, DepsRecord[]> = {}

		this.collectDeps.forEach(v => {
			const ext = extname(v).replace('.', '') || 'js'
			categoryRecord[ext]
				? categoryRecord[ext]?.push(v)
				: (categoryRecord[ext] = [v])
		})

		return { categoryRecord }
	}

	public parsedep = debounce(async () => {
		const depsRecords = this.removeNodeModulesFromPath()
		const { external } = this.getExternal()
		const { pkgDepsRecord } = this.getPkgDepsRecord(depsRecords)
		const { depsRecordsWithCDN } = await getPkgCdnUrlsRecord(pkgDepsRecord)
		const { categoryRecord } = classifyPath(depsRecordsWithCDN)

		const jsUrls = categoryRecord?.js.map(v => v.cdnURL) || []

		const globalNames = await getGlobalNames(external, jsUrls)

		resource.external = [...resource.external, ...external]
		resource.globalVariableName = merge(
			resource.globalVariableName,
			globalNames
		)
		resource.categoryRecord = merge(resource.categoryRecord, categoryRecord)

		await writeFile(resourcePath, JSON.stringify(resource, null, 4), {
			encoding: 'utf-8'
		})

		depsRecordList = []
	}, 1500)
}

export function analyze(usOptions: Required<UsOptions>) {
	const exclusions = usOptions.build.external?.exclusions as string[]
	const manuallyDeps = usOptions.build.external?.resources?.map(v => v.pkgName)
	const depCollection = new DepCollection(exclusions, manuallyDeps || [])

	return {
		name: 'vite-plugin-us:analyze',
		enforce: 'pre',
		apply: 'serve',
		load(id) {
			return depCollection.collectCssDep(id, 'collect')
		},
		async transform(code, id) {
			if (usOptions.build?.external?.autoCDN) {
				depCollection.collectDep(code, id)
			}
		}
	} as PluginOption
}
