import getPort from 'get-port'

import { merge } from 'lodash-es'

import { UsOptions } from './types/userscript'
import { pkg } from './utils'

type TargetType = string | Record<string, string> | undefined

function takeFieldFromTarget(field: string, target: TargetType) {
	if (typeof target === 'object') return target[field] ?? ''
	return target ?? ''
}

export function mergeOptions(opts: UsOptions) {
	const defaultOpts: Required<UsOptions> = {
		entry: '',
		server: {
			port: 12345,
			open: true,
			host: 'localhost'
		},
		build: {
			minify: true,
			cssMinify: true,
			external: {
				cdn: 'auto',
				exclude: [],
				include: []
			}
		},
		headMetaData: {
			name: pkg.name,
			version: pkg.version,
			description: pkg.description,
			author: takeFieldFromTarget('name', pkg.author as TargetType),
			supportURL: takeFieldFromTarget('url', pkg.bugs as TargetType)
		}
	}

	getPort({ port: 12345 }).then(n => (defaultOpts.server.port = n))

	const mergedOpts = merge(defaultOpts, opts)
	return mergedOpts as Required<UsOptions>
}
