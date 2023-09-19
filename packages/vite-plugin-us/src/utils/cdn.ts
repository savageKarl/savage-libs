import path, { extname } from 'node:path'

import axios from 'axios'

import { getSingle } from 'savage-utils'

import {
	PkgRecord,
	JsdelivrPkgPathInfo,
	NpmmirrorPkgPathInfo,
	PkgPathInfo,
	PkgCDN,
	ItemCDN
} from '../types/types'

import { seekPkgMainPath } from './seekPkgMainPath'
import { jsdelivr, npmmirror, usedCdnList } from './useCdn'
import { Chain } from './chain'

const serviceCDN = axios.create({
	headers: {
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.62'
	}
})

// serviceCDN.interceptors.response.use(
// 	response => response,
// 	err => {
// 		if (err.config.method === 'options') return Promise.resolve(err)
// 		else return Promise.reject(err)
// 	}
// )

class CDN {
	private list: Required<ItemCDN>[] = []
	private leadingForignCDN = {} as ItemCDN
	private leadingDomesticCDN = {} as ItemCDN
	private fastest = {} as ItemCDN

	public use(options: ItemCDN | ItemCDN[]) {
		const defaultOptions = {
			range: 'domestic',
			provideMinify: true,
			useAt: false,
			addFilesFolder: false,
			removeDistPath: true
		} as Required<ItemCDN>

		if (Array.isArray(options)) {
			options = options.map(v => Object.assign(defaultOptions, v))
			this.list.push(...(options as Required<ItemCDN>[]))
		} else {
			this.list.push(Object.assign(defaultOptions, options))
		}
	}

	public setLeadingCDN(itemCDN: ItemCDN, type: 'domestic' | 'foreign') {
		if (type === 'domestic') this.leadingDomesticCDN = itemCDN
		if (type === 'foreign') this.leadingForignCDN = itemCDN
	}

	private getCdnRange = getSingle(async () => {
		const winner = await Promise.race([...this.list.map(v => axios.get(v.url))])
		return this.list.filter(v => v.url === winner.config.url)[0].range
	})

	private async getFastest(pkgName: string, version: string) {
		const urls: string[] = []
		this.list.forEach(item => {
			this.fastest = item
			urls.push(...this.spliceUrl(pkgName, ['package.json'], version))
		})

		const winner = await Promise.race(urls.map(url => axios.get(url)))

		this.fastest = this.list.filter(v => v.url === winner.config.url)[0]
	}

	spliceUrl(pkgName: string, paths: string[], version: string) {
		const urls: string[] = []
		paths.forEach(p => {
			const splitPath: string[] = []

			splitPath.push(`${this.fastest.url}/${pkgName}`)
			splitPath.push(this.fastest.useAt ? '@' : '/')
			splitPath.push(`${version}/`)
			if (this.fastest.addFilesFolder) splitPath.push('files/')
			if (this.fastest.removeDistPath) p = p.replace('dist/', '')
			if (this.fastest.provideMinify) {
				splitPath.push(p.replace(/(\.css|\.js)/, '.min$1'))
			}

			urls.push(splitPath.join(''))
		})
		return urls
	}

	public async getPkgJsonAndDirectoryContent(pkgName: string, version: string) {
		const range = this.getCdnRange()
		const jsdelivrDirectoryOrigin = 'https://data.jsdelivr.com/v1/packages/npm/'

		const isDomestic = (await range) === 'domestic'

		let pkgJsonUrl = ''
		let filesDirectoryUrl = ''

		if (isDomestic) {
			pkgJsonUrl = `${this.leadingDomesticCDN.url}/${pkgName}/${version}/files/package.json`
			filesDirectoryUrl = `${this.leadingDomesticCDN.url}/${pkgName}/${version}/files?meta`
		} else {
			pkgJsonUrl = `${this.leadingForignCDN.url}/${pkgName}@${version}/package.json`
			filesDirectoryUrl = `${jsdelivrDirectoryOrigin}/${pkgName}@${version}`
		}

		const [pkg, directoryInfo] = await Promise.all([
			serviceCDN.get(pkgJsonUrl),
			serviceCDN.get(filesDirectoryUrl)
		])

		return {
			pkg,
			directoryInfo
		}
	}

	public async getPkgPathList(directoryInfo: PkgPathInfo) {
		const cdnType = await this.getCdnRange()
		const strategy = {
			foreign: parseJsDelivrPathInfo,
			domestic: parseNpmmirrorPathInfo
		}

		return strategy[cdnType](directoryInfo)
	}
}

const cdn = new CDN()
cdn.setLeadingCDN(jsdelivr, 'foreign')
cdn.setLeadingCDN(npmmirror, 'domestic')
cdn.use(usedCdnList)

// @ts-ignore
// eslint-disable-next-line dot-notation
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

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
	paths: string[],
	version: string
) {
	const urls: string[] = []

	const { pkg, directoryInfo } = await cdn.getPkgJsonAndDirectoryContent(
		pkgName,
		version
	)

	const allPaths = await cdn.getPkgPathList(
		directoryInfo as unknown as PkgPathInfo
	)

	paths.forEach(async p => {
		if (p === pkgName) {
			urls.push(await seekPkgMainPath(pkg as unknown as PkgCDN, allPaths))
		} else {
			urls.push(p)
		}
	})

	return { urls }
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
