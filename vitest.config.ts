import { configDefaults, defineConfig, UserConfig } from 'vitest/config'
import { entries } from './scripts/aliases.js'

export default defineConfig({
	resolve: {
		alias: entries
	},
	test: {
		globals: true,
		environment: 'jsdom',
		// disable threads on GH actions to speed it up
		threads: !process.env.GITHUB_ACTIONS,
		setupFiles: 'scripts/setupVitest.ts',

		// sequence: {
		// 	hooks: 'list'
		// },
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'html']
		}
	}
}) as UserConfig
