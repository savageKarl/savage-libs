import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

import getPort from 'get-port'

import type { IPackageJson } from '@ts-type/package-dts'

import { merge } from 'lodash-es'

import { UsOptions } from './types/UserScript'

const pkg = (() => {
	let pkg: IPackageJson
	try {
		pkg = JSON.parse(
			readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
		) as IPackageJson
	} catch {
		pkg = {}
	}
	return pkg
})()

type TargetType = string | Record<string, string> | undefined

function takeFieldFromTarget(field: string, target: TargetType) {
	if (typeof target === 'object') return target[field] ?? ''
	return target
}

export async function mergeOptions(opts: UsOptions) {
	const defaultOpts: UsOptions = {
		entry: '',
		server: {
			port: await getPort({ port: 5858 }),
			open: true,
			host: 'localhost'
		},
		headMetaData: {
			name: pkg.name,
			version: pkg.version,
			description: pkg.description,
			author: takeFieldFromTarget('name', pkg.author as TargetType),
			supportURL: takeFieldFromTarget('url', pkg.bugs as TargetType)
		}
	}

	const mergedOpts = merge(defaultOpts, opts)
	return mergedOpts as Required<UsOptions>
}
