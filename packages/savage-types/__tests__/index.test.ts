import { isObject } from '../src'

test('hello', () => {
  expect(isObject({})).toEqual(true)
  expect(1).toBe(1)
})
