import type { PluginOption } from 'vite'

import type { UsOptions } from '../utils/types'

import { DepCollection } from '../utils/depCollection'
import { pluginName } from '../utils/constants'

export let depCollection: DepCollection

export function analyze(usOptions: Required<UsOptions>) {
  const exclusions = usOptions.build.external?.exclusions as string[]
  depCollection = new DepCollection(
    exclusions,
    usOptions.build.external?.resources || []
  )

  return {
    name: `${pluginName}:analyze`,
    enforce: 'pre',
    apply: 'build',
    load(id) {
      return depCollection.collectCssDep(id)
    },
    async transform(code, id) {
      if (usOptions.build?.external?.autoCDN) {
        depCollection.collectDep(code, id)
      }
    }
  } as PluginOption
}
