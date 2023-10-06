import { writeFile } from 'node:fs/promises'

import type { Plugin } from 'esbuild'

import type { UmdOptions } from './types'
import { pluginName } from './constants'
import { wrap } from './utils'

export function umd(options: UmdOptions) {
	options = Object.assign({ external: [], globalVariableName: {} }, options)

	return {
		name: pluginName,
		setup(build) {
			const { initialOptions } = build
			// @ts-ignore
			if (initialOptions.format !== 'umd') return false

			initialOptions.write = false
			initialOptions.format = 'cjs'

			build.onEnd(result => {
				const { outputFiles } = result
				const jsFile = outputFiles?.filter(v => /js$/.test(v.path))
				const jsMapFile = outputFiles?.filter(v => /js$/.test(v.path))

				jsMapFile?.forEach(v => {
					writeFile(v.path, v.text, { encoding: 'utf-8' })
				})

				jsFile?.forEach(v => {
					writeFile(v.path, wrap(options as Required<UmdOptions>, v.text), {
						encoding: 'utf-8'
					})
				})
			})
		}
	} as Plugin
}

export default umd
