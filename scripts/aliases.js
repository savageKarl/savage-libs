// @ts-check
// these aliases are shared between vitest and rollup
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const resolveEntryForPkg = p =>
	path.resolve(
		fileURLToPath(import.meta.url),
		`../../packages/${p.replace(/savage-/, '')}/src/index.ts`
	)

const entries = {
	'savage-data-types': resolveEntryForPkg('savage-data-types'),
	'savage-rollup-command': resolveEntryForPkg('savage-rollup-command'),
	'savage-electron-ipc': resolveEntryForPkg('savage-electron-ipc'),
	'savage-utils': resolveEntryForPkg('savage-utils')
}

export { entries }
