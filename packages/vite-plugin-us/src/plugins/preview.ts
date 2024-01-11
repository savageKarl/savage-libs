import open from 'open'

import type { PluginOption, ResolvedConfig } from 'vite'
import type { UsOptions } from '../utils/types'
import { pluginName } from '../utils/constants'
import { bundleMiddware } from '../utils/middleware'

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
			server.middlewares.use(bundleMiddware(resovledConfig, usOptions))

			const { host, port } = usOptions.server
			const currentOrigin = `http://${host as string}:${port as number}`
			open(currentOrigin)
		}
	} as PluginOption
}
