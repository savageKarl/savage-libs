import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import type { ServerResponse } from 'node:http'

import type { IPackageJson } from '@ts-type/package-dts'

export const pkg = (() => {
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

export const existFile = async (path: string) => {
	try {
		return (await fs.stat(path)).isFile()
	} catch {
		return false
	}
}

/**
 * set HTTP response header
 *
 * @param res - http server response
 * @param headers - http server response headers
 */
export function setResHeader(
	res: ServerResponse,
	headers: Record<string, string>
) {
	for (const h in headers) {
		res.setHeader(h, headers[h])
	}
}

/**
 * remove values from target array
 */
export function rmValueFromArr(arr: string[], values: string[]) {
	return [...arr].filter(v => !values.includes(v))
}
