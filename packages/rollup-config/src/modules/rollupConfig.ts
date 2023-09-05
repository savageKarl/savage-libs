import { RollupOptions } from 'rollup'

import { mainBundleConfig } from './mainBundleConfig.js'
import { dtsBundleConfig } from './dtsBundleConfig.js'

export const getRollupConfig = (
	/** Can be used to change the default configuration */
	hook?: (options: RollupOptions[]) => RollupOptions[] | null
) => {
	// A bundle represents that an entry file will be packaged into a bundle
	const rollConfig = [mainBundleConfig(), dtsBundleConfig()] as RollupOptions[]

	hook?.(rollConfig)

	return rollConfig
}
