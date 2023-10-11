import {
	camelCaseToHyphen,
	unionRegex,
	padEndWithSpace
} from 'vite-plugin-us/utils/utils'

describe('utils', () => {
	test('camelCaseToHyphen', () => {
		expect(camelCaseToHyphen('bigOne')).toBe('big-one')
	})

	test('unionRegex', () => {
		const regs = [/hello/, /fine/]
		expect(unionRegex(regs)).toEqual(/hello|fine/)
	})

	test('padEndWithSpace', () => {
		const s = 'a'
		expect(padEndWithSpace(s, 5)).toBe('a    ')
	})
})
