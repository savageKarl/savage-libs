import { resolve, join } from 'path'
import mock from 'mock-fs'
import {
	camelCaseToHyphen,
	unionRegex,
	padEndWithSpace,
	existFile,
	setResHeader,
	rmValueFromArr,
	fnToString,
	injectCss,
	addPrefixForName,
	transform,
	generateJsDataUrlByCode,
	minifyCode,
	getViteConfigPath,
	hyphenToCamelCase,
	isObjectHasValue,
	conditionLog,
	removeCommentFromCode,
	getPkgNameByPath
} from '../../src/utils/utils'

// expect.addSnapshotSerializer({
// 	serialize(val, config, indentation, depth, refs, printer) {
// 		// `printer` is a function that serializes a value using existing plugins.
// 		return `Pretty foo: ${printer(val.foo, config, indentation, depth, refs)}`
// 	},
// 	test(val) {
// 		return val && Object.prototype.hasOwnProperty.call(val, 'foo')
// 	}
// })

function splicePath(p: string) {
	return join('__fileSnapshot__', p)
}

describe('utils', () => {
	it('existFile', () => {
		mock({
			folderName: {
				'index.md': '# Hello world!'
			}
		})
		const file = `${process.cwd()}/folderName/index.md`

		expect(existFile(file)).toBe(true)
		expect(existFile(process.cwd())).toBe(false)
		expect(existFile(resolve(process.cwd(), 'index.md'))).toBe(false)

		mock.restore()
	})

	it('setResHeader', () => {
		const res = {
			header: {},
			setHeader(k: string, v: string) {
				Object.assign(this.header, { [k]: v })
			}
		}

		const headers = {
			foo: 'foo',
			bar: 'bar'
		}

		expect(res.header).toStrictEqual({})
		setResHeader(res as any, headers)
		expect(res.header).toStrictEqual(headers)
	})

	it('rmValueFromArr', () => {
		const arr = [1, 2, 4, 5, 6]
		const value = [1, 4]
		expect(rmValueFromArr(arr as any, value as any)).toStrictEqual([2, 5, 6])
	})

	it('fnToString', () => {
		function fn(text: string) {
			return 'hello' + text
		}

		expect(fnToString(fn, 'dog')).toMatchFileSnapshot(
			splicePath('fnToString.js')
		)
	})

	it('unionRegex', () => {
		const regs = [/hello/, /fine/]
		expect(unionRegex(regs)).toEqual(/hello|fine/)
	})

	describe('injectCss', () => {
		it('should not minify', async () => {
			const options = {
				links: ['abc.css', 'foo.css'],
				minify: false,
				pluginName: 'vite-plugin-us',
				inline: '<style> h1 {color: blue}</style>'
			}

			expect(await injectCss(options)).toMatchFileSnapshot(
				splicePath('injectCssNotMinify.js')
			)
		})

		it('should  minify', async () => {
			const options = {
				links: ['abc.css', 'foo.css'],
				minify: true,
				pluginName: 'vite-plugin-us'
			}

			expect(await injectCss(options)).toMatchFileSnapshot(
				splicePath('injectCssMinify.js')
			)
		})
	})

	describe('addPrefixForName', () => {
		it('preview', () => {
			const options = {
				prefix: true,
				metaData: {
					name: 'cat'
				}
			}
			addPrefixForName(options as any, 'preview')
			expect(options.metaData.name).toBe('preview: cat')
		})

		it('development', () => {
			const options = {
				prefix: true,
				metaData: {
					name: 'cat'
				}
			}
			addPrefixForName(options as any, 'development')
			expect(options.metaData.name).toBe('development: cat')
		})

		it('production', () => {
			const options = {
				prefix: true,
				metaData: {
					name: 'cat'
				}
			}
			addPrefixForName(options as any, 'production')
			expect(options.metaData.name).toBe('production: cat')
		})
	})

	it('camelCaseToHyphen', () => {
		expect(camelCaseToHyphen('bigOne')).toBe('big-one')
	})

	it('padEndWithSpace', () => {
		const s = 'a'
		expect(padEndWithSpace(s, 5)).toBe('a    ')
	})

	it('generateJsDataUrlByCode', () => {
		function fn() {
			return 'foo'
		}
		expect(generateJsDataUrlByCode(fn.toString())).toMatchSnapshot()
	})

	describe('minifyCode', async () => {
		it('should minify css code', async () => {
			const css = `
			.header_1f-hhx {
				justify-content: normal !important;
			}
			
			.operation-area_HPE0LG {
				flex: 8;
				justify-content: end;
			}
			`
			expect(await minifyCode(css, 'css')).toMatchSnapshot()
		})

		it('should minify js code', async () => {
			function fn() {
				return 'foo'
			}
			expect(await minifyCode(fn.toString(), 'js')).toMatchSnapshot()
		})
	})

	it('getViteConfigPath', () => {
		// eslint-disable-next-line prefer-regex-literals
		expect(getViteConfigPath()).toMatch(new RegExp('vite.config.js'))
	})

	it('hyphenToCamelCase', () => {
		expect(hyphenToCamelCase('foo-bar')).toBe('fooBar')
	})
})
