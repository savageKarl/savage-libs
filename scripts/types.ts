export interface BuildOptions {
  libraryName: string
  external?: string[] | 'dependencies'
  globalVariableName?: Record<string, string>
  format: ('cjs' | 'esm' | 'iife')[]
  target: string[]
  dts: boolean
  minify: boolean
  copy?: {
    from: string
    to: string
  }
}
