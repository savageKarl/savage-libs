import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'

import { UsOptions } from './types/userscript'
import { pkg } from './utils'
import { plugins } from './plugins'

export function us(usOptions: UsOptions) {
	const usPlugin = {
		name: 'vite-plugin-us',
		enforce: 'post',
		config() {
			return {
				server: {
					open: false,
					cors: true
				},
				build: {
					assetsInlineLimit: Number.MAX_SAFE_INTEGER,
					chunkSizeWarningLimit: Number.MAX_SAFE_INTEGER,
					assetsDir: './',
					target: 'esnext',
					minify: false,
					cssMinify: false,
					rollupOptions: {
						input: usOptions.entry,
						// TODO 自动cdn以及options 让用户自己选择依赖抽离
						external: [...Reflect.ownKeys(pkg.dependencies ?? {})],
						output: {
							extend: true,
							format: 'iife',
							// TODO 自动cdn要如何解决全局变量的问题
							globals: {
								vue: 'Vue',
								'lodash-es': 'lodashDs'
							}
						}
					}
				}
			} as UserConfig
		},
		buildStart() {
			// console.log("buildStart: ", options)
		},
		resolveId() {
			// console.log('resolveId', source, importer, options)
		}
	} as PluginOption

	return [usPlugin, ...plugins.map(v => v(usOptions))]
}
