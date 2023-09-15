import { readFileSync, writeFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import { OutputChunk } from 'rollup'

import { UsOptions, grants } from '../types/userscript'
import { generateHeadMeta } from '../generateHeadMeta'
import { funcToString } from '../utils'
import type { Grants } from '../types/userscript'

export function build(usOptions: UsOptions) {
	let resovledConfig: ResolvedConfig

	const links = [
		'https://unpkg.com/element-plus@2.3.14/theme-chalk/base.css',
		'https://unpkg.com/element-plus@2.3.14/theme-chalk/el-button.css'
	]

	return {
		name: 'vite-plugin-us:build',
		enforce: 'post',
		apply: 'build',
		config() {
			return {
				build: {
					assetsInlineLimit: Number.MAX_SAFE_INTEGER,
					chunkSizeWarningLimit: Number.MAX_SAFE_INTEGER,
					assetsDir: './',
					target: 'esnext',
					minify: false,
					cssMinify: false,
					rollupOptions: {
						input: usOptions.entry,
						// TODO
						external: ['vue'],
						output: {
							extend: true,
							format: 'iife',
							// TODO
							globals: {
								vue: 'Vue'
							}
						}
					}
				}
			} as UserConfig
		},
		load(id) {
			if (/css$/.test(id) && /node_modules/.test(id)) {
				// TODO collect css path and analyze cdn resource global name here
				return ''
			}

			return null
		},
		async configResolved(config) {
			resovledConfig = config
		},
		async transform(code, id) {
			if (
				resovledConfig.assetsInclude(id) &&
				/\.svg/.test(id) &&
				/__VITE_ASSET__/.test(code)
			) {
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
			const code = mainBundle.code

			const regex = new RegExp(grants.join('|').replace('|$', ''), 'g')
			const matchRes = [...code.matchAll(regex)]
			const collectedGrant = matchRes.map(v => v[0])

			usOptions.headMetaData.grant = collectedGrant as unknown as Grants[]
			const newMetaData = generateHeadMeta(usOptions.headMetaData)

			const fullCodeList: string[] = []

			const autoInjectExternalCss = funcToString(function (links: string[]) {
				links.forEach(v => {
					const link = document.createElement('link')
					link.rel = 'stylesheet'
					link.href = v
					document.head.appendChild(link)
				})
			}, links)
			fullCodeList.push(autoInjectExternalCss)

			fullCodeList.unshift(newMetaData)
			fullCodeList.push(code)

			writeFileSync(
				resolve(options.dir as string, key),
				fullCodeList.join('\n')
			)
		}
	} as PluginOption
}
