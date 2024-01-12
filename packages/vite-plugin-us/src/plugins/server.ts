import fs from 'node:fs/promises'

import type { PluginOption, ResolvedConfig } from 'vite'
import open, { apps } from 'open'

import type { Grants } from '../utils/userscript'
import type { UsOptions } from '../utils/types'

import { Metadata } from '../utils/metadata'
import {
	existFile,
	setResHeader,
	fnToString,
	addPrefixForName
} from '../utils/utils'
import { devPath, grants, pluginName } from '../utils/constants'

import { generateFiles } from 'savage-node'

export function serve(usOptions: Required<UsOptions>) {
	let resovledConfig: ResolvedConfig
	let currentOrigin: string

	return {
		name: `${pluginName}:serve`,
		enforce: 'post',
		apply: 'serve',
		async configResolved(config) {
			resovledConfig = config
		},
		async configureServer(server) {
			addPrefixForName(usOptions, 'development')

			usOptions.metaData.grant = grants as unknown as Grants[]
			const metadata = new Metadata(usOptions.metaData)

			const newMetaData = usOptions.generate.modifyMetadata?.(
				metadata.generate(),
				'development'
			) as string
			const { host, port } = usOptions.server
			currentOrigin = `http://${host as string}:${port as number}`

			server.middlewares.use(async (req, res, next) => {
				if (!new RegExp(devPath).test(req.url as string)) return next()

				setResHeader(res, {
					'access-control-allow-origin': '*',
					'content-type': 'application/javascript'
				})

				const htmlStr = await server.transformIndexHtml('', '')
				const regScriptTag = /<(script)[\s\S]+?<\/script>/g
				const scriptStrList = [...htmlStr.matchAll(regScriptTag)].map(v => v[0])
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
						fnToString((scriptType: ScriptType) => {
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
							// @ts-ignore
							window.GM.log(
								// @ts-ignore
								`current vserion is ${GM.info.version}, enjoy your day!`
							)
						}, scriptType),

						usOptions.autoAddGrant
							? fnToString((gmApiList: string[]) => {
									// @ts-ignore
									gmApiList.forEach(v => (unsafeWindow[v] = window[v]))
									// @ts-ignore
									// eslint-disable-next-line dot-notation
									unsafeWindow['GM'] = window['GM']
							  }, grants)
							: ''
					].join('\n')
				)
			})

			if (!usOptions.server?.open?.enable) return

			const cachePath = `node_modules/.vite/${pluginName}.cache.js`
			let cacheMetaData = ''

			if (existFile(cachePath)) {
				cacheMetaData = (await fs.readFile(cachePath)).toString('utf-8')
			} else {
				generateFiles({ [cachePath]: '' })
			}

			if (cacheMetaData !== newMetaData) {
				const { nameOrPath } = usOptions.server?.open
				const name = ['chrome', 'firefox', 'edge'].includes(nameOrPath)
					? // @ts-ignore
					  apps[nameOrPath]
					: nameOrPath

				const url = currentOrigin
				Promise.all([
					open(url, {
						app: {
							name
						}
					}),
					fs.writeFile(cachePath, newMetaData)
				])
			}
		},
		transform(code, id) {
			return replaceAssetUrl()

			function replaceAssetUrl() {
				const reg = /export\s+default\s+"(.+?)"/
				if (resovledConfig.assetsInclude(id) && reg.test(code)) {
					return code.replace(reg, `export default '${currentOrigin}$1'`)
				}
			}
		}
	} as PluginOption
}

// process.on('uncaughtException', e => {
// 	console.log(e)
// })
