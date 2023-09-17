import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import { UsOptions } from '../types/userscript'

export function preview(usOptions: UsOptions) {
	let resovledConfig: ResolvedConfig
	return {
		name: 'vite-plugin-us:preview',
		enforce: 'post',
		apply: 'build'
	} as PluginOption
}
