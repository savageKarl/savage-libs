import picocolors from 'picocolors'
import { Colors } from 'picocolors/types'

interface StylesLogInstance {
	(...args: unknown[]): string
	isColorSupported: boolean
	reset: this
	bold: this
	dim: this
	italic: this
	underline: this
	inverse: this
	hidden: this
	strikethrough: this
	black: this
	red: this
	green: this
	yellow: this
	blue: this
	magenta: this
	cyan: this
	white: this
	gray: this
	bgBlack: this
	bgRed: this
	bgGreen: this
	bgYellow: this
	bgBlue: this
	bgMagenta: this
	bgCyan: this
	bgWhite: this
}

const colorFnStack = new Set<string>()

const colorFns = Object.keys(picocolors).filter(
	key =>
		typeof picocolors[key as keyof Colors] === 'function' &&
		key !== 'createColors'
)

function createColors(enabled?: boolean) {
	const pico = picocolors.createColors(enabled)

	class StylesLog extends Function {
		isColorSupported: boolean

		constructor() {
			super('return ("Welcome to styles-log")')
			this.isColorSupported = pico.isColorSupported

			injectColorFn.apply(this)
			function injectColorFn() {
				colorFns.forEach(v => {
					// @ts-ignore
					this[v] = (...input: string[]) => {
						const str = [...colorFnStack].reverse().reduce((preV, curV) => {
							return pico[curV as keyof Omit<Colors, 'isColorSupported'>](preV)
						}, input.join(' '))

						colorFnStack.clear()

						return str
					}
					// @ts-ignore
					this[v] = this[v].bind(this)
					// @ts-ignore
					Reflect.setPrototypeOf(this[v], new Proxy(this, handler))
				})
			}
		}
	}

	const handler = {
		get(obj: StylesLog, prop: keyof StylesLog) {
			if (typeof prop === 'string' && colorFns.includes(prop)) {
				colorFnStack.add(prop)
			}
			return obj[prop]
		}
	}

	return new Proxy(new StylesLog(), handler) as StylesLogInstance
}

const color = createColors()

const styleLog = color as typeof color & { createColors: typeof createColors }
styleLog.createColors = createColors

export default styleLog
