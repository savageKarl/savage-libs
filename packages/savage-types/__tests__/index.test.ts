import { dataTypes } from '../src'

test('hello', () => {
	expect(dataTypes.isObject({})).toEqual(true)
	expect(1).toBe(1)
})
