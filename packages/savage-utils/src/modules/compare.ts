import { isObject, isNull } from 'savage-types'

class Compare {
	private compare<T extends object, K extends T>(
		o1: T,
		o2: K,
		type: 'shallow' | 'deep'
	): boolean {
		if (o1 === o2) return true

		// 如果基本类型不相等或者不是引用类型，并且不是对象就不用执行了
		if (!isObject(o1) || isNull(o1) || !isObject(o2) || isNull(o2)) {
			return false
		}

		const len1 = Object.keys(o1).length
		const len2 = Object.keys(o2).length

		if (len1 !== len2) return false

		for (const key of Object.keys(o1)) {
			const _key = key as keyof object

			if (type === 'shallow') {
				if (o1[_key] !== o2[_key]) return false
			}

			if (type === 'deep') {
				const result = this.compare(o1[_key] as object, o2[_key], 'deep')
				if (!result) return result
			}
		}

		return true
	}

	// 对象浅比较，只比较第一层数据
	compareShallow = <T extends object, K extends T>(o1: T, o2: K) => {
		return this.compare(o1, o2, 'shallow')
	}

	// 对象深比较，比较所有层数据，深比较主要的点在于，Object或Array实例的每一个属性，基本类型或者特殊构造器类型是否相同
	compareDeep = <T extends object, K extends T>(o1: T, o2: K) => {
		return this.compare(o1, o2, 'deep')
	}
}

const { compareShallow, compareDeep } = new Compare()

export { compareShallow, compareDeep }
