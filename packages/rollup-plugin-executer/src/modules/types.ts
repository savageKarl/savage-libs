import type { PluginHooks } from 'rollup'
import { types } from 'savage-types'
import type { Options as DelOptionsRaw } from 'del'

export type executeOptions = {
	sync?: boolean
}

export type CommandCaller = string | (() => unknown)

export function isCommandCaller(v: unknown): v is CommandCaller {
	return !types.isArray(v)
}

export type DelOptions = DelOptionsRaw & executeOptions

/** provide some powerful api */
export interface Context {
	/** be use to execute command by custom */
	run: (command: string | string[], options: executeOptions) => void
	/** be use to del any file or folder by del lib  */
	del: (pattern: string[], options: DelOptions) => unknown
	/** current hook arguments */
	hookOptions: unknown[]
}

type Fun = (ctx: Context) => unknown
export type Command = string | Fun
type Options = {
	commands: Command[]
	/**
	 * @defaultValue `buildEnd`
	 */
	hook: keyof PluginHooks
} & executeOptions

type CommandList = Command[]
type OptionsList = Options[]
export type Args = Command | CommandList | Options | OptionsList

export function isCommand(v: unknown): v is Command {
	return types.isFunction(v) && types.isString(v)
}

export function isCommandList(v: unknown): v is CommandList {
	return types.isArray(v) && isCommand((v as CommandList)[0])
}

export function isOptions(v: unknown): v is Options {
	return (v as Options).commands && !!(v as Options).hook
}

export function isOptionsList(v: unknown): v is OptionsList {
	return types.isArray(v) && isOptions((v as OptionsList)[0])
}
