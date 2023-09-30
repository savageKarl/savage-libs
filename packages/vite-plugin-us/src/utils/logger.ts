import pc from 'picocolors'

import { pluginName } from './constants'

type Msg = string | number | null | undefined
type PcKeys = keyof Omit<typeof pc, 'isColorSupported' | 'createColors'>
type LogOptions = {
	time: boolean
}
type Func = (msg: Msg, options?: LogOptions) => void
type LogKeys = 'info' | 'warn' | 'error'

function createLogger(tag: string) {
	const strategy = {
		info: 'white',
		warn: 'yellow',
		error: 'red'
	}

	const logRecord = {} as Record<LogKeys, Func>

	for (const [k, v] of Object.entries(strategy)) {
		logRecord[k as LogKeys] = (msg: Msg, options?: LogOptions) => {
			const strs = []

			options = Object.assign({ time: true }, options)

			if (options?.time) strs.push(pc.white(new Date().toLocaleTimeString()))
			strs.push(pc.bold(pc.blue(`[${tag}]`)))
			strs.push(pc[v as PcKeys](msg))

			console.log(strs.join(' '))
		}
	}

	return logRecord
}

// default logger
export const logger = createLogger(pluginName)
