import { rollup } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import rpt2 from 'rollup-plugin-typescript2'
import nodeResolve from '@rollup/plugin-node-resolve'

import type { OutputOptions } from 'rollup'

import type { UmdOptions } from './types'

export async function build(entry: string, options: UmdOptions) {
	const inputOptions = {
		input: entry,
		plugins: [commonjs(), rpt2({ check: false }), nodeResolve()],
		external: options.external
	}

	const outputOptions: OutputOptions = {
		file: 'index.js',
		format: 'umd',
		name: options.libraryName,
		globals: options.globalVariableName,
		exports: 'named',
		strict: false
	}

	try {
		const bundle = await rollup(inputOptions)
		const { output } = await bundle.generate(outputOptions)

		for (const chunkOrAsset of output) {
			if (chunkOrAsset.type === 'chunk') {
				return chunkOrAsset.code
			}
		}
	} catch (e) {
		console.error(e)
	}
}
