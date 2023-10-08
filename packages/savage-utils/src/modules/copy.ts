import { dataTypes } from 'savage-types'

class Copy {
	private copy<T extends object>(o: T, type: 'shallow' | 'deep'): T {
		if (dataTypes.isObject(o)) {
			const obj: any = {}
			Object.keys(o).forEach(k => {
				obj[k] =
					type === 'shallow'
						? o[k as keyof T]
						: this.copy(o[k as keyof T] as any, 'deep')
			})
			return obj
		}

		if (dataTypes.isArray(o)) {
			return (o as any as Array<any>).map(item =>
				type === 'shallow' ? item : this.copy(item, 'deep')
			) as any
		}

		return o
	}

	shallowCopy = <T extends object>(obj: T) => {
		return this.copy(obj, 'shallow')
	}

	deepCopy = <T extends object>(obj: T) => {
		return this.copy(obj, 'deep')
	}
}

const {
	/** 浅拷贝，只会拷贝第一层数据 */
	shallowCopy,
	/** 深拷贝，会递归拷贝每一层的数据 */
	deepCopy
} = new Copy()

export { shallowCopy, deepCopy }
