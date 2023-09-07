import { dataTypes } from 'savage-data-types'

/**
 * 迭代器模式：内部迭代器，由函数内部控制自动进行迭代
 *
 * @param obj 目标对象
 * @param fn 回调函数
 */
export function each<T extends object>(
	obj: T,
	fn: (v: T[keyof T], i: keyof T, obj: T) => unknown
) {
	if (dataTypes.isObject(obj) || dataTypes.isArray(obj)) {
		for (const k in obj) {
			const res = fn(obj[k], k, obj)
			if (dataTypes.isBoolean(res) && String(res) === 'false') break
		}
	}
}

/**
 * 迭代器模式：外部迭代器，由外部控制进行迭代
 */
export class Iterator<T extends any[]> {
	constructor(obj: T) {
		let current = 0

		this.next = () => {
			current += 1
		}

		this.isDone = () => {
			return current + 1 >= this.length
		}

		this.length = obj.length

		this.getCurrentItem = () => {
			return obj[current]
		}
	}

	next: () => void
	isDone: () => boolean
	getCurrentItem: () => T[keyof T]
	length: number
}
