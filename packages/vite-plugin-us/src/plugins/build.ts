import { readFileSync } from 'node:fs'

import http from 'node:http'

import connect from 'connect'
import getPort from 'get-port'
import open from 'open'

import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import { OutputChunk, OutputAsset } from 'rollup'

import { Metadata } from '../utils/metadata'
import { injectCss, addPrefixForName } from '../utils/utils'
import { resourcePath, grants, pluginName } from '../utils/constants'
import type { Grants } from '../types/userscript'
import type { ResourceRecord, UsOptions } from '../types/types'
import { bundleMiddware, redirectMiddleware } from '../utils/middleware'

export function build(usOptions: Required<UsOptions>) {
	let resovledConfig: ResolvedConfig
	let cssUrls: string[]

	return {
		name: `${pluginName}:build`,
		enforce: 'post',
		apply: 'build',
		config() {
			let resource = {} as ResourceRecord

			try {
				resource = JSON.parse(readFileSync(resourcePath, { encoding: 'utf-8' }))
			} catch {}

			cssUrls = resource?.categoryRecord?.css?.map(v => v.url) || []
			const jsUrls = resource?.categoryRecord?.js?.map(v => v.url) || []

			const r = usOptions.metaData.require
			usOptions.metaData.require = r?.concat(jsUrls)

			return {
				build: {
					minify: usOptions.build.minify,
					cssMinify: usOptions.build.cssMinify,
					lib: {
						entry: usOptions.entry,
						fileName: `${usOptions.metaData.name}.user`,
						name: 'xxxx',
						formats: ['iife']
					},
					rollupOptions: {
						external: resource.externals,
						output: {
							globals: resource.globalVariableNameRecord
						}
					}
				}
			} as UserConfig
		},
		load(id) {
			// prevent CSS dependencies dynamically introduced by automatic import plugins,
			// and then proceed with CDN
			return preventCssDep()
			function preventCssDep() {
				if (/node_modules/.test(id) && /css$/.test(id)) return ''
			}
		},
		async configResolved(config) {
			resovledConfig = config
		},
		async transform(code, id) {
			// return inlineSvg(resovledConfig, code, id)
		},
		async generateBundle(options, bundle) {
			const filename = `${usOptions.metaData.name}.user.iife.js`
			const chunk = bundle[filename] as OutputChunk
			chunk.fileName = `${usOptions.metaData.name}.user.js`

			const css = bundle['style.css'] as OutputAsset
			Reflect.deleteProperty(bundle, 'style.css')

			autoAddGrant(usOptions, chunk)
			addPrefixForName(usOptions, 'production')

			const metadata = new Metadata(usOptions.metaData)

			const metaDataStr = usOptions?.generate?.modifyMetadata?.(
				metadata.generate(),
				'production'
			) as string

			const codes = [
				metaDataStr,
				'',
				await injectCss({
					links: cssUrls,
					inline: String(css.source),
					minify: usOptions.build.cssMinify as boolean,
					pluginName
				}),
				chunk.code
			]

			chunk.code = codes.join('\n')
		},
		async closeBundle() {
			if (!usOptions.build.open) return

			const port = await getPort()
			const app = connect()

			app.use(redirectMiddleware('prod'))
			app.use(bundleMiddware(resovledConfig, usOptions))

			const server = http.createServer(app).listen(port)
			const url = `http://localhost:${port}`
			open(url)
		}
	} as PluginOption
}

/** NPF,`usOptions` */
function autoAddGrant(usOptions: UsOptions, chunk: OutputChunk) {
	if (usOptions.autoAddGrant) {
		const regex = new RegExp(grants.join('|'), 'g')
		const matchRes = [...chunk.code.matchAll(regex)]
		const collectedGrant = matchRes.map(v => v[0])
		usOptions.metaData.grant = collectedGrant as Grants[]
	}
}
