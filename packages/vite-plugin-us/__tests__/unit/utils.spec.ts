import {
	camelCaseToHyphen,
	injectExternalCssLink,
	unionRegex,
	padEndWithSpace
} from 'vite-plugin-us/utils/utils'

describe('utils', () => {
	test('camelCaseToHyphen', () => {
		expect(camelCaseToHyphen('bigOne')).toBe('big-one')
	})

	test('injectExternalCssLink', () => {
		const res = `;(function(links2) {
    window.addEventListener("DOMContentLoaded", () => {
      links2.forEach((v) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = v;
        document.head.appendChild(link);
      });
    });
  })(["xxxx","xxxx"]);`
		expect(injectExternalCssLink(['xxxx', 'xxxx'])).toBe(res)
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
