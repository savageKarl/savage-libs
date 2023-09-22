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

let exclude: string[]

let depsRecordList: DepsRecord[] = []
const deps = Object.keys(pkg.dependencies ?? {})
const regPkgDeps = new RegExp(deps.join('|').replace(/|$/, ''))

const resource = {
	globalVariableName: {},
	external: [],
	categoryRecord: {}
} as ResourceRecord

export function analyze(usOptions: Required<UsOptions>) {
	exclude = usOptions.build.external?.exclude as string[]

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

function enableCDN(usOptions: UsOptions, code: string, id: string) {
	if (usOptions?.build?.external?.cdn === 'auto') {
		collectPkgDeps(depsRecordList, code, id)
		parsePkgDeps()
	}
}

/** NPF, `depsRecordList` */
async function collectPkgDeps(
	depsRecordList: DepsRecord[],
	code: string,
	id: string
) {
	const isLocal = !/node_modules/.test(id)
	const isFile = !!extname(id)
	const isOriginalFile = id.split('?').length === 1

	if (!isLocal || !isFile || !isOriginalFile) return false
	const regPkg =
		/import( \{)? +(?<name>\b\w+\b)?( \})?( +from)? ? *(?<quote>'|")(?<path>[^.].+?)\k<quote>/g

	const matchAllResult = [...code.matchAll(regPkg)]

	// TODO need consider more variable import
	matchAllResult.forEach(v => {
		const importPath = v.groups?.path as string
		const importName = v.groups?.name
		const isInPkg = regPkgDeps.test(importPath)
		const isNotInsideList = depsRecordList.every(
			v => v.importPath !== importPath
		)
		if (isInPkg && isNotInsideList)
			depsRecordList.push({ importPath, importName })
	})
}

/** not pure function */
const parsePkgDeps = debounce(async () => {
	const depsRecords = removeNodeModulesFromPath(depsRecordList)
	const { external } = getExternal(depsRecords)
	const { pkgDepsRecord } = getPkgDepsRecord(depsRecords)
	const { depsRecordsWithCDN } = await getPkgCdnUrlsRecord(pkgDepsRecord)
	const { categoryRecord } = classifyPath(depsRecordsWithCDN)

	const jsUrls = categoryRecord?.js.map(v => v.importPath) || []

	const globalNames = await getGlobalNames(external, jsUrls)

	resource.external = [...resource.external, ...external]
	resource.globalVariableName = merge(resource.globalVariableName, globalNames)
	resource.categoryRecord = merge(resource.categoryRecord, categoryRecord)

	await writeFile(resourcePath, JSON.stringify(resource, null, 4), {
		encoding: 'utf-8'
	})

	depsRecordList = []
}, 1500)

function removeNodeModulesFromPath(depsRecordList: DepsRecord[]) {
	return cloneDeep(depsRecordList).map(v => {
		const splitArr = v.importPath.split('node_modules')
		v.importPath = (splitArr?.pop() as string).replace(/^\//, '')
		return v
	})
}

function getExternal(depsRecordList: DepsRecord[]) {
	const regExclude = new RegExp(exclude.join('|').replace(/|$/, ''))
	const external = depsRecordList
		.filter(v => {
			const isPkgName = deps.includes(v.importPath)
			const isNotExclude = !regExclude.test(v.importPath)
			return isPkgName && isNotExclude
		})
		.map(v => v.importPath)

	return { external }
}

function getPkgDepsRecord(depsRecordList: DepsRecord[]) {
	const pkgDepsRecord: PkgDepsRecord = {}
	depsRecordList.forEach(v => {
		const pkgname = regPkgDeps.exec(v.importPath)?.[0] as string

		if (!pkgDepsRecord[pkgname])
			pkgDepsRecord[pkgname] = { depsRecords: [], version: '' }

		pkgDepsRecord[pkgname].version = pkg.dependencies?.[pkgname] as string

		if (pkgDepsRecord[pkgname].depsRecords)
			pkgDepsRecord[pkgname].depsRecords.push(v)
		else pkgDepsRecord[pkgname].depsRecords = [v]
	})
	return { pkgDepsRecord }
}

/**
 *
 * @returns
 * `{ vue: 'Vue' }`
 */
async function getGlobalNames(external: string[], urls: string[]) {
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

function classifyPath(depsRecordList: DepsRecord[]) {
	const categoryRecord: Record<string, DepsRecord[]> = {}

	depsRecordList.forEach(v => {
		const ext = extname(v.importPath).replace('.', '') || 'js'
		categoryRecord[ext]
			? categoryRecord[ext]?.push(v)
			: (categoryRecord[ext] = [v])
	})

	return { categoryRecord }
}
