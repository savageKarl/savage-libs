import type { Plugin } from 'rollup'

import {
	Args,
	ExecuteOptions,
	isCommand,
	isCommandList,
	isOptions,
	isOptionsList
} from './types'

import { runCommand } from './run'

export type * from './types'

/**
 * a plugin function of rollup return config
 */
export function executer(args: Args) {
	const pluginOptions: Plugin = {
		name: 'rollup-plugin-executer'
	}
	const defaultHook = 'buildEnd'

	const executeOptionsDefault: ExecuteOptions = {
		sync: false
	}

	if (isCommand(args) || isCommandList(args)) {
		pluginOptions[defaultHook] = function (...rest) {
			runCommand(args, executeOptionsDefault, rest)
		}
	}

	if (isOptions(args)) {
		const executeOptions =
			(Object.assign(executeOptionsDefault), { sync: args.sync })

		// @ts-ignore
		pluginOptions[args.hook] = function (...rest) {
			runCommand(args.commands, executeOptions, rest)
		}
	}

	if (isOptionsList(args)) {
		const hooksRecord: Record<string, () => void> = {}

		args.forEach(v => {
			const sync = (Object.assign(executeOptionsDefault), { sync: v.sync })
			hooksRecord[v.hook] = function (...rest) {
				runCommand(v.commands, sync, rest)
			}
		})

		Object.assign(pluginOptions, hooksRecord)
	}

	return pluginOptions
}

export default executer
