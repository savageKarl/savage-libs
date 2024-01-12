import http from 'node:http'

import connect from 'connect'
import getPort from 'get-port'
import open, { apps } from 'open'

import type {
	UserConfig,
	PluginOption,
	ResolvedConfig,
	InlineConfig
} from 'vite'
import { OutputChunk, OutputAsset } from 'rollup'
import { build as inlineBuild, loadConfigFromFile } from 'vite'

import { Metadata } from '../utils/metadata'
import {
	injectCss,
	addPrefixForName,
	getViteConfigPath,
	hyphenToCamelCase
} from '../utils/utils'
import { grants, pluginName, pkg } from '../utils/constants'
import type { Grants } from '../utils/userscript'
import type { UsOptions } from '../utils/types'
import { bundleMiddware, redirectMiddleware } from '../utils/middleware'
import { analyze, depCollection } from './analyze'

export function build(usOptions: Required<UsOptions>) {
	let resovledConfig: ResolvedConfig
	let cssUrls: string[]

	return {
		name: `${pluginName}:build`,
		enforce: 'post',
		apply: 'build',
		async config() {
			await analyzeDep(usOptions)

			const resource = await depCollection.resovleDep()

			cssUrls = resource?.categoryRecord?.css?.map(v => v.url)
			const jsUrls = resource?.categoryRecord?.js?.map(v => v.url)

			const r = usOptions.metaData.require
			usOptions.metaData.require = r?.concat(jsUrls)

			return {
				build: {
					minify: usOptions.build.minify,
					cssMinify: usOptions.build.cssMinify,
					lib: {
						entry: usOptions.entry,
						fileName: `${usOptions.metaData.name}.user`,
						name: hyphenToCamelCase(usOptions.metaData.name as string),
						formats: ['umd']
					},
					rollupOptions: {
						external: resource.externals,
						output: {
							globals: resource.globalVariableNameRecord
						}
					}
				}
			} as UserConfig
		},
		load(id) {
			// prevent CSS dependencies dynamically introduced by automatic import plugins,
			// and then proceed with CDN
			return preventCssDep()
			function preventCssDep() {
				if (/node_modules/.test(id) && /css$/.test(id)) return ''
			}
		},
		async configResolved(config) {
			resovledConfig = config
		},
		async generateBundle(options, bundle) {
			// debugger
			const filename = `${usOptions.metaData.name}.user.umd.cjs`
			const chunk = bundle[filename] as OutputChunk
			chunk.fileName = `${usOptions.metaData.name}.user.js`

			const css = bundle['style.css'] as OutputAsset
			if (css) Reflect.deleteProperty(bundle, 'style.css')

			autoAddGrant(usOptions, chunk)
			addPrefixForName(usOptions, 'production')

			const metadata = new Metadata(usOptions.metaData)

			const metaDataStr = usOptions?.generate?.modifyMetadata?.(
				metadata.generate(),
				'production'
			) as string

			const codes = [
				metaDataStr,
				'',
				await injectCss({
					links: cssUrls,
					inline: css ? String(css.source) : '',
					minify: usOptions.build.cssMinify as boolean,
					pluginName
				}),
				chunk.code
			]

			chunk.code = codes.join('\n')
		},
		async closeBundle() {
			if (!usOptions.build.open?.enable) return

			const port = await getPort()
			const app = connect()

			app.use(redirectMiddleware('prod'))
			app.use(bundleMiddware(resovledConfig, usOptions))

			http.createServer(app).listen(port)
			const url = `http://localhost:${port}`

			const { nameOrPath } = usOptions.build?.open
			const name = ['chrome', 'firefox', 'edge'].includes(nameOrPath)
				? // @ts-ignore
				  apps[nameOrPath]
				: nameOrPath

			open(url, {
				app: {
					name
				}
			})
		}
	} as PluginOption
}

/** NPF,`usOptions` */
function autoAddGrant(usOptions: UsOptions, chunk: OutputChunk) {
	if (usOptions.autoAddGrant) {
		const regex = new RegExp(grants.join('|'), 'g')
		const matchRes = [...chunk.code.matchAll(regex)]
		const collectedGrant = matchRes.map(v => v[0])
		usOptions.metaData.grant = collectedGrant as Grants[]
	}
}

async function getViteConfig() {
	const viteConfigPath = getViteConfigPath()

	const configResult = (
		await loadConfigFromFile(
			{
				mode: 'production',
				command: 'build'
			},
			viteConfigPath
		)
	)?.config as unknown as ResolvedConfig

	const plugins = configResult.plugins.filter(v => {
		if (Array.isArray(v)) {
			return !new RegExp(pluginName).test(v[0].name)
		}
		return true
	})

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { plugins: p, ...rest } = configResult

	return { plugins, ...rest }
}

async function analyzeDep(usOptions: Required<UsOptions>) {
	const depKeys = Object.keys(pkg.dependencies || {})

	const { plugins, ...rest } = await getViteConfig()

	await inlineBuild({
		...rest,
		logLevel: 'error',
		configFile: false,
		plugins: [...plugins, analyze(usOptions)],
		build: {
			write: false,
			lib: {
				entry: usOptions.entry,
				fileName: `${usOptions.metaData.name}.user`,
				name: 'savage',
				formats: ['iife']
			},
			rollupOptions: {
				external: depKeys,
				output: {
					globals: depKeys.reduce(
						(preV, curV) => Object.assign(preV, { [curV]: curV }),
						{}
					)
				}
			}
		}
	} as unknown as InlineConfig)
}
