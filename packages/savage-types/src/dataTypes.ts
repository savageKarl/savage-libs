import * as fns from './fnList'

export * from './fnList'

/**
 * obtain the string form of the data type
 * @param upperCase - default `true`
 */
export const typeOf = (value: unknown, upperCase = true) => {
	const s = Object.prototype.toString.call(value).slice(8, -1)
	if (upperCase) return s

	return s.toLocaleLowerCase()
}

export const types = Object.assign({ typeOf }, fns)

export default types
