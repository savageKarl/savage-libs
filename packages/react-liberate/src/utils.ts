import { isObject, isArray, isUndefined } from 'savage-types'
import { copyDeep } from 'savage-utils'

export function reactiveMerge<T extends object>(x: T, y: T, clear = false) {
	if (clear) {
		const xKey = Object.keys(x)
		const yKey = Object.keys(y)

		const deleteKeys = xKey.filter(k => !yKey.includes(k))
		deleteKeys.forEach(k => Reflect.deleteProperty(x, k))
	}

	for (const k in y) {
		const xValue = x[k]
		const yValue = y[k]

		if (xValue === yValue) continue

		if (isObject(yValue) && isObject(xValue)) {
			reactiveMerge(xValue, yValue, clear)
		} else if (isArray(yValue)) {
			if (isUndefined(xValue)) x[k] = [] as T[Extract<keyof T, string>]
			// @ts-ignore
			x[k].length = yValue.length
			// @ts-ignore
			yValue.forEach((_, k2) => (x[k][k2] = yValue[k2]))
		} else {
			x[k] = copyDeep(y[k] as object) as T[Extract<keyof T, string>]
		}
	}
}
