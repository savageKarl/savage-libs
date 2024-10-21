import { extname } from 'node:path'

import type { ResourceRecord, PkgDepsRecord, externalGlobal } from './types'

import { pkg } from './constants'
import { cdn } from '../cdn/cdn'
import { conditionLog, removeCommentFromCode, getPkgNameByPath } from './utils'

export class DepCollection {
  private regExclusion: RegExp
  private manuallyDeps: string[]
  private manuallyResources: externalGlobal[]

  private collectDeps: string[] = []

  private readonly pkgDeps = Object.keys(pkg.dependencies ?? {})
  private readonly regPkgDep = new RegExp(this.pkgDeps.join('|'))

  constructor(exclusions: string[], manuallyResources: externalGlobal[]) {
    this.regExclusion = new RegExp(
      exclusions.map((v) => `^${v}($|/)`).join('|') || ' '
    )
    this.manuallyResources = manuallyResources

    this.manuallyDeps = manuallyResources.map((v) => v.pkgName)
  }

  private pushDep(id: string) {
    const isNotCollect = this.collectDeps.every((v) => v !== id)
    if (isNotCollect) this.collectDeps.push(id)
  }

  public collectCssDep(id: string) {
    if (/node_modules/.test(id) && /css$/.test(id)) {
      this.pushDep(id)
      return null
    }
  }

  public collectDep(code: string, id: string) {
    const isLocal = !/node_modules/.test(id)
    const isFile = !!extname(id)
    const isOriginalFile = id.split('?').length === 1

    if (!isLocal || !isFile || !isOriginalFile) return false

    const regPkg = /import[\s\d\w{},]+(?<quote>'|")(?<path>[^./].+?)\k<quote>/g

    const matchAllResult = [...removeCommentFromCode(code).matchAll(regPkg)]

    matchAllResult.forEach((v) => {
      const importPath = v.groups?.path as string
      const isInPkg = this.regPkgDep.test(importPath)
      const isNotExclude = !this.regExclusion.test(importPath)
      const isCssFile = extname(importPath) === '.css'
      const isJsFile = extname(importPath) === ''
      const isCssOrJsFile = isCssFile || isJsFile
      const isNotManualy = !this.manuallyDeps.includes(importPath)

      if (isInPkg) {
        if (isCssOrJsFile && isNotExclude && isNotManualy) {
          return this.pushDep(importPath)
        }
      }
    })
  }

  private removeNodeModulesFromPath() {
    return [...this.collectDeps].map((v) => {
      const splitArr = v.split('node_modules')
      v = (splitArr.pop() as string).replace(/^\//, '')
      return v
    })
  }

  private getExternals(depsRecords: externalGlobal[]) {
    const external = depsRecords
      .filter((v) => extname(v.url) === '.js')
      .map((v) => v.pkgName)
    return external
  }

  private getPkgDepsRecord(paths: string[]) {
    const pkgDepsRecord: PkgDepsRecord = {}

    paths.forEach((v) => {
      const pkgname = getPkgNameByPath(v)

      if (!pkgDepsRecord[pkgname])
        pkgDepsRecord[pkgname] = { paths: [], version: '' }

      pkgDepsRecord[pkgname].version = pkg.dependencies?.[pkgname] as string

      if (pkgDepsRecord[pkgname].paths) pkgDepsRecord[pkgname].paths.push(v)
      else pkgDepsRecord[pkgname].paths = [v]
    })
    return { pkgDepsRecord }
  }

  private async getVariableNameRecord(depsRecords: externalGlobal[]) {
    const names = depsRecords
      .filter((v) => extname(v.url) === '.js')
      .map((v) => ({ [v.pkgName]: v.globalVariableName }))
      .reduce(
        (preValue, curValue) => Object.assign(preValue, curValue),
        {} as Record<string, string>
      )

    return names
  }

  private getExtByUrl(url: string) {
    let ext = extname(url).replace('.', '')

    if (/data:application\/javascript/.test(url)) ext = 'js'

    return ext
  }

  private classifyUrl(depRecords: externalGlobal[]) {
    const categoryRecord: Record<string, externalGlobal[]> = {}
    depRecords.forEach((v) => {
      const ext = this.getExtByUrl(v.url)
      categoryRecord[ext]
        ? categoryRecord[ext]?.push(v)
        : (categoryRecord[ext] = [v])
    })

    return { categoryRecord }
  }

  public async resovleDep() {
    const resourceRecord = {
      globalVariableNameRecord: {},
      externals: [],
      categoryRecord: {}
    } as ResourceRecord

    const paths = this.removeNodeModulesFromPath()
    conditionLog(
      paths,
      'Collecting dependencies for automated CDN...',
      'No dependencies need to be collected, skipped!'
    )

    const { pkgDepsRecord } = this.getPkgDepsRecord(paths)
    const depsRecords = this.manuallyResources.concat(
      await cdn.getDepsRecords(pkgDepsRecord)
    )
    if (
      !conditionLog(
        depsRecords,
        'Dependencies used for automated CDNs are resolved.'
      )
    ) {
      return resourceRecord
    }

    const { categoryRecord } = this.classifyUrl(depsRecords)
    const globalNames = await this.getVariableNameRecord(depsRecords)

    resourceRecord.externals = resourceRecord.externals.concat(
      this.getExternals(depsRecords)
    )
    resourceRecord.globalVariableNameRecord = globalNames
    resourceRecord.categoryRecord = categoryRecord

    if (categoryRecord.js) {
      console.table(categoryRecord.js.filter((v) => extname(v.url) === '.js'))
    } else {
      categoryRecord.js = []
    }

    if (categoryRecord.css) {
      console.table(categoryRecord.css)
    } else {
      categoryRecord.css = []
    }

    return resourceRecord
  }
}
