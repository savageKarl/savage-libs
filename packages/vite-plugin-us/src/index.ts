import type { ServerResponse } from 'node:http'

import fs from 'node:fs/promises'
import open from 'open'
import type { UserConfig, PluginOption } from 'vite'

import { UsOptions } from './types/UserScript'
import { mergeOptions } from './optionsResolve'
import { generateHeadMeta } from './generateHeadMeta'
import { existFile } from './utils'
export { createUsContainer, existFile } from './utils'

export function us(usOptions: UsOptions) {
	const fileName = usOptions.fileName ?? usOptions.headMetaData.name

	// let resovledConfig: ResolvedConfig
	let usOptionsMerged: Required<UsOptions>
	return {
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
					minify: false,
					rollupOptions: {
						input: usOptions.entry,
						output: {
							extend: true
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
			usOptionsMerged = await mergeOptions(usOptions)
			const { host, port } = usOptionsMerged.server

			config.server.host = host
			config.server.port = port
		},
		async configureServer(server) {
			const installPath = 'vite-plugin-us.user.js'
			const newMetaData = generateHeadMeta(usOptions.headMetaData)
			const { host, port } = usOptionsMerged.server
			const currentOrigin = `http://${host as string}:${port as number}`

			server.middlewares.use(async (req, res, next) => {
				const url = req.url as string

				if (!new RegExp(installPath).test(url)) return next()

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
					const link = s.match(/src="(\/.+?)"/)?.[1]
					if (link) scriptType.linkScriptList.push(`${currentOrigin}${link}`)

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
		}
	} as PluginOption
}

function setResHeader(res: ServerResponse, headers: Record<string, string>) {
	for (const h in headers) {
		res.setHeader(h, headers[h])
	}
}
