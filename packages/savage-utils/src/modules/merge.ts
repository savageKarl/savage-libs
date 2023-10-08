import { dataTypes } from 'savage-types'

import { deepCopy } from './copy'

type ObjectKey = keyof object

const { isObject, isArray } = dataTypes

class Merge {
	private merge(
		target: object,
		type: 'shallow' | 'deep',
		...sources: object[]
	) {
		if (isArray(sources)) {
			while (sources.length > 0) {
				const source = sources.pop() as object
				if (!isObject(source)) return

				Reflect.ownKeys(source).forEach(k => {
					if (type === 'shallow')
						target[k as ObjectKey] = source[k as ObjectKey]
					else {
						if (!Reflect.has(target, k) || !isObject(source[k as ObjectKey])) {
							return (target[k as ObjectKey] = deepCopy(source[k as ObjectKey]))
						}
						this.merge(
							target[k as ObjectKey] as object,
							'deep',
							source[k as ObjectKey]
						)
					}
				})
			}

			return target
		}
		return target
	}

	shallowMerge = (target: object, ...sources: object[]) => {
		return this.merge(target, 'shallow', ...sources)
	}

	deepMerge = (target: object, ...sources: object[]) => {
		return this.merge(target, 'deep', ...sources)
	}
}

const {
	/**
	 * 浅合并，只会合并第一层数据
	 */
	shallowMerge,
	/**
	 * 深合并，递归合并每一层数据
	 */
	deepMerge
} = new Merge()

export { shallowMerge, deepMerge }
