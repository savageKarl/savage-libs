import { spawn } from 'child_process'

export type CommandCaller = string | (() => void)

export async function execute(command: CommandCaller) {
	if (typeof command === 'function') return await command()
	if (typeof command !== 'string')
		return console.error(
			`command must be a function or a string.  Recieved type ${typeof command}`
		)

	await new Promise(() => {
		spawn(command, {
			shell: true,
			stdio: 'inherit'
		})
	})
}

export function runCommand(command: CommandCaller | CommandCaller[]) {
	if (Array.isArray(command)) {
		command.forEach(v => {
			execute(v)
		})
	} else {
		execute(command)
	}
}

export interface RunCommand {
	(command: CommandCaller | CommandCaller[]): void
}
