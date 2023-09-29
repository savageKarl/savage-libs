import { extname } from 'node:path'

import { cloneDeep } from 'lodash-es'
import MagicString from 'magic-string'

import {
	PkgDepsRecord,
	JsdelivrPkgPathInfo,
	NpmmirrorPkgPathInfo,
	PkgPathInfo,
	PkgCDN,
	ItemCDN,
	DepRecord,
	LeadingCdnRecord
} from '../types/types'

import { seekCdnPath } from './seekCdnPath'
import { usedCdnList } from './useCdn'
import { serviceCDN } from './service'
import { getNameByCode } from './getNameByCode'

import { generateJsDataUrlByCode } from '../utils/utils'

class CDN {
	private list: ItemCDN[] = []
	private leadingCdnRecord = {} as LeadingCdnRecord
	private range: 'domestic' | 'foreign' = 'domestic'

	public listGet() {
		return this.list
	}

	public leadingCdnRecordGet() {
		return this.leadingCdnRecord
	}

	public use(useCdnList: ItemCDN[]) {
		useCdnList.forEach(v => {
			if (v.leading) this.leadingCdnRecord[v.range] = v
		})
		this.list.push(...(useCdnList as ItemCDN[]))
	}

	private async getCurrentRange() {
		const { domestic, foreign } = this.leadingCdnRecord

		if (domestic && foreign) {
			const winner = await Promise.race([
				serviceCDN.get(domestic.homePage),
				serviceCDN.get(foreign.homePage)
			])

			return (this.range = [domestic, foreign].filter(
				v => v.homePage === winner.config.url
			)[0].range)
		} else {
			console.error('must be set demostic and foreign leading CDN')
		}
	}

	private spliceUrl(pkgName: string, paths: string[], version: string) {
		const urlsRecord: Record<string, string[]> = {}

		this.list.forEach(v => {
			const urls: string[] = []

			paths.forEach(p => {
				const splitPath: string[] = []

				splitPath.push(`${v.url}/${pkgName}`)
				splitPath.push(v.useAt ? '@' : '/')
				splitPath.push(`${version}/`)
				if (v.addFilesFolder) splitPath.push('files/')
				if (v.removeDistPath) p = p.replace('dist/', '')
				if (v.provideMinify && !/(min\.css|min\.js)/.test(p)) {
					splitPath.push(p.replace(/(\.css|\.js)/, '.min$1'))
				} else {
					splitPath.push(p)
				}

				urls.push(splitPath.join(''))
			})

			urlsRecord[v.name] = urls
		})

		return { urlsRecord }
	}

	private async getAvailableCdn(urlsRecord: Record<string, string[]>) {
		const cdnKeys = Object.keys(urlsRecord)

		const availableCdnRecord: Record<string, string[]> = {}

		const results = cdnKeys.map(async key => {
			const requests = urlsRecord[key].map(p => serviceCDN.get(p))
			const res = await Promise.allSettled(requests)

			const status = res.every(v => {
				const regErrorContent = /404: Not Found/g

				const isFulfilled = v.status === 'fulfilled'
				const isCorrectContent = (v: string) => !regErrorContent.test(v)
				return isFulfilled && isCorrectContent(v.value.data)
			})

			return {
				name: key,
				status
			}
		})

		;(await Promise.all(results))
			.filter(v => v.status)
			.forEach(v => {
				availableCdnRecord[v.name] = urlsRecord[v.name]
			})

		return { availableCdnRecord }
	}

	private async getFastestCdn(availableCdnRecord: Record<string, string[]>) {
		const cdnKeys = Object.keys(availableCdnRecord)

		const winner = await Promise.race(
			cdnKeys.map(k => serviceCDN.get(availableCdnRecord[k][0]))
		)

		const key = cdnKeys.filter(
			k => availableCdnRecord[k][0] === winner.config.url
		)[0]

		const urls = availableCdnRecord[key]

		return { urls }
	}

	private async getPkgJsonAndDirectoryInfo(pkgName: string, version: string) {
		await this.getCurrentRange()
		const jsdelivrDirectoryOrigin = 'https://data.jsdelivr.com/v1/packages/npm'

		let pkgJsonUrl = ''
		let filesDirectoryUrl = ''

		const { domestic, foreign } = this.leadingCdnRecord
		const strategy = {
			domestic() {
				pkgJsonUrl = `${domestic?.url}/${pkgName}/${version}/files/package.json`
				filesDirectoryUrl = `${domestic?.url}/${pkgName}/${version}/files?meta`
			},
			foreign() {
				pkgJsonUrl = `${foreign?.url}/${pkgName}@${version}/package.json`
				filesDirectoryUrl = `${jsdelivrDirectoryOrigin}/${pkgName}@${version}`
			}
		}

		strategy[this.range]()

		const [pkgRes, directoryInfoRes] = await Promise.all([
			serviceCDN.get(pkgJsonUrl),
			serviceCDN.get(filesDirectoryUrl)
		])

		return {
			pkg: pkgRes.data,
			directoryInfo: directoryInfoRes.data
		}
	}

	private getPkgPathList(directoryInfo: PkgPathInfo) {
		const strategy = {
			foreign: parseJsDelivrPathInfo,
			domestic: parseNpmmirrorPathInfo
		}

		return strategy[this.range](directoryInfo)
	}

	private async getUrlForDep(
		pkgName: string,
		paths: string[],
		version: string
	) {
		const { pkg, directoryInfo } = await this.getPkgJsonAndDirectoryInfo(
			pkgName,
			version
		)
		const allPaths = this.getPkgPathList(
			directoryInfo as unknown as PkgPathInfo
		)
		const pkgMainFilePath = seekCdnPath.seek(pkg as unknown as PkgCDN, allPaths)

		const isJsFile = (path: string) => extname(path) === ''

		paths = [...paths]
			.map(p => (isJsFile(p) ? pkgMainFilePath : p))
			.map(p => p.replace(new RegExp(`${pkgName}/|^/`, 'g'), ''))
			.filter(p => p !== '')

		paths = [...new Set(paths)]

		const { urlsRecord } = this.spliceUrl(pkgName, paths, version)
		const { availableCdnRecord } = await this.getAvailableCdn(urlsRecord)
		const { urls } = await this.getFastestCdn(availableCdnRecord)

		const codeRecord = (
			await Promise.all(
				urls.map(async url => {
					return {
						url,
						code: (await serviceCDN.get(url)).data as string
					}
				})
			)
		).reduce(
			(preV, curV) => Object.assign(preV, { [curV.url]: curV.code }),
			{} as Record<string, string>
		)
		const depsRecords = urls.map(v => {
			const isJsFile = extname(v) === '.js'
			return {
				pkgName,
				url: v,
				globalVariableName: isJsFile
					? getNameByCode(pkgName, codeRecord[v])
					: undefined
			} as DepRecord
		})
		return depsRecords
	}

	private async addDataUrl(depsRecords: DepRecord[]) {
		const handledDepsRecords: DepRecord[] = []

		for (const v of depsRecords) {
			handledDepsRecords.push(v)

			const isJsFile = extname(v.url) === '.js'
			if (isJsFile) {
				const name = v.globalVariableName
				const s = new MagicString(`if(${name}){window['${name}']=${name}}`)

				handledDepsRecords.push(
					Object.assign(cloneDeep(v), {
						url: generateJsDataUrlByCode(s.toString())
					})
				)
			}
		}
		return handledDepsRecords
	}

	public async getDepsRecords(pkgDepsRecord: PkgDepsRecord) {
		const depsRecords: DepRecord[] = []
		const pkgNames = Object.keys(pkgDepsRecord)

		const res = await Promise.all(
			pkgNames.map(
				async pkgName =>
					await this.getUrlForDep(
						pkgName,
						pkgDepsRecord[pkgName].paths,
						pkgDepsRecord[pkgName].version.replace(/^[\^~]/g, '')
					)
			)
		)

		res.forEach(v => v && depsRecords.push(...v))
		return await this.addDataUrl(depsRecords)
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
