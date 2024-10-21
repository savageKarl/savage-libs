import type { MetaData } from './userscript'

export interface externalGlobal {
  /**
   * the global variable name of dependencies, if it is a CSS resource, it is not required
   *
   * @example
   * ```
   * globalVariableName: 'Vue'
   * ```
   */
  globalVariableName: string
  /**
   * url of CDN resource
   *
   * @example
   * ```
   * url: 'https://unpkg.com/vue@3.3.4/dist/vue.global.js'
   * ```
   */
  url: string

  /** package name
   * @example
   * ```
   * pkgName: 'vue'
   * pkgName: 'react'
   * ```
   */
  pkgName: string
}

type GlobalResource = {
  importName: string
  url: string
}

export type Mode = 'development' | 'production' | 'preview'

export interface Open {
  /**
   * @defaultValue `true`
   */
  enable: boolean
  /**
   * @defaultValue `chrome`
   *
   * value can be one of 'chrome' | 'firefox' | 'edge', or app.exe path
   */
  nameOrPath?: ('chrome' | 'firefox' | 'edge') | string
}

export interface UsOptions {
  /**
   * path of userscript entry.
   */
  entry: string
  /**
   * add prefix for script name when development, preview and production mode
   *
   * @example
   *
   * `// @name            dev: myscript`
   * `// @name            preview: myscript`
   * `// @name            production: myscript`
   */
  prefix?: boolean
  /**
   * automatically add grant to head metaData in development or production mode
   */
  autoAddGrant?: boolean
  /**
   * server options for development mode
   */
  server?: {
    /** if it avalible, otherwise random
     * @defaultValue `12345`
     */
    port?: number

    /** auto open browser in development mode
     * @defaultValue `true`
     */
    open?: Open
    /**
     * @defaultValue `localhost`
     */
    host?: string
  }
  /**
   * build options for production mode
   */
  build?: {
    /** auto open browser in production mode
     * @defaultValue `true`
     */
    open?: Open
    /**
     * minify js in production mode
     */
    minify?: boolean
    /**
     * minify css in production mode
     */
    cssMinify?: boolean
    /** extract external dependencies */

    // TODO 这里自动cdn的功能全部砍掉，不稳定。

    external?: {
      /**
       * Define third-party libraries that need to be detached in the module
       * @example
       *
       *
       */
      globals?: externalGlobal[]
      /**
       * define external resources that need to be extracted in the module, such as CSS and JSON
       * @example
       *
       * resources: [
       *   {
       *     importName: 'element-plus/dist/index.css',
       *     url: 'https://cdn.staticfile.org/element-plus/2.3.14/index.min.css'
       *   }
       * ]
       */
      // TODO
      // resources?: GlobalResource[]
    }
  }
  /**
   * can modify the head metaData and bundle
   */
  generate?: {
    /** pass in a function to modify metaData */
    modifyMetadata?: (metaData: string, mode: Mode) => string
    /**
     * pass in a function to modify bundle
     *
     * it will not work, if in development mode
     */
    modifyBundle?: (code: string) => string
  }
  /**
   * userscript header metadata config.
   *
   * @see https://www.tampermonkey.net/documentation.php
   */
  metaData: MetaData
}

export type PkgDepsRecord = Record<
  string,
  {
    paths: string[]
    version: string
  }
>

export interface ResourceRecord {
  globalVariableNameRecord: Record<string, string>
  externals: string[]
  categoryRecord: Record<string, externalGlobal[]>
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type DeepRequired<T> = T extends Function
  ? T
  : T extends object
    ? { [P in keyof T]-?: DeepRequired<T[P]> }
    : T

export interface PkgCDN {
  name: string
  unpkg: string
  jsdelivr: string
  main: string
}

interface NpmmirrorFileType {
  path: string
  type: 'file'
  contentType: string
  integrity: string
  lastModified: string
  size: number
}

interface NpmmirrorDirectoryType {
  path: string
  type: 'directory'
  files: (NpmmirrorFileType | NpmmirrorDirectoryType)[]
}

export type NpmmirrorPkgPathInfo = NpmmirrorDirectoryType | NpmmirrorFileType

interface JsDelivrFileType {
  type: 'file'
  name: string
  hash: string
  size: number
}

interface JsDelivrDirectoryType {
  type: 'directory'
  name: string
  files: (JsDelivrFileType | JsDelivrDirectoryType)[]
}

export type JsdelivrPkgPathInfo =
  | JsDelivrFileType
  | JsDelivrDirectoryType
  | {
      type: 'npm'
      name: string
      version: string
      default: string
      files: (JsDelivrFileType | JsDelivrDirectoryType)[]
    }

export type Fun = (...args: unknown[]) => void
export type ChainNodeFun = (
  next: Fun,
  ...args: unknown[]
) => 'nextNode' | unknown

export type PkgPathInfo = NpmmirrorPkgPathInfo & JsdelivrPkgPathInfo

export interface ItemCDN {
  name: string
  homePage: string
  url: string
  /**
   * @defaultValue `domestic`
   */
  range: 'domestic' | 'foreign'
  /**
   * if the path is `/xxx.js`, CDN will automatically provide `/xxx.min.js`
   *
   * @defaultValue `true`
   */
  provideMinify: boolean
  /**
   * If it is `true`, CDN will provide a path like `https://xxx/name@version/xxx.js`,
   *
   * otherwise `https://xxx/name/version/xxx.js` will be provided
   *
   * @defaultValue `false`
   */
  useAt: boolean
  /**
   * If it is `true`, CDN will provide a path like `https://xxx/name/version/files/xxx.js`,
   *
   * otherwise `https://xxx/name/version/xxx.js` will be provided
   *
   * @defaultValue `false`
   */
  addFilesFolder: boolean
  /**
   * if the path is `/dist/xxx.js`, CDN will automatically remove dist path and
   * it will become `/xxx.js`
   * @defaultValue `true`
   */
  removeDistPath: boolean

  /**
   * if is the leading CDN
   */
  leading?: boolean

  supportSvgAndJson: boolean
}

export interface LeadingCdnRecord {
  domestic: ItemCDN | undefined
  foreign: ItemCDN | undefined
}

export interface Transform {
  minify: boolean
  code: string
  filename: string
  loader: 'js' | 'css'
}

export type SpliceSeekPathOptions =
  | {
      folder: string
      pkgName?: string
      name: string
    }
  | {
      folder: string
      pkgName: string
      name?: string
    }
  | {
      folder?: string
      pkgName: string
      name: string
    }
  | {
      folder?: string
      pkgName: string
      name?: string
    }
  | {
      folder?: string
      pkgName?: string
      name: string
    }
