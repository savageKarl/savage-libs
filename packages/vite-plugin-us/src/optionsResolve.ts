import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

import getPort from 'get-port'

import type { IPackageJson } from '@ts-type/package-dts'

// import {} from 'savage-utils'
import { merge } from 'lodash-es'

import { IUsOptions } from './types/UserScript'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

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

export async function mergeOptions(opts: IUsOptions) {
	const defaultOpts: IUsOptions = {
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
	return mergedOpts as Required<IUsOptions>
}
