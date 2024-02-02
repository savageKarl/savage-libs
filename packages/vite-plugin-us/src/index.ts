import type { PluginOption } from 'vite'

import { UsOptions } from './utils/types'
import { plugins } from './plugins'
import { mergeOptions } from './utils/optionsMerge'

export type { UsOptions } from './utils/types'

export function us(usOptions: UsOptions): PluginOption[] {
  const usOptionsMerged = mergeOptions(usOptions)

  return plugins.map((v) => v(usOptionsMerged))
}

export default us
