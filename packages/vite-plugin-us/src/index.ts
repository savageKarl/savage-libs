import type { ServerResponse } from 'node:http'

import fs from 'node:fs/promises'
import open from 'open'
import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'

import { UsOptions } from './types/UserScript'
import { mergeOptions } from './optionsResolve'
import { generateHeadMeta } from './generateHeadMeta'
import { existFile, pkg } from './utils'
import { build } from './plugins/build'

export function us(usOptions: UsOptions) {
	const fileName = usOptions.fileName ?? usOptions.headMetaData.name

	let resovledConfig: ResolvedConfig
	let currentOrigin: string
	let usOptionsMerged: Required<UsOptions>
	const usPlugin = {
		name: 'vite-plugin-us',
		enforce: 'post',
		config() {
			return {
				define: {
					'process.env': {}
				},
				server: {
					open: false,
					cors: true
				},
				build: {
					modulePreload: false,
					assetsDir: './',
					target: 'esnext',
					// TODO 这里为什么不开，先暂时，待研究
					minify: false,
					rollupOptions: {
						input: usOptions.entry,
						// TODO 这里是一个比较复杂的功能，自动cdn以及options 让用户自己选择依赖抽离
						external: [...Reflect.ownKeys(pkg.dependencies ?? {})],
						output: {
							extend: true,
							format: 'iife',
							// TODO 这里是一个比较复杂的功能，自动cdn要如何解决全局变量的问题
							globals: {
								vue: 'Vue',
								'lodash-es': 'lodashDs'
							}
						}
					}
				}
			} as UserConfig
		},
		buildStart(options) {
			// console.log("buildStart: ", options)
		},
		resolveId(source, importer, options) {
			// console.log('resolveId', source, importer, options)
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
				const scriptStrList = [...htmlStr.matchAll(regex)].map(item => item[0])
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
						scriptType.inlineScriptList.push(
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
						`(${function (scriptType: string) {
							const scriptTypes = JSON.parse(scriptType) as ScriptType
							scriptTypes.linkScriptList.reverse().forEach(src => {
								const script = document.createElement('script')
								script.type = 'module'
								script.src = src as string
								document.head.insertBefore(script, document.head.firstChild)
							})

							scriptTypes.inlineScriptList.reverse().forEach(str => {
								const script = document.createElement('script')
								script.type = 'module'
								script.textContent = str.join('\n')
								document.head.insertBefore(script, document.head.firstChild)
							})
						}})(` + '`',
						JSON.stringify(scriptType) + '`)'
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

	return [usPlugin, build()]
}

function setResHeader(res: ServerResponse, headers: Record<string, string>) {
	for (const h in headers) {
		res.setHeader(h, headers[h])
	}
}
