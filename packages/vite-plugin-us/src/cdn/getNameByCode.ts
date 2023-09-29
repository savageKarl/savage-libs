import jsdom from 'jsdom'

import { Chain } from '../utils/chain'
import { serviceCDN } from './service'

import { unionRegex } from '../utils/utils'
import {
	regGlobalRules,
	regNameWithGlobalRules,
	regNameWithUmdRules,
	regUmdRules,
	regIifeRules,
	regNameWithIifeRules
} from './regexRules'

class GlobalVariableNameEval {
	constructor() {
		const { JSDOM } = jsdom
		const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`)
		// @ts-ignore
		global.window = dom.window
		global.document = dom.window.document
		// @ts-ignore
		global.self = global
	}

	private getKeys() {
		return {
			windowKeys: Object.keys(global.window),
			globalKeys: Object.keys(global)
		}
	}

	getNameByCode(code: string) {
		// eslint-disable-next-line no-eval
		const _eval = eval
		const { windowKeys, globalKeys } = this.getKeys()
		_eval(code)
		const { windowKeys: windowKeysNew, globalKeys: globalKeysNew } =
			this.getKeys()

		const windowKeyName = windowKeysNew.filter(v => !windowKeys.includes(v))[0]
		const globalKeyName = globalKeysNew.filter(v => !globalKeys.includes(v))[0]
		return windowKeyName || globalKeyName || ''
	}
}

class GlobalVariableNameRegex {
	code: string
	pkgName: string

	constructor(pkgNmae: string, code: string) {
		this.pkgName = pkgNmae
		this.code = code
	}

	capitalizeName() {
		const camelCaseName = this.pkgName.split('-').reduce((pre, cur) => {
			const splitArr = cur.split('')
			splitArr[0] = splitArr[0].toUpperCase()
			return pre + splitArr.join('')
		}, '')

		const upperCaseName = this.pkgName.toUpperCase()

		return [camelCaseName, upperCaseName]
	}

	getModuleType() {
		const regUmd = unionRegex(regUmdRules)
		const regGlobal = unionRegex(regGlobalRules)
		const regIife = unionRegex(regIifeRules)

		const type: 'umd' | 'global' | 'iife' = 'umd'
		if (regUmd.exec(this.code)) return 'umd'
		if (regGlobal.exec(this.code)) return 'global'
		if (regIife.exec(this.code)) return 'iife'
		return type
	}

	getNameByCode() {
		const type = this.getModuleType()

		const strategy = {
			umd: this.getNameFromUmdModule,
			global: this.getNameFromGlobalModule,
			iife: this.getNameFromIifeModule
		}

		const name = strategy[type].apply(this)

		return name || ''
	}

	getNameFromUmdModule() {
		const regNames = this.capitalizeName()
		const regNameRules = [
			`(?<name0>${regNames[0]})` as unknown as RegExp,
			`(?<name1>${regNames[1]})` as unknown as RegExp,
			...regNameWithUmdRules
		]
		const regNameWithUmd = unionRegex(regNameRules)

		const matchResult = regNameWithUmd.exec(this.code)

		const key = Object.keys(matchResult?.groups || {}).filter(k => {
			const isNameKey = /name/.test(k)
			const isHaveValue = matchResult?.groups?.[k]

			return isNameKey && isHaveValue
		})[0]

		const name = matchResult?.groups?.[key]

		return name
	}

	getNameFromGlobalModule() {
		const regNameWithGlobal = unionRegex(regNameWithGlobalRules)
		return this.code.match(regNameWithGlobal)?.groups?.name
	}

	getNameFromIifeModule() {
		const regNameWithIife = unionRegex(regNameWithIifeRules)
		return this.code.match(regNameWithIife)?.groups?.name
	}
}

export function getNameByCode(pkgName: string, code: string) {
	const chain = new Chain()

	const nodeEval = chain.turnToNode(() => {
		const globalVariableNameEval = new GlobalVariableNameEval()
		const name = globalVariableNameEval.getNameByCode(code)
		return name || 'nextNode'
	})

	const nodeRegex = chain.turnToNode(() => {
		const globalVariableNameRegex = new GlobalVariableNameRegex(pkgName, code)
		const name = globalVariableNameRegex.getNameByCode()
		return name || 'nextNode'
	})

	const nodeLast = chain.turnToNode(() => {
		return ''
	})

	nodeEval.setNextNode(nodeRegex).setNextNode(nodeLast)

	const name = nodeEval.passRequest<string>()

	return name
}
