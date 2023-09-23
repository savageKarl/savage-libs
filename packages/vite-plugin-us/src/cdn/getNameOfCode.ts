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

let code: string
let pkgNameGlobal: string

const regUmd = unionRegex(regUmdRules)
const regNameWithUmd = unionRegex(regNameWithUmdRules)

const regGlobal = unionRegex(regGlobalRules)
const regNameWithGlobal = unionRegex(regNameWithGlobalRules)

const regIife = unionRegex(regIifeRules)
const regNameWithIife = unionRegex(regNameWithIifeRules)

function getModuleType() {
	const type: 'umd' | 'global' | 'iife' = 'umd'
	if (regUmd.exec(code)) return 'umd'
	if (regGlobal.exec(code)) return 'global'
	if (regIife.exec(code)) return 'iife'

	return type
}

function capitalizeName() {
	const upperCase = pkgNameGlobal.split('-').reduce((pre, cur) => {
		const splitArr = cur.split('')
		splitArr[0] = splitArr[0].toUpperCase()
		return pre + splitArr.join('')
	}, '')

	const splitArr = upperCase.split('')
	splitArr[0] = splitArr[0].toLowerCase()

	const lowerCase = splitArr.join('')

	return [lowerCase, upperCase]
}

function getNameFromCode() {
	const type = getModuleType()

	const strategy = {
		umd: getNameFromUmdModule,
		global: getNameFromGlobalModule,
		iife: getNameFromIifeModule
	}

	const name = strategy[type]()

	return name || ''
}

/** not pure function */
function getNameFromUmdModule() {
	const regNames = capitalizeName()
	regNameWithUmdRules.unshift(`(?<name0>${regNames[0]})` as unknown as RegExp)
	regNameWithUmdRules.unshift(`(?<name1>${regNames[1]})` as unknown as RegExp)

	const matchResult = regNameWithUmd.exec(code)

	const key = Object.keys(matchResult?.groups || {}).filter(k => {
		const isNameKey = /name/.test(k)
		const isHaveValue = matchResult?.groups?.[k]

		return isNameKey && isHaveValue
	})[0]

	const name = matchResult?.groups?.[key] ?? pkgNameGlobal

	return name
}

function getNameFromGlobalModule() {
	return code.match(regNameWithGlobal)?.groups?.name ?? pkgNameGlobal
}

function getNameFromIifeModule() {
	return code.match(regNameWithIife)?.groups?.name ?? pkgNameGlobal
}

/** not pure function */
export async function getGlobalNameFromUrl(pkgName: string, url: string) {
	pkgNameGlobal = pkgName
	const content = (await serviceCDN.get(url)).data as string
	code = content
	const globalVariableName = getNameFromCode()

	return { pkgName, globalVariableName }
}
