import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import open from 'open'

import type { PluginOption, ResolvedConfig } from 'vite'
import type { UsOptions } from '../types/types'
import { setResHeader } from '../utils/utils'
import { previewPath, pluginName } from '../utils/constants'

export function preview(usOptions: Required<UsOptions>) {
	let resovledConfig: ResolvedConfig

	return {
		name: `${pluginName}:preview`,
		enforce: 'post',
		apply: 'serve',
		configResolved(config) {
			resovledConfig = config
		},
		configurePreviewServer(server) {
			const { host, port } = usOptions.server
			const currentOrigin = `http://${host as string}:${port as number}`
			const path = resolve(
				resovledConfig.build.outDir as string,
				`${usOptions.headMetaData.name}.user.js`
			)

			server.middlewares.use(async (req, res, next) => {
				if (!new RegExp(previewPath).test(req.url as string)) return next()

				setResHeader(res, {
					'access-control-allow-origin': '*',
					'content-type': 'application/javascript'
				})

				res.end(readFileSync(path, { encoding: 'utf-8' }))
			})

			open(currentOrigin)
		}
	} as PluginOption
}
