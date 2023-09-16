import { extname } from 'node:path'
import { writeFile } from 'node:fs/promises'

import type { PluginOption } from 'vite'
import { debounce, cloneDeep, merge } from 'lodash-es'

import type { UsOptions, Resource } from '../types/userscript'
import { collectCssDependencies, pkg, resourcePath } from '../utils'

let exclude: string[]

const ids = new Set<string>()
const dependencieList = Object.keys(pkg.dependencies ?? {})
const resource = {
	names: {},
	external: [],
	urls: {}
} as Resource

export function analyze(usOptions: Required<UsOptions>) {
	exclude = usOptions.build.external?.exclude as string[]

	return {
		name: 'vite-plugin-us:analyze',
		enforce: 'post',
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

/**
 * not pure function
 */
async function collectDependencies(code: string, id: string) {
	const isLocal = !/node_modules/.test(id)
	const isFile = !!extname(id)
	const isOriginalFile = id.split('?').length === 1
	const isNotAsset = /js|jsx|ts|tsx|vue/.test(extname(id).replace('.', ''))

	if (!isLocal || !isFile || !isOriginalFile || !isNotAsset) return false
	const reg =
		/import[\w\s\d{}@]*(?<quote>'|"|`)(?<path>[^.][\w\d@/.-]+)\k<quote>/g

	const matchAllResult = [...code.matchAll(reg)]

	matchAllResult.forEach(v => {
		const path = v.groups?.path as string
		const pkgname = path.split('/')[0]
		if (dependencieList.includes(pkgname) && extname(path) === '.css') {
			ids.add(path)
		}
		if (dependencieList.includes(pkgname) && !exclude.includes(pkgname)) {
			ids.add(path)
		}
	})
}

/**
 * not pure function
 */
const parseIds = debounce(async () => {
	const paths = await normalizePaths(ids)
	const external = await getExternal(paths)
	const pkgPaths = await getPkgPaths(paths)
	const pkgCdn = await getPkgCdn(pkgPaths)
	const classifiedPath = await classifyPath(await setCdnUrl(pkgPaths, pkgCdn))
	const globalNames = await getGolbalName(external, pkgCdn)

	resource.external = [...resource.external, ...external]
	resource.names = merge(resource.names, globalNames)
	resource.urls = merge(resource.urls, classifiedPath)

	await writeFile(resourcePath, JSON.stringify(resource), { encoding: 'utf-8' })

	ids.clear()
}, 1500)

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
	ids.forEach(id => (!/\//.test(id) ? external.push(id) : null))
	return [...new Set(external)]
}

async function getPkgPaths(ids: string[]) {
	const pkgPaths: Record<string, string[]> = {}
	ids.forEach(id => {
		const pkgname = id.split('/')[0]
		if (pkgPaths[pkgname]) pkgPaths[pkgname].push(id)
		else pkgPaths[pkgname] = [id]
	})
	return pkgPaths
}
/**
 *
 * @returns example`{ 'vue': 'https://unpkg.com' }`
 */
async function getPkgCdn(pkgPaths: Record<string, string[]>) {
	const pkgCdn: Record<string, string> = {}
	for (const pkg in pkgPaths) {
		pkgCdn[pkg] = await getFastCdn(pkg)
	}

	return pkgCdn
}

// 将在这里进行自动选择cdn
async function getFastCdn(pkgName: string) {
	// TODO auto test cdn speed and choose cdn
	return 'https://unpkg.com'
}

async function getGolbalName(
	external: string[],
	pkgcdn: Record<string, string>
) {
	const names: Record<string, string> = {}

	external.forEach(v => {
		const url = `${pkgcdn[v]}/${v}`
		// TODO use ast to analyze global name
		if (v === 'vue') names[v] = 'Vue'
		else names[v] = v
	})

	return names
}

async function setCdnUrl(
	pkgPaths: Record<string, string[]>,
	pkgcdn: Record<string, string>
) {
	const _pkgPaths = cloneDeep(pkgPaths)
	for (const k in _pkgPaths) {
		_pkgPaths[k] = _pkgPaths[k].map(p => `${pkgcdn[k]}/${p}`)
	}
	return _pkgPaths
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
