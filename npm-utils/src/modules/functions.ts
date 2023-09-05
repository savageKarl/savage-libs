// a[3].b -> a.3.b -> [a, 3, b]
/** lodash get方法 */
/**
 * @example
 *
 * ```ts
 * const object = { a: [{ b: { c: 3 } }] }
 * console.log(get(object, 'a[0].b.c')) // 3
 * ```
 * @param data
 * @param path
 * @returns
 */
export function get(data: Record<string, any>, path: string) {
	const paths = path
		.replace(/\[(\w+)\]/g, '.$1')
		.replace(/\["(\w+)"\]/g, '.$1')
		.replace(/\['(\w+)'\]/g, '.$1')
		.split('.')

	return paths.reduce((x, y) => x?.[y], data)
}

/** 单例模式 */
export function getSingle<T = unknown>(fn: () => T) {
	let res: T

	return function (this: unknown, ...args: any) {
		return res || (res = fn.apply(this, args))
	}
}
