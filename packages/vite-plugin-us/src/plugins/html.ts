import type {
	UserConfig,
	PluginOption,
	ViteDevServer,
	PreviewServerForHook
} from 'vite'

import type { UsOptions } from '../types/types'

import {
	devPath,
	previewPath,
	htmlTempalte,
	pluginName
} from '../utils/constants'
import { fnToString } from '../utils/utils'

export function html(usOptions: Required<UsOptions>) {
	return {
		name: `${pluginName}:html`,
		enforce: 'post',
		apply: 'serve',
		config() {
			const { host, port } = usOptions.server
			const serveConfig = {
				open: false,
				cors: true,
				host,
				port
			}
			return {
				server: serveConfig,
				preview: serveConfig
			} as UserConfig
		},
		async configureServer(server) {
			addMiddleware(server, 'dev')
		},
		async configurePreviewServer(server) {
			addMiddleware(server, 'preview')
		}
	} as PluginOption
}

function addMiddleware(
	server: ViteDevServer | PreviewServerForHook,
	mode: 'dev' | 'preview'
) {
	const strategy = {
		dev: devPath,
		preview: previewPath
	}

	const path = strategy[mode]

	server.middlewares.use(async (req, res, next) => {
		const url = req.url || '/'
		if (['/', '/index.html'].includes(url)) {
			res.setHeader('content-type', 'text/html')
			res.setHeader('cache-control', 'no-cache')
			res.setHeader('access-control-allow-origin', '*')
			return res.end(
				htmlTempalte.replace('__code__', fnToString(redirect, path))
			)
		}
		return next()
	})
}

async function redirect(path: string) {
	function sleep(ms = 0) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(true)
			}, ms)
		})
	}

	if (window.parent === window) {
		location.href = `/${path}`
		await sleep(500)
		return window.close()
	}
}
