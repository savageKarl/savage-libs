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
