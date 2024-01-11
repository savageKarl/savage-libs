import type { Plugin } from 'esbuild'

import type { UmdOptions } from './types'
import { pluginName } from './constants'
import { validate } from './validate'

import { build as rollupBuild } from './rollup'

export type { UmdOptions } from './types'

export function umd(options: UmdOptions) {
	return {
		name: pluginName,
		setup(build) {
			const { initialOptions } = build
			// @ts-ignore
			if (initialOptions.format !== 'umd') return false

			// @ts-ignore
			const status = validate(options, initialOptions.entryPoints[0])
			if (!status) return false

			initialOptions.write = false
			initialOptions.format = 'cjs'

			build.onEnd(async result => {
				const { outputFiles } = result
				const jsFile = outputFiles?.filter(v => /js$/.test(v.path))

				for (const file of jsFile || []) {
					// @ts-ignore
					const code = await rollupBuild(initialOptions.entryPoints[0], options)
					const uint8array = new TextEncoder().encode(code)
					file.contents = uint8array
				}
			})
		}
	} as Plugin
}

export default umd
