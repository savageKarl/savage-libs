import { HeadMetaData } from '../types/userscript'

const padLen = 20

/**
 * generate userscript head meta with object config
 */
export function generateHeadMeta(script: HeadMetaData) {
	let result = '// ==UserScript==\n'
	if (script.name) {
		result += '// @name'.padEnd(padLen, ' ') + script.name + '\n'
	}
	if (script.namespace) {
		result += '// @namespace'.padEnd(padLen, ' ') + script.namespace + '\n'
	}
	if (script.version) {
		result += '// @version'.padEnd(padLen, ' ') + script.version + '\n'
	}
	if (script.author) {
		result += '// @author'.padEnd(padLen, ' ') + script.author + '\n'
	}
	if (script.description) {
		result += '// @description '.padEnd(padLen, ' ') + script.description + '\n'
	}
	if (script.homepage) {
		result += '// @homepage'.padEnd(padLen, ' ') + script.homepage + '\n'
	}
	if (script.icon) {
		result += '// @icon'.padEnd(padLen, ' ') + script.icon + '\n'
	}
	if (script.icon64) {
		result += '// @icon64'.padEnd(padLen, ' ') + script.icon64 + '\n'
	}
	if (script.updateURL) {
		result += '// @updateURL'.padEnd(padLen, ' ') + script.updateURL + '\n'
	}
	if (script.supportURL) {
		result += '// @supportURL'.padEnd(padLen, ' ') + script.supportURL + '\n'
	}
	if (script.downloadURL) {
		result += '// @downloadURL'.padEnd(padLen, ' ') + script.downloadURL + '\n'
	}
	if (script.include) {
		script.include.forEach(include => {
			result += '// @include'.padEnd(padLen, ' ') + include + '\n'
		})
	}
	if (script.matche) {
		script.matche.forEach(m => {
			result += '// @match'.padEnd(padLen, ' ') + m + '\n'
		})
	}
	if (script.exclude) {
		script.exclude.forEach(exclude => {
			result += '// @exclude'.padEnd(padLen, ' ') + exclude + '\n'
		})
	}
	if (script.require) {
		script.require.forEach(m => {
			result += '// @require'.padEnd(padLen, ' ') + m + '\n'
		})
	}
	if (script.resource) {
		script.resource.forEach(m => {
			result += '// @resource '.padEnd(padLen, ' ') + m + '\n'
		})
	}
	if (script.connect) {
		result += '// @connect'.padEnd(padLen, ' ') + String(script.connect) + '\n'
	}
	if (script.runAt) {
		result += '// @run-at'.padEnd(padLen, ' ') + script.runAt + '\n'
	}
	if (script.grant) {
		if (typeof script.grant === 'string') {
			result += '// @grant'.padEnd(padLen, ' ') + script.grant + '\n'
		} else {
			const arr = script.grant
			arr.forEach(item => {
				result += '// @grant'.padEnd(padLen, ' ') + String(item) + '\n'
			})
		}
	}
	if (script.noframes) {
		result += '@noframes\n'
	}
	if (script.nocompat) {
		result += '// @nocompat'.padEnd(padLen, ' ') + script.nocompat + '\n'
	}
	result += '// ==/UserScript==\n'

	return result
}
