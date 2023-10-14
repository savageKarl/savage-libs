import { writeFile, readFile } from 'node:fs/promises'

import axios from 'axios'
import { load } from 'cheerio'

import { docsUrl, fnsFilePath, specialType, indexFilePath } from './constants'

import type { TypeInfoItem } from './types'

function genericsStr(len: number, weakGenerics = false) {
	const arr: ('unknown' | 'object')[] = []
	arr.length = len
	arr.fill('unknown')

	if (weakGenerics) arr[0] = 'object'

	return `<${arr.join(',')}>`
}

function generateTempale(name: string, typeInfoItem: TypeInfoItem) {
	const {
		isExclude,
		isGenerics,
		isLowerCase,
		genericsLen,
		weakGenerics,
		tsIgnore
	} = typeInfoItem

	if (isExclude) return ''

	const strs: string[] = []

	if (tsIgnore) strs.push('// @ts-ignore')

	strs.push(
		`export function is${name}(value: unknown): value is ${
			isLowerCase ? name.toLowerCase() : name
		}${isGenerics ? genericsStr(genericsLen as number, weakGenerics) : ''} {`
	)

	strs.push(
		`  return Object.prototype.toString.call(value).slice(8, -1) === '${name}'`
	)

	strs.push('}')

	return strs.join('\n')
}

async function getBuiltInObjects() {
	const data = (await axios.get(docsUrl)).data
	const $ = load(data)
	const lis = $('.sidebar-body > ol').children().eq(7).find('li')

	const completeTypeInfos = lis
		.map(function () {
			return $(this).text()
		})
		.toArray()
		.filter(name => {
			const isNotOverview = name !== 'Overview'
			const isNotFunction = !/\(\)/.test(name)

			return isNotOverview && isNotFunction
		})
		.map(name => {
			name = /\w+/.exec(name)?.[0] as string

			const splitArr = name.split('')
			splitArr[0] = splitArr[0].toUpperCase()

			return splitArr.join('')
		})
		.reduce((preV, curV) => Object.assign(preV, { [curV]: {} }), {})

	return Object.assign(completeTypeInfos, specialType)
}

main()
async function main() {
	const completeObjects = await getBuiltInObjects()

	const fnStr = Object.keys(completeObjects).map(k =>
		generateTempale(k, completeObjects[k])
	)

	fnStr.unshift('/* eslint-disable */')

	writeFile(fnsFilePath, fnStr.join('\n'), { encoding: 'utf-8' })

	// readFile(indexFilePath, { encoding: 'utf-8' }).then(content => {
	// 	let namestr = Object.keys(completeObjects)
	// 		.filter(k => !completeObjects[k].isExclude)
	// 		.map(name => `- is${name}`)
	// 		.join('\n')

	// 	namestr = `\n\n${namestr}\n\n`

	// 	const reg = /## all of api(?<str>[\s\S]+)\*\//

	// 	const oldStr = content.match(reg)?.groups?.str as string

	// 	writeFile(indexFilePath, content.replace(oldStr, namestr))
	// })
}
