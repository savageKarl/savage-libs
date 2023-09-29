export const regUmdRules = [
	/typeof exports ?={2,3} ?(?<quote>'|")object\k<quote> ?&& ?typeof module ?!={1,2} ?\k<quote>undefined\k<quote>/g,
	/typeof define ?={2,3} ?(?<quote1>'|")function\k<quote1> ?&& ?define\.amd/g,
	/typeof globalThis ?!={1,2} ?(?<quote2>'|")undefined\k<quote2> ?\? ?globalThis/g,
	/function"={2,3}typeof ?define&&define/g,
	/"object"={2,3}typeof exports ?&& ?"undefined"!={1,2}typeof module/g,
	/typeof ?module ?={2,3} ?"object" ?&& ?typeof ?module.exports ?={2,3} ?"object"/g,
	/"object"={2,3}typeof ?module ?&& ?"object" ?={2,3} ?typeof module.exports/g
]

export const regNameWithUmdRules = [
	/function ?\((?<this>\w+?), ?\w+?\)[\s\S]+?\k<this>\.(?<name3>\w+) ?= ?/g,
	/\.(?<name4>\w+)=((\{\})|(\w+\(\)))/g
]

export const regGlobalRules = [/^var (?<name>\w+) ?= ?\(?function ?\(\w+/g]

export const regNameWithGlobalRules = regGlobalRules

export const regIifeRules = [
	/(;\(|!)function ?\((?<this>.)\) ?\{[\s\S]+\k<this>\.(?<name>\w+) ?= ?\w+/g
]

export const regNameWithIifeRules = regIifeRules

export const regPkgFolderRules: string[] = ['dist', 'umd', 'iife', 'js']
export const regPkgFileNameRules: string[] = [
	'global.prod',
	'iife.prod',
	'iife',
	'prod',
	'production',
	'production.min',
	'index',
	'index.full'
]
