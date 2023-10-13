import picocolors from 'picocolors'
import { Colors } from 'picocolors/types'

import type { StylesLogInstance } from './types'

export type { StylesLogInstance } from './types'

const colorFnStack = new Set<string>()

const colorFnKeys = Object.keys(picocolors).filter(
	key =>
		typeof picocolors[key as keyof Colors] === 'function' &&
		key !== 'createColors'
)

function createColors(enabled?: boolean) {
	const pico = picocolors.createColors(enabled)

	class StylesLog extends Function {
		isColorSupported: boolean

		constructor() {
			super('return ("Welcome to picox")')
			this.isColorSupported = pico.isColorSupported

			injectColorFn.apply(this)
			function injectColorFn() {
				colorFnKeys.forEach(v => {
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
			if (typeof prop === 'string' && colorFnKeys.includes(prop)) {
				colorFnStack.add(prop)
			}
			return obj[prop]
		}
	}

	return new Proxy(new StylesLog(), handler) as StylesLogInstance
}

const color = createColors()

export type StylesLog = StylesLogInstance & {
	createColors: typeof createColors
}

export const picox = color as StylesLog
picox.createColors = createColors

export default picox
