import type { UmdOptions } from './types'

let umdOptions: Required<UmdOptions>

function getPkgNameByPath(path: string) {
	let pkgNmae: string
	const splitArr = path.split('/')
	if (/^@/.test(path)) {
		pkgNmae = [splitArr[0], splitArr[1]].join('/')
	} else {
		pkgNmae = splitArr[0]
	}

	return pkgNmae
}

function require(path: string) {
	const pkgName = getPkgNameByPath(path)
	// @ts-ignore
	return window[globalRecord[pkgName]]
}

function getListString(list: string[], template: string) {
	return list.map(v => template.replace('[name]', v)).join(',')
}

function getDepString(tempalte: string) {
	return getListString(umdOptions.external, tempalte)
}

function getVariableNameString(tempalte: string) {
	return getListString(
		Object.keys(umdOptions.globalVariableName).map(
			v => umdOptions.globalVariableName[v]
		),
		tempalte
	)
}

export function wrap(options: Required<UmdOptions>, code: string) {
	umdOptions = options

	const reg = /module\.exports\s?= ?([\w()]+)/

	code = code.replace(reg, 'Object.assign(exports, $1)')

	const template = `
  ;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, ${getDepString(
			`require('[name]')`
		)}) :
    typeof define === 'function' && define.amd ? define('${
			options.libraryName
		}',['exports', ${getDepString(`'[name]'`)}], factory) :
    (global = global || self, factory(global.${
			options.libraryName
		} = {}, ${getVariableNameString('global.[name]')}));
  }(this, (function (exports, ${getVariableNameString(
		'[name]'
	)}) { 'use strict';

  let globalRecord = ${JSON.stringify(options.globalVariableName)}

  let getPkgNameByPath = ${getPkgNameByPath.toString()}
	let _require = (()=>{ try { return require } catch {} })()
  let require = _require || ${require.toString()}

  ${code}

  })))`

	return template
}
