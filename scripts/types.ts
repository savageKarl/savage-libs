export interface BuildOptions {
	libraryName: string
	external?: string[] | 'dependencies'
	globalVariableName?: Record<string, string>
	format: ('cjs' | 'esm' | 'umd')[]
	target: string[]
	dts: boolean
	minify: boolean
}
