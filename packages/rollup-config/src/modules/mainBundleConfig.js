// let rollup to package ts
// https://www.npmjs.com/package/rollup-plugin-typescript2
import rpt2 from 'rollup-plugin-typescript2'

import { tsconfigDefaults } from './tsconfigDefaults.js'
import { commonPlugins } from './commonPlugins.js'
import { commonInputAndOutput } from './commonInputAndOutput.js'

export const mainBundleConfig = () => {
	const isPro = process.env.mode === 'pro'
	return {
		...commonInputAndOutput(),
		plugins: [
			rpt2({
				tsconfigDefaults
			}),
			...(isPro ? [] : [])
		].concat(...commonPlugins())
		// ...commonExternal(pkg),
	}
}
