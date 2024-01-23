import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { TypeInfo } from './types'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const docsUrl = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'

const fnsFilename = 'fnList.ts'

export const fnsFilePath = resolve(__dirname, fnsFilename)

export const indexFilePath = resolve(__dirname, 'index.ts')

export const specialType: TypeInfo = {
	Null: {
		isLowerCase: true
	},
	AsyncFunction: {
		tsIgnore: true,
		isExclude: true
	},
	Undefined: {
		isLowerCase: true
	},
	Array: {
		isGenerics: true,
		genericsLen: 1
	},
	AsyncIterator: {
		isGenerics: true,
		genericsLen: 1
	},
	FinalizationRegistry: {
		isGenerics: true,
		genericsLen: 1
	},
	GlobalThis: {
		isExclude: true
	},
	isInfinity: {
		isExclude: true
	},
	InternalError: {
		isExclude: true
	},
	Iterator: {
		isGenerics: true,
		genericsLen: 1
	},
	NaN: {
		isExclude: true
	},
	Reflect: {
		isExclude: true
	},
	Intl: {
		isExclude: true
	},
	Infinity: {
		isExclude: true
	},
	Map: {
		isGenerics: true,
		genericsLen: 2
	},

	Promise: {
		isGenerics: true,
		genericsLen: 1
	},
	Proxy: {
		isExclude: true
	},
	Set: {
		isGenerics: true,
		genericsLen: 1
	},
	WeakMap: {
		isGenerics: true,
		genericsLen: 2,
		weakGenerics: true
	},
	WeakRef: {
		isGenerics: true,
		genericsLen: 1,
		weakGenerics: true
	},
	WeakSet: {
		isGenerics: true,
		genericsLen: 1,
		weakGenerics: true
	},
	TypedArray: {
		isExclude: true
	}
}
