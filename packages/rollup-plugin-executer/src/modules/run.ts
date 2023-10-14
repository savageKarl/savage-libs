import { spawn as async, sync } from 'cross-spawn'
import delOrigin from 'del'

import { isString, typeOf } from 'savage-types'

import type { Command, CommandList, ExecuteOptions } from './types'

export const del = delOrigin

function baseRun(command: string | string[], sync = false) {
	command = isString(command) ? [command] : command
	return runCommands(command, { sync })
}

export const run = (command: string | string[]) => {
	return baseRun(command, false)
}

// run.sync = (command: string | string[]) => {
// 	return baseRun(command, true)
// }

async function execute(
	command: Command,
	options: ExecuteOptions,
	hookArgs?: unknown[]
) {
	if (typeof command === 'function') {
		if (options?.sync) {
			return await command(...(hookArgs || []))
		} else {
			return command(...(hookArgs || []))
		}
	}
	if (!isString(command))
		return console.error(
			`command must be a function or a string.  Recieved type ${typeOf(
				command
			)}`
		)

	const spawn = options?.sync ? sync : async

	return spawn(command, {
		shell: true,
		stdio: 'inherit'
	})
}

/**
 * @internal
 */
export async function runCommands(
	commands: CommandList,
	options: ExecuteOptions,
	hookOptions?: unknown[]
) {
	if (options?.sync) {
		for (const v of commands) {
			await execute(v, options, hookOptions)
		}
	} else {
		commands.forEach(v => execute(v, options, hookOptions))
	}
}
