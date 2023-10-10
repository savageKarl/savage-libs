class Copy {
	private copy<T>(target: T, type: 'shallow' | 'deep'): T {
		if (typeof target === 'object' && target !== null) {
			const obj = Reflect.construct(target.constructor, [])

			Object.keys(target).forEach(k => {
				obj[k as keyof T] =
					type === 'shallow'
						? target[k as keyof T]
						: (this.copy(target[k as keyof T] as object, 'deep') as (T &
								object)[keyof T])
			})
			return obj
		}

		return target
	}

	copyShallow = <T extends object>(obj: T) => {
		return this.copy(obj, 'shallow')
	}

	copyDeep = <T extends object>(obj: T) => {
		return this.copy(obj, 'deep')
	}
}

const {
	/** 浅拷贝，只会拷贝第一层数据 */
	copyShallow,
	/** 深拷贝，会递归拷贝每一层的数据 */
	copyDeep
} = new Copy()

export { copyShallow, copyDeep }
