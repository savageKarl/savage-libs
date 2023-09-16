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
interface UserScript {
	/**
	 * 脚本名称
	 * @see https://www.tampermonkey.net/documentation.php#meta:name
	 */
	name: string
	/**
	 * 脚本的命名空间网址
	 * @see https://www.tampermonkey.net/documentation.php#meta:namespace
	 */
	namespace: string
	/**
	 * @see https://www.tampermonkey.net/documentation.php#meta:copyright
	 */
	copyright: string
	/**
	 * 脚本的版本号
	 * 这用于更新检查，以防脚本未从userscript.org安装，或者 TM 检索脚本元数据时出现问题。
	 */
	version: string
	/**
	 * 脚本简单的描述，不要出现换行符
	 * @see https://www.tampermonkey.net/documentation.php#meta:description
	 */
	description: string

	/**
	 * 低分辨率下的脚本图标。
	 */
	icon: string
	iconURL: string
	defaulticon: string
	/**
	 * 脚本图标，64*64
	 */
	icon64: string
	icon64URL: string
	/**
	 * `@grant`用于将GM_ *函数，unsafeWindow对象和一些强大的窗口函数列入白名单。
	 * 如果没有给出`@grant`，会自动给与以下权限
	 *
	 * `setValue`,
	 * `getValue`,
	 * `setClipboard`,
	 * `unsafeWindow`,
	 * `window.close`,
	 * `window.focus`,
	 * `window.onurlchange`
	 */
	grant: Grants[] | 'none'
	/**
	 * 在选项页中使用的作者主页从脚本名称链接到给定页面。请注意，如果`@namespace`标签以"http://"开头，其内容也将用于此。
	 */
	/**
	 * 脚本的作者
	 * @see https://www.tampermonkey.net/documentation.php#meta:version
	 */
	author: string
	homepage: string
	homepageUrl: string
	website: string
	source: string
	/**
	 * 指向在脚本本身开始运行之前加载并执行的JavaScript文件
	 * 注意:通过`@require`加载的脚本及其“use strict”语句可能会影响userscript的strict模式!
	 * @example
	 * ```
	 * requires https://code.jquery.com/jquery-2.1.4.min.js
	 * ```
	 */
	require: string[]
	/**
	 * 通过脚本预加载可以通过GM_getResourceURL和GM_getResourceText访问的资源。
	 * 例子：
	 * icon1 http://www.tampermonkey.net/favicon.ico
	 * html http://www.tampermonkey.net/index.html
	 * 详情参考：https://www.tampermonkey.net/documentation.phpext=dhdg#Subresource_Integrity
	 */
	resource: string[]
	/**
	 * 该脚本应运行的页面。允许多个标记实例。
	 * 请注意，`@include`不支持 URL 哈希参数。
	 */
	include: string[]
	/**
	 * 脚本更新url，
	 * 使用此字段时，version字段必填
	 */
	updateURL: string
	/**
	 * 或多或少等于`@include`标记。
	 * 参考信息： http://code.google.com/chrome/extensions/match_patterns.html
	 */
	matche: string[]
	/**
	 * 排除 URL，即使它们也包含在`@include`或`@match`。
	 */
	exclude: string[]
	/**
	 * 定义脚本被注入的时刻。
	 * 与其他脚本处理程序相反，`@run-at`定义了脚本想要运行的第一个可能时刻。
	 * 这意味着可能会发生这样的情况，使用`@require`标记的脚本可能会在文档已经加载之后执行，因为获取所需的脚本需要很长时间。
	 * 无论如何，在给定的注入时刻之后发生的所有domnodeinsert和DOMContentLoaded事件都会被缓存，并在注入脚本时交付给脚本。
	 */
	runAt: (typeof runAt)[number]
	/**
	 * 脚本支持url
	 */
	supportURL: string
	/**
	 * 定义当检测到更新时将从其中下载脚本的URL。如果使用none值，则不会执行更新检查。
	 */
	downloadURL: string

	/**
	 * 此标记定义域（无顶级域），包括允许通过GM_xmlhttpRequest检索的子域
	 * <value>可以具有以下值：
	 * 像 tampermonkey.net 这样的域(这也将允许所有子域)
	 * 子域即 safari.tampermonkey.net
	 * 将脚本当前运行的域列入白名单
	 * localhost 访问本地主机
	 * 1.2.3.4 连接到一个IP地址
	 *
	 */
	connect: string[]

	/**
	 * 此标记使脚本在主页上运行，但不是在 iframe 上运行。
	 */
	noframes: boolean

	/**
	 * 目前，TM试图通过查找`@match`标记来检测是否使用了谷歌Chrome/Chromium编写的脚本，但并不是每个脚本都使用它。
	 * 这就是为什么TM支持这个标签来禁用所有可能需要的优化来运行为Firefox/Greasemonkey编写的脚本。
	 * 要保持此标记的可扩展性，可以添加可由脚本处理的浏览器名称。
	 */
	nocompat: string
}

export type HeadMetaData = Partial<UserScript>

interface ManualCdnResource {
	/**
	 * the global variable name of dependencies, if it is a CSS resource, it is not required
	 *
	 * @example
	 * ```
	 * name: 'Vue'
	 * ```
	 */
	name?: string
	/**
	 * imported path
	 *
	 * when the code looks like this`import { createApp } from 'vue'`, the path is `vue`
	 *
	 * @example
	 * ```
	 * path: 'vue'
	 * ```
	 */
	path: string
	/**
	 * url of CDN resource
	 *
	 * @example
	 * ```
	 * url: 'https://unpkg.com/vue@3.3.4/dist/vue.global.js'
	 * ```
	 */
	url: string
}

export interface UsOptions {
	/**
	 * path of userscript entry.
	 */
	entry: string
	/**
	 * add prefix for script name when development, preview and production mode
	 *
	 * @example
	 *
	 * `// @name            dev: myscript`
	 * `// @name            preview: myscript`
	 * `// @name            production: myscript`
	 */
	prefix?: boolean
	/**
	 * automatically add grant to head metadata in development or production mode
	 */
	// autoAddGrant?: boolean
	server?: {
		/** if it avalible, otherwise random
		 * @defaultValue `12345`
		 */
		port?: number

		/** auto open browser
		 * @defaultValue `true`
		 */
		open?: boolean
		/**
		 * @defaultValue `localhost`
		 */
		host?: string
	}
	build?: {
		/**
		 * minify js in production mode
		 */
		minify?: boolean
		/**
		 * minify css in production mode
		 */
		cssMinify?: boolean

		external?: {
			/**
			 * automatically load package dependencies using CDN
			 *
			 * if value is `auto`, `include` will not work
			 *
			 * if value is `manual`, `exclude` will not work
			 *
			 * @defaultValue `auto`
			 */
			cdn?: 'auto' | 'manual'
			/**
			 * exclude dependencies that do not require automatic CDN
			 */
			exclude?: string[]
			/**
			 * include dependencies that require manual CDN
			 */
			include?: ManualCdnResource[]
		}
	}
	/**
	 * userscript header metadata config.
	 *
	 * @see https://www.tampermonkey.net/documentation.php
	 */
	headMetaData: HeadMetaData
}

export interface Resource {
	names: Record<string, string>
	external: string[]
	urls: Record<string, string[]>
}
