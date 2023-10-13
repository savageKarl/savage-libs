import { spawn as async, sync } from 'cross-spawn'
import delRaw from 'del'

import type { Context, Command, DelOptions, ExecuteOptions } from './types'
import { isCommand } from './types'

const ctx: Context = {
	run,
	del,
	hookOptions: []
}

async function execute(command: Command, options?: ExecuteOptions) {
	if (typeof command === 'function') {
		if (options?.sync) {
			return await command(ctx)
		} else {
			return command(ctx)
		}
	}
	if (typeof command !== 'string')
		return console.error(
			`command must be a function or a string.  Recieved type ${typeof command}`
		)

	const spawn = options?.sync ? sync : async

	return spawn(command, {
		shell: true,
		stdio: 'inherit'
	})
}

async function run(command: string | string[], options?: ExecuteOptions) {
	runCommand(command, options)
}

async function del(pattern: string[], options?: DelOptions) {
	if (options?.sync) return delRaw.sync(pattern, options)
	else return delRaw(pattern, options)
}

export async function runCommand(
	command: Command | Command[],
	options?: ExecuteOptions,
	hookOptions?: unknown[]
) {
	if (hookOptions) ctx.hookOptions = hookOptions
	let commands: Command[] = []

	if (isCommand(command)) {
		commands = [command]
	} else {
		commands = command
	}

	if (options?.sync) {
		for (const v of commands) {
			await execute(v, options)
		}
	} else {
		commands.forEach(v => execute(v, options))
	}
}
