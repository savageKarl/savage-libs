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
// This is a plugin that lets you roll-up your .d.ts definition files.
// https://www.npmjs.com/package/rollup-plugin-dts
import { dts } from 'rollup-plugin-dts'
// https://www.npmjs.com/package/rollup-plugin-typescript2
import rpt2 from 'rollup-plugin-typescript2'

import { rollupCommand } from 'savage-rollup-command'

import { obfusctorConfig } from './obfusctorConfig.js'
import { tsconfigDefaults } from './tsconfigDefaults.js'

const isPro = process.env.mode === 'pro'
export default [
	{
		input: 'src/index.ts', // pack entry
		output: [
			{
				file: 'dist/index.mjs', // ouput file
				format: 'esm', // file module specifications
				sourcemap: true
			},
			{
				file: 'dist/index.cjs', // ouput file
				format: 'cjs', // file module specifications
				sourcemap: true
			}
		],
		plugins: [
			commonjs(), // parse the module of commonjs specifications
			resolve(), // parse third-party lib, because rollup only can parse local module
			json(),
			rollupCommand({
				buildEnd(ctx) {
					ctx.run('cd tests && yarn test && npx link ..')
				}
			}),
			autoExternal(),
			...(isPro ? [obfuscator(obfusctorConfig)] : []),
			rpt2({
				tsconfigDefaults
			}),
			...(isPro ? [] : [])
		]
	},
	{
		input: './dist/index.d.ts',
		output: [{ file: 'dist/main.d.ts', format: 'es' }],
		plugins: [
			// When using this plug-in in rollup monitoring mode, input file cannot be change or delete, otherwise an error will be reported. This is a bug that cannot be solved.
			// so i use the nodemon to watch target file
			dts(),
			rollupCommand({
				closeBundle(ctx) {
					ctx.del([
						'dist/*',
						'!dist/index.cjs',
						'!dist/index.mjs',
						'!dist/main.d.ts',
						'!dist/index.cjs.map',
						'!dist/index.mjs.map'
					])
				}
			})
		]
	}
]
