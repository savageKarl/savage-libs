import { basename, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'esbuild'
import { glob } from 'glob'
import { normalizePath } from 'savage-utils'
import { generateFiles } from 'savage-node'

const pluginName = 'esbuild-plugin-clone'

interface Options {
	from: string
	to: string
	moment?: 'onStart' | 'onEnd'
}

export function clone(options: Options) {
	const override = Object.assign(options, {
		moment: 'onEnd'
	}) as Required<Options>

	const plugin: Plugin = {
		name: pluginName,
		async setup(build) {
			build[override.moment](async () => {
				const originFiles = await glob(normalizePath(override.from))
				const targetFiles = originFiles.map(f =>
					resolve(options.to, basename(f))
				)

				const fileContentRecord = originFiles
					.map(f => readFileSync(f, { encoding: 'utf-8' }))
					.reduce((x, y, i) => Object.assign(x, { [targetFiles[i]]: y }), {})

				try {
					generateFiles(fileContentRecord)
				} catch (e) {
					console.error(e)
				}
			})
		}
	}

	return plugin
}

export default clone
