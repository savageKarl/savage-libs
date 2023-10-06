import type { Plugin } from 'esbuild'

import { pluginName } from './constants'

export function umd() {
	return {
		name: pluginName,
		setup(build) {
			const { initialOptions } = build
		}
	} as Plugin
}

export default umd
