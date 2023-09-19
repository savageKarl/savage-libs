/* eslint-disable prefer-rest-params */
import type { Args, executeOptions } from './types'
import { isCommand, isCommandList, isOptions, isOptionsList } from './types'

import { runCommand } from './run'

/**
 * a plugin function of rollup return config
 */
export default function executer(args: Args) {
	const base = {
		name: 'rollup-plugin-executer'
	}

	const optionsRecord: Record<string, () => void> = {}
	const defaultHook = 'buildEnd'

	const executeOptionsDefault: executeOptions = {
		sync: false
	}

	if (isCommand(args) || isCommandList(args)) {
		optionsRecord[defaultHook] = function () {
			runCommand(args, executeOptionsDefault, [...arguments])
		}
	}

	if (isOptions(args)) {
		const sync = (Object.assign(executeOptionsDefault), { sync: args.sync })
		optionsRecord[args.hook] = function () {
			runCommand(args.commands, sync, [...arguments])
		}
	}

	if (isOptionsList(args)) {
		const hooksRecord: Record<string, () => void> = {}

		args.forEach(v => {
			const sync = (Object.assign(executeOptionsDefault), { sync: v.sync })
			hooksRecord[v.hook] = function () {
				runCommand(v.commands, sync, [...arguments])
			}
		})

		Object.keys(hooksRecord).forEach(
			key => (optionsRecord[key] = hooksRecord[key])
		)
	}

	return Object.assign(base, optionsRecord)
}
