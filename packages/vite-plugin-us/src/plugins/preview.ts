import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import open from 'open'

import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import type { DeepRequired, UsOptions } from '../types/types'
import { addPrefixForName, setResHeader } from '../utils/utils'

export function preview(usOptions: DeepRequired<UsOptions>) {
	let resovledConfig: ResolvedConfig

	return {
		name: 'vite-plugin-us:preview',
		enforce: 'post',
		apply: 'serve',
		config() {
			addPrefixForName(usOptions, 'preview')

			const { host, port } = usOptions.server
			return {
				server: {
					open: false,
					cors: true,
					host,
					port
				}
			} as UserConfig
		},
		configResolved(config) {
			resovledConfig = config
		},
		configurePreviewServer(server) {
			const previewUrl = 'vite-plugin-us.preview.user.js'
			const { host, port } = usOptions.server
			const currentOrigin = `http://${host as string}:${port as number}`
			const path = resolve(
				resovledConfig.build.outDir as string,
				`${usOptions.headMetaData.name.replaceAll(/preview|:|\s/g, '')}.user.js`
			)

			server.middlewares.use(async (req, res, next) => {
				if (!new RegExp(previewUrl).test(req.url as string)) return next()

				setResHeader(res, {
					'access-control-allow-origin': '*',
					'content-type': 'application/javascript'
				})

				res.end(readFileSync(path, { encoding: 'utf-8' }))
			})

			const url = `${currentOrigin}/${previewUrl}`
			open(url)
		}
	} as PluginOption
}
