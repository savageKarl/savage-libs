const runAt = [
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

const gmFunctions = [
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

const incompatibleFun = ['GM.getResourceURL', 'GM.xmlhttpRequest'] as const
type IncompatibleFun = (typeof incompatibleFun)[number]

type GMLiterals<T extends string> = [`GM_${T}` | `GM.${T}`]
type GMWindow = (typeof gmWindow)[number]

export type Grants = Exclude<
	GMWindow | GMLiterals<(typeof gmFunctions)[number]>[number],
	(typeof incompatibleFun)[number]
>

export const grants = gmFunctions
	.map(grant => [`GM_${grant}`, `GM.${grant}`])
	.flat()
	.concat(gmWindow)
	.filter(v => !incompatibleFun.includes(v as IncompatibleFun))

/**
 * version: @see https://www.tampermonkey.net/changelog.phpversion=4.19.0&ext=dhdg
 * document: @see https://www.tampermonkey.net/documentation.phpext=dhdg&version=4.19.0
 */
export interface UserScript {
	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:name
	 */
	name: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:namespace
	 */
	namespace?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:copyright
	 */
	copyright?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:version
	 */
	version: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:description
	 */
	description?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:icon
	 */
	icon?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:icon
	 */
	iconURL?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:icon
	 */
	defaulticon?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:icon64
	 */
	icon64?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:icon64
	 */
	icon64URL?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:grant
	 */
	grant?: Grants[]

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:author
	 */
	author?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:homepage
	 */
	homepage?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:homepage
	 */
	homepageURL?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:homepage
	 */
	website?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:homepage
	 */
	source?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:antifeature
	 */
	antifeature?: [type: string, value: string, tag?: string][]

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:require
	 */
	require?: string[]

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:resource
	 */
	resource?: [key: string, value: string][]

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:include
	 */
	include?: string[]

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:match
	 * @see https://violentmonkey.github.io/api/metadata-block/#match--exclude-match
	 */
	match: string[]

	/**
	 * @see https://violentmonkey.github.io/api/metadata-block/#match--exclude-match
	 */
	excludeMatch?: string[]

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:exclude
	 */
	exclude?: string[]

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:run_at
	 */
	runAt?: (typeof runAt)[number]

	/**
	 * @see https://www.tampermonkey.net/documentation.phpmeta:sandbox
	 */
	sandbox?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:connect
	 */
	connect?: string[]

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:noframes
	 */
	noframes?: boolean

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:updateURL
	 */
	updateURL?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:downloadURL
	 */
	downloadURL?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:supportURL
	 */
	supportURL?: string

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:webRequest
	 */
	webRequest?: string[]

	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:unwrap
	 */
	unwrap?: boolean
}

export type HeadMetaData = Partial<UserScript>
