import getPort from 'get-port'

import { merge } from 'lodash-es'

import { UsOptions, DeepRequired, UserScript } from './types/userscript'
import { pkg } from './utils'

type TargetType = string | Record<string, string> | undefined

function takeFieldFromTarget(field: string, target: TargetType) {
	if (typeof target === 'object') return target[field] ?? ''
	return target ?? ''
}

const defaultOpts: DeepRequired<UsOptions> = {
	entry: '',
	prefix: true,
	autoAddGrant: true,
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
	generate: {
		headMetaData: metaData => metaData,
		bundle: code => code
	},
	headMetaData: {
		name: pkg.name || 'vite-plugin-us',
		version: pkg.version || '0.0.1',
		description: pkg.description || 'welcome use vite-plugin-us',
		author: takeFieldFromTarget('name', pkg.author as TargetType),
		supportURL: takeFieldFromTarget('url', pkg.bugs as TargetType)
	} as UserScript
}

getPort({ port: 12345 }).then(n => (defaultOpts.server.port = n))

export function mergeOptions(opts: UsOptions) {
	const mergedOpts = merge(defaultOpts, opts)
	return mergedOpts
}
