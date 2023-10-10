import { dataTypes } from 'savage-types'

import { copyDeep } from './copy'

const { isObject, isArray } = dataTypes

class Merge {
	private merge<T extends object, K extends object>(
		target: T,
		type: 'shallow' | 'deep',
		...sources: K[]
	) {
		if (isArray(sources)) {
			while (sources.length > 0) {
				const source = sources.pop() as K
				if (!isObject(source)) return target as T & K

				Reflect.ownKeys(source).forEach(k => {
					type KeyT = keyof T
					type KeyK = keyof K

					if (type === 'shallow')
						target[k as keyof T] = source[k as KeyK] as unknown as T[KeyT]
					else {
						if (!Reflect.has(target, k) || !isObject(source[k as KeyK])) {
							return (target[k as keyof T] = copyDeep(
								source[k as KeyK] as K
							) as unknown as T[KeyT])
						}
						this.merge(
							target[k as keyof T] as T,
							'deep',
							source[k as KeyK] as K
						)
					}
				})
			}

			return target as T & K
		}
		return target as T & K
	}

	mergeShallow = <T extends object, K extends object>(
		target: T,
		...sources: K[]
	) => {
		return this.merge(target, 'shallow', ...sources)
	}

	mergeDeep = <T extends object, K extends object>(
		target: T,
		...sources: K[]
	) => {
		return this.merge(target, 'deep', ...sources)
	}
}

const {
	/**
	 * 浅合并，只会合并第一层数据
	 */
	mergeShallow,
	/**
	 * 深合并，递归合并每一层数据
	 */
	mergeDeep
} = new Merge()

export { mergeShallow, mergeDeep }
