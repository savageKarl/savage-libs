import type { UserConfig, PluginOption } from 'vite'

import { UsOptions } from './types/types'
import { plugins } from './plugins'
import { mergeOptions } from './utils/optionsMerge'

export function us(usOptions: UsOptions) {
	const usOptionsMerged = mergeOptions(usOptions)
	const usPlugin = {
		name: 'vite-plugin-us',
		enforce: 'post',
		config() {
			return {
				build: {
					rollupOptions: {
						input: usOptions.entry
					}
				}
			} as UserConfig
		}
	} as PluginOption

	return [usPlugin, ...plugins.map(v => v(usOptionsMerged))]
}
