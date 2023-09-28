import type { PluginOption } from 'vite'

import type { UsOptions } from '../types/types'

import { DepCollection } from '../utils/depCollection'
import { pluginName } from '../utils/constants'

export function analyze(usOptions: Required<UsOptions>) {
	const exclusions = usOptions.build.external?.exclusions as string[]
	const depCollection = new DepCollection(
		exclusions,
		usOptions.build.external?.resources || []
	)

	return {
		name: `${pluginName}:analyze`,
		enforce: 'pre',
		apply: 'serve',
		load(id) {
			return depCollection.collectCssDep(id)
		},
		async transform(code, id) {
			if (usOptions.build?.external?.autoCDN) {
				depCollection.collectDep(code, id)
				depCollection.parsedep()
			}
		}
	} as PluginOption
}
