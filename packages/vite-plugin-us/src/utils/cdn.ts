import axios from 'axios'

import {
	PkgRecord,
	JsdelivrPkgPathInfo,
	NpmmirrorPkgPathInfo,
	PkgPathInfo,
	isJsdelivrPkgPathInfo,
	isNpmmirrorPkgPathInfo
} from '../types/types'

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

let cdnFastest: string
let cdnType: 'without' | 'within'

getFastCdn().then(res => {
	cdnFastest = res
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

function getPkgJsonAndDirectoryUrl(pkgName: string, version: string) {
	const isWithout = cdnType === 'without'
	const cdnOrigin = isWithout ? without[0] : widthin[0]
	const jsdelivrDirectoryOrigin = 'https://data.jsdelivr.com/v1/packages/npm/'

	let pkgJsonUrl = ''
	let filesDirectoryUrl = ''

	if (isWithout) {
		pkgJsonUrl = `${cdnOrigin}/${pkgName}@${version}/package.json`
		filesDirectoryUrl = `${jsdelivrDirectoryOrigin}/${pkgName}@${version}`
	} else {
		pkgJsonUrl = `${cdnOrigin}/${pkgName}/${version}/files/package.json`
		filesDirectoryUrl = `${cdnOrigin}/${pkgName}/${version}/files?meta`
	}

	return {
		pkgJsonUrl,
		filesDirectoryUrl
	}
}

// async function analyzePkgInfo(params: type) {}

async function getPkgPathList(directoryInfo: PkgPathInfo) {
	const strategy = {
		without: parseJsDelivrPathInfo,
		within: parseNpmmirrorPathInfo
	}

	return strategy[cdnType](directoryInfo)
}

function parseJsDelivrPathInfo(
	pathInfo: JsdelivrPkgPathInfo,
	upperLevernName?: string
) {
	const paths: string[] = []

	if (pathInfo.type === 'file' || pathInfo.type === 'npm') {
		paths.push(
			upperLevernName ? `${upperLevernName}/${pathInfo.name}` : pathInfo.name
		)
	}

	if (pathInfo.type === 'directory' || pathInfo.type === 'npm') {
		pathInfo.files.forEach(v =>
			paths.push(...parseJsDelivrPathInfo(v, pathInfo.name))
		)
	}

	return paths
}
function parseNpmmirrorPathInfo(pathInfo: NpmmirrorPkgPathInfo) {
	const paths: string[] = []

	if (pathInfo.type === 'file') {
		paths.push(pathInfo.path)
	}

	if (pathInfo.type === 'directory') {
		pathInfo.files.forEach(v => paths.push(...parseNpmmirrorPathInfo(v)))
	}

	return paths
}

async function setCdnUrlWithPkg(
	pkgName: string,
	urls: string[],
	version: string
) {
	const { pkgJsonUrl, filesDirectoryUrl } = await getPkgJsonAndDirectoryUrl(
		pkgName,
		version
	)

	const [pkg, directoryInfo] = await Promise.all([
		axios.get(pkgJsonUrl),
		axios.get(filesDirectoryUrl)
	])

	// const pkg = await axios.get(pkgJsonUrl)
	// const directoryInfo =

	// const res = await getPkgPathList(pkgName, version)
	// return { urls }
}

export async function getPkgCdnUrlsRecord(pkgRecord: PkgRecord) {
	const pkgUrlsRecord = {} as Record<string, string[]>

	for (const pkgName in pkgRecord) {
		const { urls } = await setCdnUrlWithPkg(
			pkgName,
			pkgRecord[pkgName].paths,
			pkgRecord[pkgName].version
		)
		pkgUrlsRecord[pkgName] = urls
	}
	return pkgUrlsRecord
}
