import { UserConfig, configDefaults } from 'vitest/config'
import config from './vitest.config'

export default {
	// eslint-disable-next-line no-restricted-syntax
	...config,
	test: {
		// eslint-disable-next-line no-restricted-syntax
		...config.test,
		exclude: [...configDefaults.exclude, '**/e2e/**']
	}
} as UserConfig
