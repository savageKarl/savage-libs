import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { UserConfig, PluginOption, ResolvedConfig } from 'vite'
import { OutputChunk } from 'rollup'

import { existFile, pkg, setResHeader } from '../utils'
import { UsOptions, grants } from '../types/userscript'
import type { Grants } from '../types/userscript'
import { generateHeadMeta } from '../generateHeadMeta'

export function preview(usOptions: UsOptions) {
	let resovledConfig: ResolvedConfig
	return {
		name: 'vite-plugin-us:preview',
		enforce: 'post',
		apply: 'build',
		config() {
			return {} as UserConfig
		},
		async configResolved(config) {
			resovledConfig = config
		},
		async transform(code, id) {},
		generateBundle(options, bundle) {},
		writeBundle(options, bundle) {}
	} as PluginOption
}
