import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import { OutputChunk } from 'rollup'

import { UsOptions, grants } from '../types/userscript'
import { generateHeadMeta } from '../generateHeadMeta'
import { funcToString, pkg, collectCssDependencies } from '../utils'
import type { Grants } from '../types/userscript'

let resovledConfig: ResolvedConfig

export function build(usOptions: Required<UsOptions>) {
	const links = [
		'https://unpkg.com/element-plus@2.3.14/theme-chalk/base.css',
		'https://unpkg.com/element-plus@2.3.14/theme-chalk/el-button.css'
	]

	return {
		name: 'vite-plugin-us:build',
		enforce: 'post',
		apply: 'build',
		config() {
			const name = usOptions.headMetaData.name
			if (usOptions.prefix) usOptions.headMetaData.name = `production: ${name}`

			return {
				build: {
					assetsInlineLimit: Number.MAX_SAFE_INTEGER,
					chunkSizeWarningLimit: Number.MAX_SAFE_INTEGER,
					assetsDir: './',
					target: 'esnext',
					minify: usOptions.build.minify,
					cssMinify: usOptions.build.cssMinify,
					rollupOptions: {
						input: usOptions.entry,
						// TODO
						// external: ['vue'],
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
			return collectCssDependencies(id)
		},
		async configResolved(config) {
			resovledConfig = config
		},
		async transform(code, id) {
			return inlineSvg(code, id)
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

function inlineSvg(code: string, id: string) {
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
}
