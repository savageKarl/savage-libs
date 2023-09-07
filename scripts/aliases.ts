// @ts-check
import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { targets } from './utils'

// const resolveEntryForPkg = p =>
// 	path.resolve(
// 		fileURLToPath(import.meta.url),
// 		`../../packages/${p.replace(/savage-/, '')}/src/index.ts`
// 	)

const resolveEntryForPkg = (p: string) =>
	resolve(`packages/${'savage-data-types'}/src/index.ts`)

console.log(resolve(`packages/${'savage-data-types'}/src/index.ts`))
const entries = {
	// 'savage-data-types': resolveEntryForPkg('savage-data-types'),
	// 'savage-rollup-command': resolveEntryForPkg('savage-rollup-command'),
	// 'savage-electron-ipc': resolveEntryForPkg('savage-electron-ipc'),
	// 'savage-utils': resolveEntryForPkg('savage-utils'),
	// 'savage-typedoc-markdown': resolveEntryForPkg('typedoc-markdown')
	'savage-*': 'packages/*/src/index.ts'
}

export { entries }
