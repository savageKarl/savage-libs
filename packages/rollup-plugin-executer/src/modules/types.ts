import type { PluginHooks } from 'rollup'
import { types } from 'savage-types'
import type { Options as DelOptionsRaw } from 'del'

export type { Options as DelOptionsRaw } from 'del'

export type ExecuteOptions = {
	sync?: boolean
}

export type DelOptions = DelOptionsRaw & ExecuteOptions

/** provide some powerful api */
export interface Context {
	/** be use to execute command by custom */
	run: (command: string | string[], options: ExecuteOptions) => void
	/** be use to del any file or folder by del lib  */
	del: (pattern: string[], options: DelOptions) => unknown
	/** current hook arguments */
	hookOptions: unknown[]
}

export type Fun = (ctx: Context) => unknown
export type Command = string | Fun
export type Options = {
	commands: Command[]
	/**
	 * @defaultValue `buildEnd`
	 */
	hook: keyof PluginHooks
} & ExecuteOptions

export type CommandList = Command[]
export type OptionsList = Options[]
export type Args = Command | CommandList | Options | OptionsList

/**
 * @internal
 */
export function isCommand(v: unknown): v is Command {
	return types.isFunction(v) && types.isString(v)
}

/**
 * @internal
 */
export function isCommandList(v: unknown): v is CommandList {
	return types.isArray(v) && isCommand((v as CommandList)[0])
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
	return types.isArray(v) && isOptions((v as OptionsList)[0])
}
