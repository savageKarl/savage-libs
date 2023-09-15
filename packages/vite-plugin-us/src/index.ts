import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'

import { UsOptions } from './types/userscript'
import { pkg } from './utils'
import { plugins } from './plugins'

export function us(usOptions: UsOptions) {
	const usPlugin = {
		name: 'vite-plugin-us',
		enforce: 'post',
		buildStart() {
			// console.log("buildStart: ", options)
		},
		resolveId() {
			// console.log('resolveId', source, importer, options)
		}
	} as PluginOption

	return [usPlugin, ...plugins.map(v => v(usOptions))]
}
