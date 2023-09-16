import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import { OutputChunk } from 'rollup'

import { UsOptions, grants, DeepRequired } from '../types/userscript'
import { generateHeadMeta } from '../generateHeadMeta'
import { funcToString, collectCssDependencies, resourcePath } from '../utils'
import type { Grants, Resource } from '../types/userscript'

let resovledConfig: ResolvedConfig
let resource: Resource
let cssUrls: string[]

export function build(usOptions: DeepRequired<UsOptions>) {
	return {
		name: 'vite-plugin-us:build',
		enforce: 'post',
		apply: 'build',
		config() {
			const name = usOptions.headMetaData.name
			if (usOptions.prefix) usOptions.headMetaData.name = `production: ${name}`

			resource = JSON.parse(readFileSync(resourcePath, { encoding: 'utf-8' }))
			cssUrls = resource.urls.css || []
			const jsUrls = resource.urls.js || []

			const r = usOptions.headMetaData.require
			usOptions.headMetaData.require = r?.concat(jsUrls)

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
						external: resource.external,
						output: {
							extend: true,
							format: 'iife',
							globals: resource.names
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

			if (usOptions.autoAddGrant) {
				usOptions.headMetaData.grant = collectedGrant as Grants[]
			}
			const newMetaData = generateHeadMeta(usOptions.headMetaData)

			const fullCodeList: string[] = []

			const autoInjectExternalCss = funcToString(function (links: string[]) {
				links.forEach(v => {
					const link = document.createElement('link')
					link.rel = 'stylesheet'
					link.href = v
					document.head.appendChild(link)
				})
			}, cssUrls)
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
	return null
}
