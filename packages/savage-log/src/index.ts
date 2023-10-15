import picox from 'picox'

const logFns = ['success', 'info', 'warn', 'error'] as const

type LogLevel = (typeof logFns)[number]

export interface LoggerOptions {
	/**
	 * if it is `success`, then will show `'success', 'info', 'warn', 'error'` msg
	 *
	 * if it is `info`, then will show `'info', 'warn', 'error'` msg
	 *
	 * if it is `warn`, then will show `'warn', 'error'` msg
	 *
	 * if it is `error`, then will show `'error'` msg
	 * @defaultValue `success`
	 */
	logLevel?: LogLevel
	/**
	 * @defaultValue `''`
	 */
	label?: string
	/**
	 * add time before message
	 *
	 * @defaultValue `true`
	 */
	time?: boolean
}

export class Logger {
	private _isSilent = false
	private _logLevel: LogLevel
	private label: string
	private time: boolean

	constructor(options: LoggerOptions) {
		const defaultOptions: LoggerOptions = {
			label: '',
			logLevel: 'success',
			time: true
		}

		const resolvedOptions = Object.assign(
			defaultOptions,
			options
		) as Required<LoggerOptions>

		this.label = resolvedOptions.label
		this._logLevel = resolvedOptions.logLevel
		this.time = resolvedOptions.time
	}

	get isSilent() {
		return this._isSilent
	}

	get logLevel() {
		return this._logLevel
	}

	private log(msg: string, logFn: LogLevel) {
		const strs: string[] = []

		if (this.time) strs.push(picox.bold.white(new Date().toLocaleTimeString()))

		if (this.label) strs.push(picox.bold.blue(this.label))
		strs.push(msg)

		if (this._isSilent) return

		const index = logFns.findIndex(v => v === this._logLevel)
		if (logFns.slice(index).includes(logFn)) console.log(strs.join(' '))
	}

	/**
	 *
	 * if `true`, will not show any message
	 */
	public setSilent(silent: boolean) {
		this._isSilent = silent
	}

	public setLogLevel(level: LogLevel) {
		this._logLevel = level
	}

	public success(...args: string[]) {
		return this.log(picox.green(args.join(' ')), 'success')
	}

	public info(...args: string[]) {
		return this.log(picox.gray(args.join(' ')), 'info')
	}

	public warn(...args: string[]) {
		return this.log(picox.yellow(args.join(' ')), 'warn')
	}

	public error(...args: string[]) {
		return this.log(picox.red(args.join(' ')), 'error')
	}
}

export function createLogger(options: LoggerOptions = {}) {
	return new Logger(options)
}

export default createLogger
