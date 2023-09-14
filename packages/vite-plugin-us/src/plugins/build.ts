import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import { OutputChunk } from 'rollup'

import { UsOptions, grants } from '../types/userscript'
import type { Grants } from '../types/userscript'
import { generateHeadMeta } from '../generateHeadMeta'

export function build(usOptions: UsOptions) {
	let resovledConfig: ResolvedConfig
	return {
		name: 'vite-plugin-us:build',
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
			for (const filename in bundle) {
				if (/\.svg/.test(filename)) Reflect.deleteProperty(bundle, filename)
			}
		},
		writeBundle(options, bundle) {
			const key = Object.keys(bundle)[0]
			const mainBundle = bundle[key] as OutputChunk
			let code = mainBundle.code

			const regex = new RegExp(grants.join('|').replace('|$', ''), 'g')
			const matchRes = [...code.matchAll(regex)]
			const collectedGrant = matchRes.map(v => v[0])

			usOptions.headMetaData.grant = collectedGrant as unknown as Grants[]
			const newMetaData = generateHeadMeta(usOptions.headMetaData)
			code = [newMetaData, code].join('\n')
			writeFileSync(resolve(options.dir as string, key), code)
		}
	} as PluginOption
}
