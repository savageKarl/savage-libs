import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

import type { IPackageJson } from '@ts-type/package-dts'

import type { IncompatibleFun } from '../types/userscript'

export const pluginName = 'vite-plugin-us'

export const pkg = (() => {
	let pkg = '{}'
	try {
		pkg = readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
	} catch {}
	return JSON.parse(pkg) as IPackageJson
})()

export const devPath = `${pluginName}.dev.user.js`
export const previewPath = `${pluginName}.preview.user.js`
export const prodPath = `${pluginName}.prod.user.js`

export const htmlTempalte = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>vite-plugin-us</title>
</head>

<body>
<script>__code__</script>
</body>

</html>`

export const runAt = [
	/**
	 * 脚本将尽快注入。
	 */
	'document_start',
	/**
	 * 如果正文元素存在，将注入脚本。
	 */
	'document_body',
	/**
	 * 在调度 DOM内容加载事件时或之后，将注入脚本。
	 */
	'document_end',
	/**
	 * 在调度 DOM内容加载事件后，将注入脚本。
	 * 如果未给出`@run`时标记，则这是默认值。
	 */
	'document_idle',
	/**
	 * 如果在浏览器上下文菜单上单击脚本(仅在基于桌面chrome的浏览器上)，脚本将被注入。
	 * 注意:如果使用这个值，所有的`@include`和`@exclude`语句都将被忽略，但是这在将来可能会改变。
	 */
	'context_menu'
] as const

export const gmWindow = [
	'unsafeWindow',
	'window.onurlchange',
	'window.focus',
	'window.close'
] as const

export const gmFunctions = [
	'addStyle',
	'addElement',
	'deleteValue',
	'listValues',
	'addValueChangeListener',
	'removeValueChangeListener',
	'setValue',
	'getValue',
	'log',
	'getResourceText',
	'getResourceURL',
	'registerMenuCommand',
	'unregisterMenuCommand',
	'openInTab',
	'xmlhttpRequest',
	'download',
	'getTab',
	'saveTab',
	'getTabs',
	'notification',
	'setClipboard',
	'info'
] as const

export const incompatibleFun = [
	'GM.getResourceURL',
	'GM.xmlhttpRequest'
] as const

export const grants = gmFunctions
	.map(grant => [`GM_${grant}`, `GM.${grant}`])
	.flat()
	.concat(gmWindow)
	.filter(v => !incompatibleFun.includes(v as IncompatibleFun))
