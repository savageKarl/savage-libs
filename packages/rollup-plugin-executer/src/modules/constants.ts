import type { ExecuteOptions } from './types'

export const pluginName = 'rollup-plugin-executer'
export const defaultHook = 'buildEnd'

export const executeOptionsDefault: ExecuteOptions = {
  sync: false
}
