import { typeList } from './typeList'

type TupleToObject<T extends readonly any[], F> = {
	[K in T[number]]: F
}

export const dataTypes = (function () {
	const obj = {} as TupleToObject<typeof typeList, (arg: any) => boolean>

	typeList.forEach(item => {
		obj[item] = function (v) {
			const typeStr = Object.prototype.toString.call(v).slice(8, -1)
			return item.slice(2) === typeStr
		}
	})

	return obj
})()

/**
 * obtain the string form of the data type
 */
export const getType = (value: unknown, capitalized = true) => {
	const s = Object.prototype.toString.call(value).slice(8, -1)
	if (capitalized) return s

	return s.toLocaleLowerCase()
}

/**
 * determine whether the data types are equal
 */
export const isSameType = (v: unknown, k: unknown) => {
	return getType(v) === getType(k)
}
