export type PkgRecord = Record<
	string,
	{
		paths: string[]
		version: string
	}
>

export interface ResourceRecord {
	names: Record<string, string>
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
export type ChainNodeFun = (next: Fun, ...args: unknown[]) => 'nextNode' | void

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
	addFilesPath?: boolean
	/**
	 * if the path is `/dist/xxx.js`, CDN will automatically remove dist path and
	 * it will become `/xxx.js`
	 * @defaultValue `true`
	 */
	removeDistPath?: boolean
}
