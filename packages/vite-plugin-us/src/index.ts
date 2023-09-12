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

			config.server.host = config.server.host || host
			config.server.port = config.server.port || port

			usOptionsMerged.server.host = config.server.host as string
			usOptionsMerged.server.port = config.server.port as number
		},
		async configureServer(server) {
			const installPath = 'vite-plugin-us.user.js'
			const proxyEntryPath = 'vite-plugin-us.entry.js'
			console.log('configureServer')

			const newMetaData = generateHeadMeta(usOptions.headMetaData)
			const { host, port } = usOptionsMerged.server
			server.middlewares.use(async (req, res, next) => {
				const url = req.url as string
				const regex = new RegExp(`${[installPath, proxyEntryPath].join('|')}`)

				if (!regex.test(url)) return next()

				setResHeader(res, {
					'access-control-allow-origin': '*',
					'content-type': 'application/javascript'
				})

				if (new RegExp(installPath).test(url)) {
					return res.end(
						[
							newMetaData,
							`(${function (entryUrl: string) {
								const script = document.createElement('script')
								script.type = 'module'
								script.src = entryUrl
								document.head.insertBefore(script, document.head.firstChild)
							}})('http://${host as string}:${
								port as number
							}/${proxyEntryPath}')`
						].join('')
					)
				}

				if (new RegExp(proxyEntryPath).test(url)) {
					const scriptStr = await server.transformIndexHtml('', '')
					const reg = /src="(.+?)"/g
					const allMatch = [...scriptStr.matchAll(reg)]
					const scripts: string[] = []

					allMatch.forEach(v => scripts.push(v[1]))

					scripts.push(`/${usOptionsMerged.entry}`)
					return res.end(
						scripts.map(s => `import ${JSON.stringify(s)};`).join('\n')
					)
				}
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
				const url = `http://${host as string}:${port as number}/${installPath}`
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
