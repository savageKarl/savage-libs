// @ts-check
// these aliases are shared between vitest and rollup
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const resolveEntryForPkg = p =>
	path.resolve(
		fileURLToPath(import.meta.url),
		`../../packages/${p}/src/index.ts`
	)

const dirs = readdirSync(new URL('../packages', import.meta.url))

const entries = {
	// vue: resolveEntryForPkg('vue')
	// 'vue/compiler-sfc': resolveEntryForPkg('compiler-sfc'),
	// 'vue/server-renderer': resolveEntryForPkg('server-renderer'),
	// '@vue/compat': resolveEntryForPkg('vue-compat')
}

export { entries }
