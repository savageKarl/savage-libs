import { defineConfig, UserConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

import { compilerOptions } from './tsconfig.path.json'

export default defineConfig({
  // @ts-ignore
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    testTimeout: 200000000,
    // environment: 'jsdom',
    // environmentMatchGlobs: [['react-liberate/**', 'jsdom']],
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
