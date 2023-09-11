import { resolve } from 'node:path'

import type { ServerResponse } from 'node:http'

import fse from 'fs-extra'
import open from 'open'
import type {
	UserConfig,
	PluginOption,
	ResolvedConfig,
	ServerOptions
} from 'vite'

import { IUsOptions } from './types/UserScript'
import { mergeOptions } from './optionsResolve'
import { generateHeadMeta } from './generateHeadMeta'

export function createUsContainer() {
	const usContainer = document.createElement('div')
	document.body.appendChild(usContainer)
	return usContainer
}

export function us(usOptions: IUsOptions) {
	const fileName = usOptions.fileName ?? usOptions.headMetaData.name

	// let resovledConfig: ResolvedConfig
	let usOptionsMerged: Required<IUsOptions>

	return {
		name: 'vite-plugin-us',
		enforce: 'post',
		config() {
			return {
				server: {
					open: false
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

			config.server.host = config.server.host || host
			config.server.port = config.server.port || port

			usOptionsMerged.server.host = config.server.host as string
			usOptionsMerged.server.port = config.server.port as number
		},
		async configureServer(server) {
			const installPath = 'vite-plugin-us.user.js'
			const entryPath = 'vite-plugin-us.entry.js'
			console.log('configureServer')

			const newMetaData = generateHeadMeta(usOptions.headMetaData)
			const { host, port } = usOptionsMerged.server
			server.middlewares.use((req, res, next) => {
				setResHeader(res, {
					'access-control-allow-origin': '*',
					'content-type': 'application/javascript'
				})
				const url = req.url as string
				if (new RegExp(installPath).test(url)) {
					res.end(
						[
							newMetaData,
							`(${function (entryUrl: string) {
								const script = document.createElement('script')
								script.src = entryUrl
								document.head.insertBefore(script, document.head.firstChild)
							}})('http://${host as string}:${port as number}/${entryPath}')`,
							``
						].join('')
					)
				}

				if (new RegExp(entryPath).test(url)) {
					res.end('wait..')
				}

				// const url = req.url || '/'
				// if (['/', '/index.html'].includes(url)) {
				// 	// 第一次返回进行重定向到安装url
				// 	res.setHeader('content-type', 'text/html')
				// 	res.setHeader('cache-control', 'no-cache')
				// 	res.setHeader('access-control-allow-origin', '*')
				// 	// return res.end(htmlText)
				// }

				// next()
				// console.log(req.originalUrl, req.url, req.headers.host)
				// Object.entries({
				// 	"access-control-allow-origin": "*",
				// 	"content-type": "application/javascript",
				// }).forEach(([k, v]) => {
				// 	res.setHeader(k, v)
				// })
				// const str = `
				// fuck
				// `
				// res.end(str)
			})

			if (!usOptionsMerged.server?.open) return

			const cachePath = 'node_modules/.vite/vite-plugin-us.cache.js'
			let cacheMetaData = ''

			if (await fse.pathExists(cachePath)) {
				cacheMetaData = (await fse.readFile(cachePath)).toString('utf-8')
			}

			if (cacheMetaData !== newMetaData) {
				const url = `http://${host as string}:${port as number}/${installPath}`
				await open(url)
			}
		}
	} as PluginOption
}

function setResHeader(res: ServerResponse, headers: Record<string, string>) {
	for (const h in headers) {
		res.setHeader(h, headers[h])
	}
}
