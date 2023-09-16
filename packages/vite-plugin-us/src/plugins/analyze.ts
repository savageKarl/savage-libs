import { extname } from 'node:path'

import type { PluginOption } from 'vite'
import { debounce } from 'lodash-es'

import { UsOptions } from '../types/userscript'
import { collectCssDependencies, pkg } from '../utils'

interface Resource {
	names: Record<string, string>
	external: string[]
	cssPaths: string[]
	jsPaths: string[]
}

let exclude: string[]

const ids = new Set<string>()
const dependencieList = Object.keys(pkg.dependencies ?? {})
const resource = {} as Resource

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

	if (!isLocal || !isFile || !isOriginalFile) return false

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
	console.log(ids)
	const paths = await normalizePaths(ids)
	const external = await getExternal(paths)
	const pkgPath = await getPkgPath(paths)
	const classifiedPath = await classifyPath(await setCdnUrl(pkgPath))

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

async function getPkgPath(ids: string[]) {
	const pkgPath: Record<string, string[]> = {}
	ids.forEach(id => {
		const pkgname = id.split('/')[0]
		if (pkgPath[pkgname]) pkgPath[pkgname].push(id)
		else pkgPath[pkgname] = [id]
	})
	return pkgPath
}

async function setCdnUrl(pkgPath: Record<string, string[]>) {
	return pkgPath
}

async function classifyPath(pkgPath: Record<string, string[]>) {
	const pathCategory: Record<string, string[]> = {}
	for (const k in pkgPath) {
		const paths = pkgPath[k]
		paths.forEach(p => {
			const ext = extname(p) || 'js'
			pathCategory[ext]
				? pathCategory[ext]?.push(p.replace('.', ''))
				: (pathCategory[ext] = [p])
		})
	}

	return pathCategory
}
