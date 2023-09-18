export type PkgInfo = Record<
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

export type PkgPathInfoWithNpmmirror = NpmmirrorDirectoryType

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

export type PkgPathInfoWitJsdelivr = JsDelivrDirectoryType

export type Fun = (...args: unknown[]) => 'nextNode' | null
