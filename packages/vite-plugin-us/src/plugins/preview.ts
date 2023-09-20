import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import type { DeepRequired, UsOptions } from '../types/types'
import { addPrefixForName } from '../utils/utils'

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
		}
	} as PluginOption
}
