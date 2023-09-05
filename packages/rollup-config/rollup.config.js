// The reason why this plug-in is introduced here is that rpt2 always reports an error when packaging modules that use rollup-plugin-dts, and there is no way to solve it.
import typescript from '@rollup/plugin-typescript'
import { commonPlugins } from './src/modules/commonPlugins.js'
import { tsconfigDefaults } from './src/modules/tsconfigDefaults.js'
import { dtsBundleConfig } from './src/modules/dtsBundleConfig.js'
import { commonInputAndOutput } from './src/modules/commonInputAndOutput.js'

export default [
	{
		...commonInputAndOutput(),
		plugins: [typescript(tsconfigDefaults)].concat(...commonPlugins())
	},
	dtsBundleConfig()
]
