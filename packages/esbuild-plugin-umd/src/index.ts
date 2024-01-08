import type { Plugin } from 'esbuild'

import type { UmdOptions } from './types'
import { pluginName } from './constants'
import { wrap } from './utils'
import { validate } from './validate'

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

			build.onEnd(result => {
				const { outputFiles } = result
				const jsFile = outputFiles?.filter(v => /js$/.test(v.path))

				jsFile?.forEach(v => {
					const content = wrap(options, v.text)

					const uint8array = new TextEncoder().encode(content)
					v.contents = uint8array
				})
			})
		}
	} as Plugin
}

export default umd
