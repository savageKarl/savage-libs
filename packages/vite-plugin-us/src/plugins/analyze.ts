import type { PluginOption } from 'vite'

import type { UsOptions } from '../types/types'

import { DepCollection } from '../utils/depCollection'

export function analyze(usOptions: Required<UsOptions>) {
	const exclusions = usOptions.build.external?.exclusions as string[]
	const manuallyDeps = usOptions.build.external?.resources?.map(v => v.pkgName)
	const depCollection = new DepCollection(exclusions, manuallyDeps || [])

	return {
		name: 'vite-plugin-us:analyze',
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
