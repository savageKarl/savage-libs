import getPort from 'get-port'

import { merge } from 'lodash-es'

import { UsOptions, UserScript } from '../types/userscript'
import { getPkg } from './utils'
import { DeepRequired } from '../types/types'

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
		name: getPkg.name || 'vite-plugin-us',
		version: getPkg.version || '0.0.1',
		description: getPkg.description || 'welcome use vite-plugin-us',
		author: takeFieldFromTarget('name', getPkg.author as TargetType),
		supportURL: takeFieldFromTarget('url', getPkg.bugs as TargetType)
	} as UserScript
}

getPort({ port: 12345 }).then(n => (defaultOpts.server.port = n))

export function mergeOptions(opts: UsOptions) {
	const mergedOpts = merge(defaultOpts, opts)
	return mergedOpts
}
