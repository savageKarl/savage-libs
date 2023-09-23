import { cloneDeep } from 'lodash-es'

import {
	PkgDepsRecord,
	JsdelivrPkgPathInfo,
	NpmmirrorPkgPathInfo,
	PkgPathInfo,
	PkgCDN,
	ItemCDN,
	DepsRecord
} from '../types/types'

import { seekPkgMainPath } from './seekPkgMainPath'
import { usedCdnList } from './useCdn'
import { serviceCDN } from './service'

class CDN {
	private list: Required<ItemCDN>[] = []
	private leadingForignCDN = {} as Required<ItemCDN>
	private leadingDomesticCDN = {} as Required<ItemCDN>
	private fastest = {} as Required<ItemCDN>

	public listGet() {
		return this.list
	}

	public leadingForignCDNGet() {
		return this.leadingForignCDN
	}

	public leadingDomesticCDNGet() {
		return this.leadingDomesticCDN
	}

	public fastestGet() {
		return this.fastest
	}

	public use(options: ItemCDN | ItemCDN[]) {
		const list = (
			Array.isArray(options) ? options : [options]
		) as Required<ItemCDN>[]

		list.forEach((v, i, arr) => {
			const defaultOptions = {
				range: 'domestic',
				provideMinify: true,
				useAt: false,
				addFilesFolder: false,
				removeDistPath: true,
				isLeading: false
			} as Required<ItemCDN>

			arr[i] = v = Object.assign(defaultOptions, v)
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
			urls.push(...this.spliceUrl(pkgName, [''], version))
		})

		const winner = await Promise.race(urls.map(url => serviceCDN.get(url)))

		this.fastest = this.list.filter(v =>
			new RegExp(v.url).test(winner.config.url as string)
		)[0]
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
			} else {
				splitPath.push(p)
			}

			urls.push(splitPath.join(''))
		})
		return urls
	}

	public async getPkgJsonAndDirectoryContent(pkgName: string, version: string) {
		const fastestCDN = await this.getFastest(pkgName, version)
		const range = fastestCDN.range

		const jsdelivrDirectoryOrigin = 'https://data.jsdelivr.com/v1/packages/npm'

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

		const [pkgRes, directoryInfoRes] = await Promise.all([
			serviceCDN.get(pkgJsonUrl),
			serviceCDN.get(filesDirectoryUrl)
		])

		return {
			pkg: pkgRes.data,
			directoryInfo: directoryInfoRes.data
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

export const cdn = new CDN()
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

async function addCdnUrlToDepPath(
	pkgName: string,
	depsRecords: DepsRecord[],
	version: string
) {
	const { pkg, directoryInfo } = await cdn.getPkgJsonAndDirectoryContent(
		pkgName,
		version
	)

	const allPaths = cdn.getPkgPathList(directoryInfo as unknown as PkgPathInfo)
	const pkgMainFilePath = seekPkgMainPath(pkg as unknown as PkgCDN, allPaths)

	let paths = cloneDeep(depsRecords)
		.map(v => v.importPath)
		.map(p => (p === pkgName ? pkgMainFilePath : p))
		.map(p => p.replace(`${pkgName}/`, ''))
		.map(p => p.replace(/^\//, ''))

	paths = cdn.spliceUrl(pkgName, paths, version)

	const depsRecordsWithCDN = paths.map((v, i) => ({
		importName: depsRecords[i].importName,
		importPath: v
	}))

	return depsRecordsWithCDN
}

export async function getPkgCdnUrlsRecord(pkgDepsRecord: PkgDepsRecord) {
	const depsRecordsWithCDN: DepsRecord[] = []

	for (const pkgName in pkgDepsRecord) {
		const depsRecords = await addCdnUrlToDepPath(
			pkgName,
			pkgDepsRecord[pkgName].depsRecords,
			pkgDepsRecord[pkgName].version.replace(/^[\^~]/g, '')
		)
		depsRecordsWithCDN.push(...depsRecords)
	}
	return { depsRecordsWithCDN }
}
