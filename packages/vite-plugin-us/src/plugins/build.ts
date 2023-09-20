import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
import { OutputChunk } from 'rollup'

import { grants } from '../types/userscript'
import { generateHeadMeta } from '../utils/generateMetadata'
import {
	funcToString,
	collectCssDependencies,
	resourcePath
} from '../utils/utils'
import type { Grants, UsOptions } from '../types/userscript'
import type { ResourceRecord, DeepRequired } from '../types/types'

let resovledConfig: ResolvedConfig
let resource: ResourceRecord
let cssUrls: string[]

export function build(usOptions: DeepRequired<UsOptions>) {
	return {
		name: 'vite-plugin-us:build',
		enforce: 'post',
		apply: 'build',
		config() {
			resource = JSON.parse(readFileSync(resourcePath, { encoding: 'utf-8' }))
			cssUrls = resource.urls.css || []
			const jsUrls = resource.urls.js || []

			const r = usOptions.headMetaData.require
			usOptions.headMetaData.require = r?.concat(jsUrls)
			// TODO handle resources
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
			const code = usOptions.generate.bundle(mainBundle.code)

			const regex = new RegExp(grants.join('|').replace('|$', ''), 'g')
			const matchRes = [...code.matchAll(regex)]
			const collectedGrant = matchRes.map(v => v[0])

			if (usOptions.autoAddGrant) {
				usOptions.headMetaData.grant = collectedGrant as Grants[]
			}

			const name = usOptions.headMetaData.name
			if (usOptions.prefix) usOptions.headMetaData.name = `production: ${name}`

			const newMetaData = usOptions.generate.headMetaData(
				generateHeadMeta(usOptions.headMetaData),
				'production'
			)

			const fullCodeList: string[] = []

			const autoInjectExternalCss = funcToString(function (links: string[]) {
				window.addEventListener('DOMContentLoaded', () => {
					links.forEach(v => {
						const link = document.createElement('link')
						link.rel = 'stylesheet'
						link.href = v
						document.head.appendChild(link)
					})
				})
			}, cssUrls)
			fullCodeList.push(autoInjectExternalCss)

			fullCodeList.unshift(newMetaData)
			fullCodeList.push(code)

			const path = normalizePath(options.dir + `/${name}.user.js`)

			writeFileSync(path, fullCodeList.join('\n'))
			unlinkSync(resolve(options.dir as string, key))
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
