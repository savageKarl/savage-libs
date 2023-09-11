import { resolve } from 'node:path'

import type {
	UserConfig,
	ResolvedConfig,
	ViteDevServer,
	PreviewServerForHook,
	IndexHtmlTransformHook,
	HmrContext,
	ModuleNode,
	PluginOption
} from 'vite'

import type {
	InputOptions,
	ResolveIdHook,
	LoadResult,
	TransformResult
} from 'rollup'

import { IUsOptions } from './types/UserScript'
import { optionsResolve } from './optionsResolve'

export function createUsContainer() {
	const usContainer = document.createElement('div')
	document.body.appendChild(usContainer)
	return usContainer
}

export function us(opts: IUsOptions) {
	const fileName = opts.fileName ?? opts.headMetaData.name

	return {
		name: 'vite-plugin-us',
		enforce: 'post',
		config(config, env) {
			return {
				server: {
					open: false
					// port: 12345,
				},
				build: {
					modulePreload: false,
					assetsDir: './',
					target: 'esnext',
					minify: false,
					rollupOptions: {
						input: opts.entry,
						output: {
							extend: true
						}
					}
				}
			} as UserConfig
		},
		buildStart(options) {
			// console.log("buildStart: ", options)
		},
		resolveId(source, importer, options) {
			console.log('resolveId', source, importer, options)
		},
		async configResolved(config) {
			// console.log("configResolved", config)
			opts = await optionsResolve(opts)
		},
		configureServer(server) {
			console.log('configureServer')
			server.middlewares.use((req, res, next) => {
				const url = req.url || '/'
				if (['/', '/index.html'].includes(url)) {
					// 第一次返回进行重定向到安装url
					res.setHeader('content-type', 'text/html')
					res.setHeader('cache-control', 'no-cache')
					res.setHeader('access-control-allow-origin', '*')
					// return res.end(htmlText)
				}

				next()
				// console.log(req.originalUrl, req.url, req.headers.host)
				// Object.entries({
				// 	"access-control-allow-origin": "*",
				// 	"content-type": "application/javascript",
				// }).forEach(([k, v]) => {
				// 	res.setHeader(k, v)
				// })
				// const str = `
				// fuck
				// `
				// res.end(str)
			})
		}
	} as PluginOption
}
