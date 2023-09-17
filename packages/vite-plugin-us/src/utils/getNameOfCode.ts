import axios from 'axios'

axios.interceptors.response.use(
	function (response) {
		return response.data
	},
	function (error) {
		return Promise.reject(error)
	}
)

const regUmdRules = [
	/typeof exports ?={2,3} ?(?<quote>'|")object\k<quote> ?&& ?typeof module ?!={1,2} ?\k<quote>undefined\k<quote>/g,
	/typeof define ?={2,3} ?(?<quote>'|")function\k<quote> ?&& ?define\.amd/g,
	/typeof globalThis ?!={1,2} ?(?<quote>'|")undefined\k<quote> ?\? ?globalThis/g,
	/function"={2,3}typeof ?define&&define/g,
	/"object"={2,3}typeof exports ?&& ?"undefined"!={1,2}typeof module/g,
	/(module\.)?exports/g
]

const regUmd = regUmdRules
	.map(r => String(r).replace(/\/|g/g, ''))
	.join('|')
	.replace(/\$/, '')

const regNameWithUmdRules = [
	/function ?\((?<this>\w+?), ?\w+?\)[\s\S]+?\k<this>\.(?<name1>\w+) ?= ?/g,
	/\.(?<name2>\w+)=((\{\})|(\w+\(\)))/g
]

const regNameWithUmd = regNameWithUmdRules
	.map(r => String(r).replace(/\/|g/g, ''))
	.join('|')
	.replace(/\$/, '')

function getModuleType(code) {
	let type: 'umd' | 'global' | 'iife'
}

function capitalizeName(name: string) {
	const upperCase = name.split('-').reduce((pre, cur) => {
		const splitArr = cur.split('')
		splitArr[0] = splitArr[0].toUpperCase()
		return pre + splitArr.join('')
	}, '')

	const splitArr = upperCase.split('')
	splitArr[0] = splitArr[0].toLowerCase()

	const lowerCase = splitArr.join('')

	return [lowerCase, upperCase]
}

export async function getGlobalNameFromUrl(pkgName: string, url: string) {
	const names = capitalizeName(pkgName)
	regNameWithUmdRules.unshift(names[0] as unknown as RegExp)
	regNameWithUmdRules.unshift(names[1] as unknown as RegExp)

	const name = pkgName
	const code = await axios.get(url)

	return {
		pkgName,
		globalVariableName: name
	}
}
