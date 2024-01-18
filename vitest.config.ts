import { defineConfig, UserConfig } from 'vitest/config'
import { compilerOptions } from './tsconfig.path.json'

export default defineConfig({
	resolve: {
		alias: getAlias(compilerOptions.paths)
	},
	test: {
		globals: true,
		// environment: 'jsdom',
		threads: true,
		setupFiles: 'scripts/setupVitest.ts',
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'html']
		}
	}
}) as UserConfig

function getAlias(pathRecord: Record<string, string[]>) {
	return Object.keys(pathRecord).reduce(
		(preV, curV) => Object.assign(preV, { [curV]: pathRecord[curV][0] }),
		{} as Record<string, string>
	)
}
