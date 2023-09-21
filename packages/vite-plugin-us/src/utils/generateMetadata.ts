import { HeadMetaData } from '../types/userscript'

import { camelCaseToHyphen, padEndWithSpace } from './utils'

/**
 * generate userscript head meta with object config
 */

export function generateHeadMeta(options: HeadMetaData) {
	const useHyphen = ['excludeMatch', 'runAt']
	const tupleArray = ['antifeature', 'resource']
	const padLen = 31
	let metadataList: string[] = []

	for (let [k, v] of Object.entries(options)) {
		if (useHyphen.includes(k)) k = camelCaseToHyphen(k)

		if (typeof v === 'string') v = [v]

		if (Array.isArray(v)) {
			if (tupleArray.includes(k)) {
				v.forEach(subv => {
					let [type, value, tag] = subv
					tag = tag ? `:${tag}` : ''

					const fistParagraph = padEndWithSpace(k + tag, 19)
					const fullParagraph = padEndWithSpace(fistParagraph + type, padLen)

					metadataList.push(`${fullParagraph}${value}`)
				})
			} else {
				v.forEach(subv => {
					const value = subv
					metadataList.push(`${padEndWithSpace(k, padLen)}${value}`)
				})
			}
		}
	}

	metadataList = metadataList.map(v => `// @${v}`)

	return ['// ==UserScript==', ...metadataList, '// ==/UserScript=='].join('\n')
}
