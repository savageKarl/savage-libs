import type { HeadMetaData } from './userscript'

interface ManualCdnResource {
	/**
	 * the global variable name of dependencies, if it is a CSS resource, it is not required
	 *
	 * @example
	 * ```
	 * name: 'Vue'
	 * ```
	 */
	name?: string
	/**
	 * imported path
	 *
	 * when the code looks like this`import { createApp } from 'vue'`, the path is `vue`
	 *
	 * @example
	 * ```
	 * path: 'vue'
	 * ```
	 */
	path: string
	/**
	 * url of CDN resource
	 *
	 * @example
	 * ```
	 * url: 'https://unpkg.com/vue@3.3.4/dist/vue.global.js'
	 * ```
	 */
	url: string
}

export type Mode = 'development' | 'production' | 'preview'

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

		/** auto open browser
		 * @defaultValue `true`
		 */
		open?: boolean
		/**
		 * @defaultValue `localhost`
		 */
		host?: string
	}
	/**
	 * build options for production mode
	 */
	build?: {
		/**
		 * minify js in production mode
		 */
		minify?: boolean
		/**
		 * minify css in production mode
		 */
		cssMinify?: boolean
		/** extract external dependencies */
		external?: {
			/**
			 * automatically load package dependencies using CDN
			 *
			 * if value is `manual`, `exclude` will not work
			 *
			 * @defaultValue `auto`
			 */
			cdn?: 'auto' | 'manual'
			/**
			 * exclude dependencies that do not require automatic CDN
			 */
			exclude?: string[]
			/**
			 * include dependencies that require manual CDN
			 */
			include?: ManualCdnResource[]
		}
	}
	/**
	 * can modify the head metaData and bundle
	 */
	generate?: {
		/** pass in a function to modify head metaData */
		headMetaData?: (metaData: string, mode: Mode) => string
		/**
		 * pass in a function to modify bundle
		 *
		 * it will not work, if in development mode
		 */
		bundle?: (code: string) => string
	}
	/**
	 * userscript header metadata config.
	 *
	 * @see https://www.tampermonkey.net/documentation.php
	 */
	headMetaData: HeadMetaData
}

export type PkgRecord = Record<
	string,
	{
		paths: string[]
		version: string
	}
>

export interface ResourceRecord {
	globalVariableName: Record<string, string>
	external: string[]
	urls: Record<string, string[]>
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
	url: string
	/**
	 * @defaultValue `within`
	 */
	range?: 'domestic' | 'foreign'
	/**
	 * if the path is `/xxx.js`, CDN will automatically provide `/xxx.min.js`
	 *
	 * @defaultValue `true`
	 */
	provideMinify?: boolean
	/**
	 * If it is `true`, CDN will provide a path like `https://xxx/name@version/xxx.js`,
	 *
	 * otherwise `https://xxx/name/version/xxx.js` will be provided
	 *
	 * @defaultValue `false`
	 */
	useAt?: boolean
	/**
	 * If it is `true`, CDN will provide a path like `https://xxx/name/version/files/xxx.js`,
	 *
	 * otherwise `https://xxx/name/version/xxx.js` will be provided
	 *
	 * @defaultValue `false`
	 */
	addFilesFolder?: boolean
	/**
	 * if the path is `/dist/xxx.js`, CDN will automatically remove dist path and
	 * it will become `/xxx.js`
	 * @defaultValue `true`
	 */
	removeDistPath?: boolean

	/**
	 * if is the leading CDN
	 */
	isLeading?: boolean
}
