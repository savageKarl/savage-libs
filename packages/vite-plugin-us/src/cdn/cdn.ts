import { extname } from 'node:path'

import pc from 'picox'
import { copyDeep } from 'savage-utils'

import {
  PkgDepsRecord,
  JsdelivrPkgPathInfo,
  NpmmirrorPkgPathInfo,
  PkgPathInfo,
  PkgCDN,
  ItemCDN,
  DepRecord,
  LeadingCdnRecord
} from '../utils/types'

import { seekCdnPath } from './seekCdnPath'
import { usedCdnList } from './useCdn'
import { serviceCDN } from './service'
import { getNameByCode } from './getNameByCode'

import {
  generateJsDataUrlByCode,
  conditionLog,
  isObjectHasValue
} from '../utils/utils'

import { logger } from '../utils/logger'

type UrlsRecord = Record<
  string,
  {
    pkgName: string
    url: string
  }[]
>

class CDN {
  private usedCDNs: ItemCDN[] = []
  private leadingCdnRecord = {} as LeadingCdnRecord
  private range: 'domestic' | 'foreign' = 'domestic'

  public listGet() {
    return this.usedCDNs
  }

  public leadingCdnRecordGet() {
    return this.leadingCdnRecord
  }

  public use(useCdnList: ItemCDN[]) {
    useCdnList.forEach((v) => {
      if (v.leading) this.leadingCdnRecord[v.range] = v
    })
    this.usedCDNs.push(...(useCdnList as ItemCDN[]))
  }

  private spliceUrl(pkgName: string, paths: string[], version: string) {
    const urlsRecord: UrlsRecord = {}

    this.usedCDNs.forEach((v) => {
      urlsRecord[v.name] = paths.map((p) => {
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

        return {
          pkgName,
          url: splitPath.join('')
        }
      })
    })

    return { urlsRecord }
  }

  private async getPkgJsonAndDirectoryInfo(pkgName: string, version: string) {
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
    let pkgCdnPath = ''

    try {
      const { pkg, directoryInfo } = await this.getPkgJsonAndDirectoryInfo(
        pkgName,
        version
      )
      const allPaths = this.getPkgPathList(
        directoryInfo as unknown as PkgPathInfo
      )
      pkgCdnPath = seekCdnPath.seek(pkg as unknown as PkgCDN, allPaths)
    } catch (e) {}

    if (extname(pkgCdnPath) !== '.js') {
      logger.warn(
        `Unable to find CDN path for dependency ${pc.bold(pkgName)}, skipped!`
      )
      return false
    }

    const isJsFile = (path: string) => extname(path) === ''

    paths = [...paths]
      .map((p) => {
        if (isJsFile(p) && pkgCdnPath) {
          return pkgCdnPath
        }
        return p
      })
      .filter((p) => p !== '')
      .map((p) => p.replace(new RegExp(`${pkgName}/|^/`, 'g'), ''))

    paths = [...new Set(paths)]

    const { urlsRecord } = this.spliceUrl(pkgName, paths, version)

    return urlsRecord
  }

  private async addDataUrl(depsRecords: DepRecord[]) {
    const handledDepsRecords: DepRecord[] = []

    for (const v of depsRecords) {
      handledDepsRecords.push(v)

      const isJsFile = extname(v.url) === '.js'
      if (isJsFile) {
        const name = v.globalVariableName

        const template = `
				;(function () {
					let [name] =
						this["[name]"] || window["[name]"]
					if ([name].default) {
						const defaultExport = [name].default
						Object.keys([name]).forEach((key) => {
							if (key !== "default") {
								defaultExport[key] = [name][key]
							}
						})
				
						window["[name]"] = defaultExport
						this["[name]"] = window["[name]"]
					}
				})();
				`

        handledDepsRecords.push(
          Object.assign(copyDeep(v), {
            url: generateJsDataUrlByCode(template.replaceAll('[name]', name))
          })
        )
      }
    }
    return handledDepsRecords
  }

  public async getDepsRecords(pkgDepsRecord: PkgDepsRecord) {
    const pkgNames = Object.keys(pkgDepsRecord)

    if (!isObjectHasValue(pkgDepsRecord)) return [] as DepRecord[]

    const urlsRecord = (
      (await Promise.all(
        pkgNames
          .map(
            async (pkgName) =>
              await this.getUrlForDep(
                pkgName,
                pkgDepsRecord[pkgName].paths,
                pkgDepsRecord[pkgName].version.replace(/^[\^~]/g, '')
              )
          )
          .filter(async (res) => (await res) !== false)
      )) as UrlsRecord[]
    ).reduce((preV, curV) => {
      Object.keys(curV).forEach((k) => {
        preV[k] = (preV[k] || []).concat(curV[k])
      })
      return preV
    }, {})

    conditionLog(urlsRecord, urlsRecord)

    const key = Object.keys(urlsRecord)[0]
    const urlRecords = urlsRecord[key]

    const codeRecord = (
      await Promise.all(
        urlRecords.map(async (v) => {
          return {
            [v.url]: (await serviceCDN.get(v.url)).data as string
          }
        })
      )
    ).reduce((preV, curV) => Object.assign(preV, curV))

    conditionLog(codeRecord, 'Getting the global variable names...')

    const depsRecords = urlRecords.map((v) => {
      const isJsFile = extname(v.url) === '.js'
      return {
        pkgName: v.pkgName,
        url: v.url,
        globalVariableName: isJsFile
          ? getNameByCode(v.pkgName, codeRecord[v.url])
          : undefined
      } as DepRecord
    })

    conditionLog(depsRecords, 'Adding the data URL...')

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
    pathInfo.files.forEach((v) =>
      paths.push(...parseJsDelivrPathInfo(v, pathInfo.name))
    )
  }

  return paths
}

export function parseNpmmirrorPathInfo(pathInfo: NpmmirrorPkgPathInfo) {
  const paths: string[] = []

  if (pathInfo.type === 'file') {
    paths.push(pathInfo.path)
  }

  if (pathInfo.type === 'directory') {
    pathInfo.files.forEach((v) => paths.push(...parseNpmmirrorPathInfo(v)))
  }

  return paths
}
