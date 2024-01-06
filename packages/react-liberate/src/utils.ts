import { isObject, isArray } from 'savage-types'

export function reactiveMerge<T>(x: T, y: T) {
	for (const k in y) {
		const value = y[k]

		if (isObject(value)) {
			reactiveMerge(x[k], value)
		} else if (isArray(value)) {
			// @ts-ignore
			x[k].length = value.length
			// @ts-ignore
			value.forEach((_, k2) => (x[k][k2] = value[k2]))
		} else {
			x[k] = y[k]
		}
	}
}
