import { extname } from 'node:path'
import { writeFile } from 'node:fs/promises'

import type { PluginOption } from 'vite'
import { debounce, cloneDeep, merge } from 'lodash-es'

import type { UsOptions } from '../types/userscript'
import type { ResourceRecord, DeepRequired, PkgInfo } from '../types/types'
import { collectCssDependencies, pkg, resourcePath } from '../utils/utils'
import { getFastCdn } from '../utils/cdn'
import { getGlobalNameFromUrl } from '../utils/getNameOfCode'

let exclude: string[]

const ids = new Set<string>()
const dependenciesList = Object.keys(pkg.dependencies ?? {})
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
	const fastCdn = await getFastCdn()
	const classifiedPath = await classifyPath(
		await getPkgPathsWithCdn(pkgInfo, fastCdn)
	)

	const globalNames = await getGlobalNames(external, classifiedPath.js || [])

	resource.external = [...resource.external, ...external]
	resource.names = merge(resource.names, globalNames)
	resource.urls = merge(resource.urls, classifiedPath)
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
	const pkgInfo: PkgInfo = {}
	ids.forEach(id => {
		const pkgname = regPkg.exec(id)?.[0] as string
		pkgInfo[pkgname].version = pkg.dependencies?.[pkgname] as string
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

	const records = external.map(v => {
		const url = urls.filter(u => new RegExp(v).test(u))[0]
		return [v, url]
	})

	const res = await Promise.all(
		records.map(v => getGlobalNameFromUrl(v[0], v[1]))
	)

	res.forEach(v => (names[v[0]] = v[1]))

	return names
}

async function getPkgPathsWithCdn(pkgInfo: PkgInfo, cdn: string) {
	// TODO auto find url
	const pkgPaths = {} as Record<string, string[]>
	for (const k in pkgInfo) {
		pkgPaths[k] = pkgInfo[k].paths.map(p => `${cdn}/${p}`)
	}
	return pkgPaths
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
