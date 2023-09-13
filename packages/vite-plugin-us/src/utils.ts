import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

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
