import type { Plugin } from 'rollup'

import {
  Args,
  isCommand,
  isCommandList,
  isOptions,
  isOptionsList,
  CommandList
} from './types'

import { runCommands } from './run'
import { pluginName, defaultHook, executeOptionsDefault } from './constants'

export type * from './types'
export * from './run'

export function executer(args: Args) {
  const pluginOptions: Plugin = {
    name: pluginName
  }

  if (isCommand(args) || isCommandList(args)) {
    pluginOptions[defaultHook] = function (...rest) {
      args = isCommand(args) ? [args] : args
      runCommands(args as CommandList, executeOptionsDefault, rest)
    }
  }

  if (isOptions(args) || isOptionsList(args)) {
    args = isOptions(args) ? [args] : args
    const hooksRecord: Record<string, () => void> = {}

    args.forEach((v) => {
      const sync = (Object.assign(executeOptionsDefault), { sync: v.sync })
      hooksRecord[v.hook ?? defaultHook] = function (...rest) {
        runCommands(v.commands, sync, rest)
      }
    })

    Object.assign(pluginOptions, hooksRecord)
  }

  return pluginOptions
}

export default executer
