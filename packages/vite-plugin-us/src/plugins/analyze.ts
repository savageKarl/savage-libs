import { extname } from 'node:path'
import { writeFile } from 'node:fs/promises'

import type { PluginOption } from 'vite'
import { debounce, merge } from 'lodash-es'

import type { UsOptions } from '../types/userscript'
import type { ResourceRecord, DeepRequired, PkgRecord } from '../types/types'
import { collectCssDependencies, getPkg, resourcePath } from '../utils/utils'
import { getPkgCdnUrlsRecord } from '../cdn/cdn'
import { getGlobalNameFromUrl } from '../cdn/getNameOfCode'

let exclude: string[]

const ids = new Set<string>()
const dependenciesList = Object.keys(getPkg.dependencies ?? {})
const regPkg = new RegExp(dependenciesList.join('|').replace(/|$/, ''))

const resource = {
	names: {},
	external: [],
	urls: {}
} as ResourceRecord

export function analyze(usOptions: DeepRequired<UsOptions>) {
	exclude = usOptions.build.external?.exclude as string[]

	return {
		name: 'vite-plugin-us:analyze',
		enforce: 'pre',
		apply: 'serve',
		load(id) {
			return collectCssDependencies(id, ids)
		},
		async transform(code, id) {
			if (usOptions.build.external?.cdn === 'auto') {
				collectDependencies(code, id)
				parseIds()
			}
		}
	} as PluginOption
}

/** not pure function */
async function collectDependencies(code: string, id: string) {
	const isLocal = !/node_modules/.test(id)
	const isFile = !!extname(id)
	const isOriginalFile = id.split('?').length === 1
	const isNotAsset = /js|jsx|ts|tsx|vue/.test(extname(id).replace('.', ''))

	if (!isLocal || !isFile || !isOriginalFile || !isNotAsset) return false
	// TODO maybe need to collect export variable name
	const reg =
		/import[\w\s\d{}@]*(?<quote>'|"|`)(?<path>[^.][\w\d@/.-]+)\k<quote>/g

	const matchAllResult = [...code.matchAll(reg)]

	matchAllResult.forEach(v => {
		const path = v.groups?.path as string
		const isInPkg = regPkg.test(path)
		if (isInPkg) ids.add(path)
	})
}

/** not pure function */
const parseIds = debounce(async () => {
	const paths = await normalizePaths(ids)
	const external = await getExternal(paths)
	const pkgInfo = await getPkgInfo(paths)
	const pkgCdnUrl = await getPkgCdnUrlsRecord(pkgInfo)
	const classifiedUrls = await classifyPath(pkgCdnUrl)

	const globalNames = await getGlobalNames(external, classifiedUrls.js || [])

	resource.external = [...resource.external, ...external]
	resource.names = merge(resource.names, globalNames)
	resource.urls = merge(resource.urls, classifiedUrls)
	// TODO handle resources
	await writeFile(resourcePath, JSON.stringify(resource), { encoding: 'utf-8' })

	ids.clear()
}, 2000)

async function normalizePaths(ids: Set<string>) {
	const paths: string[] = []
	ids.forEach(id => {
		const splitArr = id.split('node_modules')
		paths.push(splitArr[splitArr.length - 1].replace(/^\//, ''))
	})
	return [...new Set(paths)]
}

async function getExternal(ids: string[]) {
	const external: string[] = []
	const regExclude = new RegExp(exclude.join('|').replace(/|$/, ''))

	ids.forEach(id => {
		const isPkgName = dependenciesList.includes(id)
		const isNotExclude = !regExclude.test(id)
		if (isPkgName && isNotExclude) external.push(id)
	})
	return [...new Set(external)]
}

async function getPkgInfo(ids: string[]) {
	const pkgInfo: PkgRecord = {}
	ids.forEach(id => {
		const pkgname = regPkg.exec(id)?.[0] as string
		pkgInfo[pkgname].version = getPkg.dependencies?.[pkgname] as string
		if (pkgInfo[pkgname].paths) pkgInfo[pkgname].paths.push(id)
		else pkgInfo[pkgname].paths = [id]
	})
	return pkgInfo
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

async function classifyPath(pkgPaths: Record<string, string[]>) {
	const pathCategory: Record<string, string[]> = {}
	for (const k in pkgPaths) {
		const paths = pkgPaths[k]
		paths.forEach(p => {
			const ext = extname(p).replace('.', '') || 'js'
			pathCategory[ext] ? pathCategory[ext]?.push(p) : (pathCategory[ext] = [p])
		})
	}

	return pathCategory
}
