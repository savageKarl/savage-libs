import axios from 'axios'

import type { PkgInfo } from '../types/types'

axios.interceptors.response.use(
	response => response,
	err => Promise.resolve(err)
)

// @ts-ignore
// eslint-disable-next-line dot-notation
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const without = [
	// https://www.jsdelivr.com/
	'https://cdn.jsdelivr.net/npm/',
	// https://unpkg.com/
	'https://unpkg.com',
	// https://cdnjs.com/libraries
	'https://cdnjs.cloudflare.com'
]

const widthin = [
	// https://cnpmweb.vercel.app/
	'https://registry.npmmirror.com',
	// https://cdn.bytedance.com/
	'https://lf9-cdn-tos.bytecdntp.com',
	// https://www.bootcdn.cn/
	'https://cdn.bootcdn.net',
	// https://lib.baomitu.com/
	'https://lib.baomitu.com',
	// https://staticfile.org
	'https://cdn.staticfile.org'
]

const urls = [...without, ...widthin]

let cdn: string
let cdnType: 'without' | 'within'

getFastCdn().then(res => {
	cdn = res
	cdnType = getCdnType(res)
})

async function getFastCdn() {
	const winner = await Promise.race([...urls.map(v => axios.options(v))])
	return winner.config.url as string
}

function getCdnType(cdn: string) {
	let type: 'without' | 'within' = 'without'
	if (without.includes(cdn)) type = 'without'
	if (widthin.includes(cdn)) type = 'within'
	return type
}

// function jointUrl(pkgName: string, version: string) {

// }

async function getPkgJsonAndFilesPathUrl(pkgName: string, version: string) {
	const isWithout = cdnType === 'without'
	const origin = isWithout ? without[0] : widthin[0]
	const jsdelivrDirectoryOrigin = 'https://data.jsdelivr.com/v1/packages/npm/'

	let pkgJsonUrl = ''
	let filesDirectoryUrl = ''
	if (isWithout) {
		pkgJsonUrl = `${origin}/${pkgName}@${version}/package.json`
		filesDirectoryUrl = `${jsdelivrDirectoryOrigin}/${pkgName}@${version}`
	} else {
		pkgJsonUrl = `${origin}/${pkgName}/${version}/files/package.json`
		filesDirectoryUrl = `${origin}/${pkgName}/${version}/files?meta`
	}

	return {
		pkgJsonUrl,
		filesDirectoryUrl
	}
}

async function getPkgPathList(pkgName: string, version: string) {}

function setCdnUrlWithPkg(pkgName: string, paths: string[], version: string) {
	// const pkg
	return { pkgName, paths }
}

export async function getPkgPathsWithCdn(pkgInfo: PkgInfo) {
	const pkgPaths = {} as Record<string, string[]>
	for (const k in pkgInfo) {
		pkgPaths[k] = pkgInfo[k].paths.map(p => `${cdn}/${p}`)
	}
	return pkgPaths
}
