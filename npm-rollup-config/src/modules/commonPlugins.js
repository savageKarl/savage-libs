// let rollup to convert CommonJS modules to ES6, because it can only parse ES6 modules by default
// https://www.npmjs.com/package/@rollup/plugin-commonjs
import commonjs from 'rollup-plugin-commonjs'
// let rollup parse third-party lib, because it only can parse local modul
// https://www.npmjs.com/package/@rollup/plugin-node-resolve
import resolve from '@rollup/plugin-node-resolve'
// let rollup can delete any folder and files
// let rollup can minify code
// https://www.npmjs.com/package/@rollup/plugin-terser
// import terser from '@rollup/plugin-terser';
// used to obfuscate your code
// https://www.npmjs.com/package/rollup-obfuscator
import { obfuscator } from 'rollup-obfuscator'
// https://www.npmjs.com/package/@rollup/plugin-json
// Convert JSON files to ES Modules.
import json from '@rollup/plugin-json'

import autoExternal from 'rollup-plugin-auto-external'

import { obfusctorConfig } from './obfusctorConfig.js'
import { rollupCommand } from 'savage-rollup-command'

export const commonPlugins = () => {
	const isPro = process.env.mode === 'pro'
	return [
		commonjs(), // parse the module of commonjs specifications
		resolve(), // parse third-party lib, because rollup only can parse local module
		json(),
		rollupCommand({
			buildEnd(context) {
				context.run('cd tests && yarn test && npx link ..')
			}
		}),
		autoExternal(),
		...(isPro ? [obfuscator(obfusctorConfig)] : [])
	]
}

export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	plugins: [
		rollupCommand({
			options(context: IContext, options: InputOptions) {
				console.log(context, options)
				return options
			},
			buildStart(context: IContext) {
				console.log(context)
			},
			buildEnd(context: IContext) {
				// You can delete files here whenever you want
				context.del('./dist/*')
			},
			outputOptions(context: IContext, options: OutputOptions) {
				// or you can print options
				console.log(options)
			},
			renderStart(
				context: IContext,
				outputOptions: OutputOptions,
				inputOptions: InputOptions
			) {
				console.log(context, outputOptions, inputOptions)
			},
			writeBundle(context: IContext, options: OutputOptions, bundle: OutputChunk) {
				console.log(context, options, bundle)
			},
			closeBundle(context: IContext) {
				// You can also run some commands here\
				context.run('npm run test')
			}
		})
	]
}
