import type { PluginHooks } from 'rollup'
import { isFunction, isString, isArray } from 'savage-types'

export type { PluginHooks } from 'rollup'

export type ExecuteOptions = {
  /**
   * @defaultValue false
   */
  sync?: boolean
}

export type Fun = (...args: unknown[]) => void | Promise<void>
export type Command = string | Fun
export type CommandList = Command[]

export type Options = {
  commands: CommandList
  /**
   * @defaultValue `buildEnd`
   */
  hook?: keyof PluginHooks
} & ExecuteOptions

export type OptionsList = Options[]
export type Args = Command | CommandList | Options | OptionsList

/**
 * @internal
 */
export function isCommand(v: unknown): v is Command {
  return isFunction(v) || isString(v)
}

/**
 * @internal
 */
export function isCommandList(v: unknown): v is CommandList {
  return isArray(v) && isCommand((v as CommandList)[0])
}

/**
 * @internal
 */
export function isOptions(v: unknown): v is Options {
  return (v as Options).commands && !!(v as Options).hook
}

/**
 * @internal
 */
export function isOptionsList(v: unknown): v is OptionsList {
  return isArray(v) && isOptions((v as OptionsList)[0])
}

/**
 * @internal
 */
export interface Run {
  (command: string | string[]): Promise<void>

  // sync: (command: string | string[]) => void
}
