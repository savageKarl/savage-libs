import {
	PkgRecord,
	JsdelivrPkgPathInfo,
	NpmmirrorPkgPathInfo,
	PkgPathInfo,
	PkgCDN,
	ItemCDN
} from '../types/types'

import { seekPkgMainPath } from './seekPkgMainPath'
import { usedCdnList } from './useCdn'
import { serviceCDN } from './service'

class CDN {
	private list: Required<ItemCDN>[] = []
	private leadingForignCDN = {} as Required<ItemCDN>
	private leadingDomesticCDN = {} as Required<ItemCDN>
	private fastest = {} as Required<ItemCDN>

	public use(options: ItemCDN | ItemCDN[]) {
		const defaultOptions = {
			range: 'domestic',
			provideMinify: true,
			useAt: false,
			addFilesFolder: false,
			removeDistPath: true,
			isLeading: false
		} as Required<ItemCDN>

		const list = (
			Array.isArray(options) ? options : [options]
		) as Required<ItemCDN>[]

		list.forEach(v => {
			Object.assign(defaultOptions, v)
			if (v.isLeading) {
				if (v.range === 'domestic') this.leadingDomesticCDN = v
				if (v.range === 'foreign') this.leadingForignCDN = v
			}
		})
		this.list.push(...(list as Required<ItemCDN>[]))
	}

	private async getFastest(pkgName: string, version: string) {
		const urls: string[] = []
		this.list.forEach(item => {
			this.fastest = item
			urls.push(...this.spliceUrl(pkgName, ['package.json'], version))
		})

		const winner = await Promise.race(urls.map(url => serviceCDN.get(url)))

		this.fastest = this.list.filter(v => v.url === winner.config.url)[0]
		return this.fastest
	}

	public spliceUrl(pkgName: string, paths: string[], version: string) {
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
		const fastestCDN = await this.getFastest(pkgName, version)
		const range = fastestCDN.range

		const jsdelivrDirectoryOrigin = 'https://data.jsdelivr.com/v1/packages/npm/'

		const isDomestic = range === 'domestic'

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

	public getPkgPathList(directoryInfo: PkgPathInfo) {
		const strategy = {
			foreign: parseJsDelivrPathInfo,
			domestic: parseNpmmirrorPathInfo
		}

		return strategy[this.fastest.range](directoryInfo)
	}
}

const cdn = new CDN()
cdn.use(usedCdnList)

function parseJsDelivrPathInfo(
	pathInfo: JsdelivrPkgPathInfo,
	upperLevernName?: string
) {
	const paths: string[] = []

	if (pathInfo.type === 'file' || pathInfo.type === 'npm') {
		paths.push(
			upperLevernName
				? `/${upperLevernName}/${pathInfo.name}`
				: `/${pathInfo.name}`
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

async function addCdnUrlToPkgPath(
	pkgName: string,
	paths: string[],
	version: string
) {
	const { pkg, directoryInfo } = await cdn.getPkgJsonAndDirectoryContent(
		pkgName,
		version
	)

	const allPaths = cdn.getPkgPathList(directoryInfo as unknown as PkgPathInfo)

	const pkgMainFilePath = await seekPkgMainPath(
		pkg as unknown as PkgCDN,
		allPaths
	)

	paths = paths
		.map(p => (p === pkgName ? pkgMainFilePath : p))
		.map(p => p.replace(`${pkgName}/`, ''))

	paths = cdn.spliceUrl(pkgName, paths, version)

	return { urls: paths }
}

export async function getPkgCdnUrlsRecord(pkgRecord: PkgRecord) {
	const pkgUrlsRecord = {} as Record<string, string[]>

	for (const pkgName in pkgRecord) {
		const { urls } = await addCdnUrlToPkgPath(
			pkgName,
			pkgRecord[pkgName].paths,
			pkgRecord[pkgName].version
		)
		pkgUrlsRecord[pkgName] = urls
	}
	return pkgUrlsRecord
}
