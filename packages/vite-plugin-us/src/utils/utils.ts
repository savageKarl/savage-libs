import { resolve } from 'node:path'
import { readFileSync, statSync } from 'node:fs'
import type { ServerResponse } from 'node:http'

import type { IPackageJson } from '@ts-type/package-dts'

export const pkg = (() => {
	let pkg = '{}'
	try {
		pkg = readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
	} catch {}
	return JSON.parse(pkg) as IPackageJson
})()

export const existFile = (path: string) => {
	try {
		return statSync(path).isFile()
	} catch {
		return false
	}
}

/** not pure func */
export function setResHeader(
	res: ServerResponse,
	headers: Record<string, string>
) {
	for (const h in headers) {
		res.setHeader(h, headers[h])
	}
}

export function rmValueFromArr(arr: string[], values: string[]) {
	return [...arr].filter(v => !values.includes(v))
}

export function funcToString<T>(fn: (args: T) => unknown, args: T) {
	return `;(${fn})(${JSON.stringify(args)});`
}

/** not pure func */
export function collectCssDependencies(id: string, ids?: Set<string>) {
	if (/node_modules/.test(id) && /css$/.test(id)) {
		if (ids) {
			ids.add(id)
			return null
		} else {
			return ''
		}
	}
}

export const resourcePath = 'node_modules/.vite/vite-plugin-us.resource.json'

export function unionRegex(arr: RegExp[]) {
	return new RegExp(
		arr
			.map(r => String(r).replace(/\/|g/g, ''))
			.join('|')
			.replace(/|$/, '')
	)
}
