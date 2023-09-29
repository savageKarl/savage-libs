import type { ServerResponse } from 'node:http'

import { resolve } from 'node:path'

import type { Connect, ResolvedConfig } from 'vite'

import { devPath, previewPath, htmlTempalte } from '../utils/constants'
import { fnToString, setResHeader } from '../utils/utils'

import { readFileSync } from 'node:fs'
import type { UsOptions } from '../types/types'

export function redirectMiddleware(mode: 'dev' | 'preview' | 'prod') {
	const strategy = {
		dev: devPath,
		preview: previewPath,
		prod: previewPath
	}

	const path = strategy[mode]

	return (
		req: Connect.IncomingMessage,
		res: ServerResponse,
		next: Connect.NextFunction
	) => {
		const url = req.url || '/'
		if (['/', '/index.html'].includes(url)) {
			setResHeader(res, {
				'content-type': 'text/html',
				'cache-control': 'no-cache',
				'access-control-allow-origin': '*'
			})
			return res.end(
				htmlTempalte.replace('__code__', fnToString(redirect, path))
			)
		}
		return next()
	}
}

export function bundleMiddware(
	resovledConfig: ResolvedConfig,
	usOptions: UsOptions
) {
	return (
		req: Connect.IncomingMessage,
		res: ServerResponse,
		next: Connect.NextFunction
	) => {
		if (!new RegExp(previewPath).test(req.url as string)) return next()

		setResHeader(res, {
			'access-control-allow-origin': '*',
			'content-type': 'application/javascript'
		})
		const path = resolve(
			resovledConfig.build.outDir as string,
			`${usOptions.headMetaData.name?.replaceAll(
				/production|:|\s/g,
				''
			)}.user.js`
		)

		res.end(readFileSync(path, { encoding: 'utf-8' }))
		process.exit(0)
	}
}
function redirect(path: string) {
	if (window.parent === window) {
		location.href = `/${path}`
		setTimeout(() => {
			window.close()
		}, 500)
	}
}
