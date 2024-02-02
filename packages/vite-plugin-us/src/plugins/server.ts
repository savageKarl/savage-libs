import fs from 'node:fs/promises'

import type { PluginOption, ResolvedConfig } from 'vite'
import open, { apps } from 'open'

import type { Grants } from '../utils/userscript'
import type { UsOptions } from '../utils/types'

import { Metadata } from '../utils/metadata'
import {
  existFile,
  setResHeader,
  fnToString,
  addPrefixForName
} from '../utils/utils'
import { devPath, grants, pluginName } from '../utils/constants'
import { serverMiddleware } from '../utils/middleware'
import { generateFiles } from 'savage-node'

export function serve(usOptions: Required<UsOptions>) {
  let resovledConfig: ResolvedConfig
  let currentOrigin: string

  return {
    name: `${pluginName}:serve`,
    enforce: 'post',
    apply: 'serve',
    async configResolved(config) {
      resovledConfig = config
    },
    async configureServer(server) {
      addPrefixForName(usOptions, 'development')

      usOptions.metaData.grant = grants as unknown as Grants[]
      const metadata = new Metadata(usOptions.metaData)

      const newMetaData = usOptions.generate.modifyMetadata?.(
        metadata.generate(),
        'development'
      ) as string
      const { host, port } = usOptions.server
      currentOrigin = `http://${host as string}:${port as number}`

      server.middlewares.use(
        serverMiddleware({
          server,
          currentOrigin,
          usOptions,
          newMetaData,
          grants
        })
      )

      if (!usOptions.server?.open?.enable) return

      const cachePath = `node_modules/.vite/${pluginName}.cache.js`
      let cacheMetaData = ''

      if (existFile(cachePath)) {
        cacheMetaData = (await fs.readFile(cachePath)).toString('utf-8')
      } else {
        generateFiles({ [cachePath]: '' })
      }

      if (cacheMetaData !== newMetaData) {
        const { nameOrPath } = usOptions.server?.open
        const name = ['chrome', 'firefox', 'edge'].includes(nameOrPath)
          ? // @ts-ignore
            apps[nameOrPath]
          : nameOrPath

        const url = currentOrigin
        Promise.all([
          open(url, {
            app: {
              name
            }
          }),
          fs.writeFile(cachePath, newMetaData)
        ])
      }
    },
    transform(code, id) {
      return replaceAssetUrl()

      function replaceAssetUrl() {
        const reg = /export\s+default\s+"(.+?)"/
        if (resovledConfig.assetsInclude(id) && reg.test(code)) {
          return code.replace(reg, `export default '${currentOrigin}$1'`)
        }
      }
    }
  } as PluginOption
}
