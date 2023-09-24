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

class PkgDepsCollection {
	exclusions: string[]
	regExclusions: RegExp

	readonly depCollections: string[] = []

	readonly resource = {
		globalVariableNameRecord: {},
		external: [],
		categoryRecord: {}
	} as ResourceRecord

	readonly deps = Object.keys(pkg.dependencies ?? {})
	readonly regPkgDep = new RegExp(this.deps.join('|').replace(/|$/, ''))

	constructor(exclusions: string[]) {
		this.exclusions = exclusions
		this.regExclusions = new RegExp(exclusions.join('|').replace(/|$/, ''))
	}

	async collectPkgDeps(code: string, id: string) {
		const isLocal = !/node_modules/.test(id)
		const isFile = !!extname(id)
		const isOriginalFile = id.split('?').length === 1

		if (!isLocal || !isFile || !isOriginalFile) return false

		const regPkg = /import[\s\d\w{},]+(?<quote>'|")(?<path>[^.].+?)\k<quote>/g

		const matchAllResult = [...code.matchAll(regPkg)]

		matchAllResult.forEach(v => {
			const importPath = v.groups?.path as string

			const isInPkg = this.regPkgDep.test(importPath)
			const isNotInsideList = this.deps.every(v => v !== importPath)
			const isNotExclude = !this.regExclusions.test(importPath)
			const isCssFile = extname(importPath) === '.css'
			const isJsFile = extname(importPath) === ''

			if (isInPkg && isNotInsideList && isNotExclude && (isCssFile || isJsFile))
				this.depCollections.push(importPath)
		})
	}

	removeNodeModulesFromPath() {
		return [...this.depCollections].map(v => {
			const splitArr = v.split('node_modules')
			v = (splitArr.pop() as string).replace(/^\//, '')
			return v
		})
	}

	getExternal() {
		const external = this.deps.filter(v => {
			const isNotExclude = !this.regExclusions.test(v)
			return isNotExclude
		})

		return { external }
	}

	getPkgDepsRecord() {
		const pkgDepsRecord: PkgDepsRecord = {}
		this.depCollections.forEach(v => {
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

	classifyPath() {
		const categoryRecord: Record<string, DepsRecord[]> = {}

		depsRecordList.forEach(v => {
			const ext = extname(v.cdnURL).replace('.', '') || 'js'
			categoryRecord[ext]
				? categoryRecord[ext]?.push(v)
				: (categoryRecord[ext] = [v])
		})

		return { categoryRecord }
	}

	parsePkgDeps = debounce(async () => {
		const depsRecords = removeNodeModulesFromPath(depsRecordList)
		const { external } = getExternal()
		const { pkgDepsRecord } = getPkgDepsRecord(depsRecords)
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

	const pkgDeps = new PkgDepsCollection(exclusions)

	return {
		name: 'vite-plugin-us:analyze',
		enforce: 'pre',
		apply: 'serve',
		load(id) {
			return collectCssDependencies(id, depsRecordList)
		},
		async transform(code, id) {
			enableCDN(usOptions, code, id)
		}
	} as PluginOption
}

// function enableCDN(usOptions: UsOptions, code: string, id: string) {
// 	if (usOptions.build?.external?.autoCDN) {
// 		collectPkgDeps(depsRecordList, code, id)
// 		parsePkgDeps()
// 	}
// }
