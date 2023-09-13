import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'

import fs from 'node:fs/promises'

import { readFileSync } from 'node:fs'

import { UsOptions } from '../types/UserScript'

export function build() {
	let resovledConfig: ResolvedConfig
	return {
		name: 'us:build',
		enforce: 'post',
		apply: 'build',
		async configResolved(config) {
			resovledConfig = config
		},
		async transform(code, id) {
			if (resovledConfig.assetsInclude(id) && /\.svg|__VITE_ASSET__/.test(id)) {
				const base64 = readFileSync(/.+?\.svg/.exec(id)?.[0] as string, {
					encoding: 'base64'
				})

				return `export default 'data:image/svg+xml;base64,${base64}'`
			}
		},
		generateBundle(options, bundle) {
			for (const b in bundle) {
				if (/\.svg/.test(b)) Reflect.deleteProperty(bundle, b)
			}
		}
	} as PluginOption
}
