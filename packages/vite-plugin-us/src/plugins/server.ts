import fs from 'node:fs/promises'

import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import open from 'open'

import { UsOptions, grants, Grants } from '../types/userscript'
import { mergeOptions } from '../optionsMerge'
import { generateHeadMeta } from '../generateHeadMeta'
import { existFile, setResHeader } from '../utils'

export function serve(usOptions: UsOptions) {
	let resovledConfig: ResolvedConfig
	let currentOrigin: string
	let usOptionsMerged: Required<UsOptions>
	return {
		name: 'vite-plugin-us:serve',
		enforce: 'post',
		apply: 'serve',
		config() {
			return {
				server: {
					open: false,
					cors: true
				}
			} as UserConfig
		},
		async configResolved(config) {
			resovledConfig = config
			usOptionsMerged = await mergeOptions(usOptions)
			const { host, port } = usOptionsMerged.server

			config.server.host = host
			config.server.port = port
		},
		async configureServer(server) {
			const installPath = 'vite-plugin-us.user.js'
			usOptions.headMetaData.grant = grants as unknown as Grants[]
			const newMetaData = generateHeadMeta(usOptions.headMetaData)
			const { host, port } = usOptionsMerged.server
			currentOrigin = `http://${host as string}:${port as number}`

			server.middlewares.use(async (req, res, next) => {
				if (!new RegExp(installPath).test(req.url as string)) return next()

				setResHeader(res, {
					'access-control-allow-origin': '*',
					'content-type': 'application/javascript'
				})

				const htmlStr = await server.transformIndexHtml('', '')
				const regex = /<(script)[\s\S]+?<\/script>/g
				const scriptStrList = [...htmlStr.matchAll(regex)].map(v => v[0])
				const scriptType = {
					inlineScriptList: [] as string[][],
					linkScriptList: [] as string[]
				}

				scriptStrList.forEach(s => {
					const path = s.match(/src="(\/.+?)"/)?.[1]
					if (path)
						return scriptType.linkScriptList.push(`${currentOrigin}${path}`)

					const scriptContent = s.match(
						/<script type="module">([\s\S]+?)<\/script>/
					)?.[1]

					if (scriptContent)
						return scriptType.inlineScriptList.push(
							scriptContent
								.replace(/"/g, "'")
								.replace(/'(.+?)'/, `'${currentOrigin}$1'`)
								.split('\n')
						)
				})

				scriptType.linkScriptList.push(`${currentOrigin}/${usOptions.entry}`)

				type ScriptType = typeof scriptType
				return res.end(
					[
						newMetaData,
						`(${function (scriptType: ScriptType, gmApiList: string[]) {
							scriptType.linkScriptList.reverse().forEach(src => {
								const script = document.createElement('script')
								script.type = 'module'
								script.src = src as string
								document.head.insertBefore(script, document.head.firstChild)
							})

							scriptType.inlineScriptList.reverse().forEach(str => {
								const script = document.createElement('script')
								script.type = 'module'
								script.textContent = str.join('\n')
								document.head.insertBefore(script, document.head.firstChild)
							})

							window.GM.log(
								`current vserion is ${GM.info.version}, GM api has been added to the page, enjoy your day!`
							)
							// @ts-ignore
							gmApiList.forEach(v => (unsafeWindow[v] = window[v]))
							// @ts-ignore
							// eslint-disable-next-line dot-notation
							unsafeWindow['GM'] = window['GM']
						}})(${JSON.stringify(scriptType)}, ${JSON.stringify(grants)})`
					].join('')
				)
			})

			if (!usOptionsMerged.server?.open) return

			const cachePath = 'node_modules/.vite/vite-plugin-us.cache.js'
			let cacheMetaData = ''

			if (await existFile(cachePath)) {
				cacheMetaData = (await fs.readFile(cachePath)).toString('utf-8')
			}

			let firstOpen = true
			if (firstOpen || cacheMetaData !== newMetaData) {
				firstOpen = false
				const url = `${currentOrigin}/${installPath}`
				Promise.all([open(url), fs.writeFile(cachePath, newMetaData)])
			}
		},
		transform(code, id) {
			const reg = /export\s+default\s+"(.+?)"/
			if (resovledConfig.assetsInclude(id) && reg.test(code)) {
				return code.replace(reg, `export default '${currentOrigin}$1'`)
			}
		}
	} as PluginOption
}
