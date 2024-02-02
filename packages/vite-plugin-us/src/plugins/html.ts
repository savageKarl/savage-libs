import type { UserConfig, PluginOption } from 'vite'

import type { UsOptions } from '../utils/types'

import { pluginName } from '../utils/constants'
import { redirectMiddleware } from '../utils/middleware'

export function html(usOptions: Required<UsOptions>) {
  return {
    name: `${pluginName}:html`,
    enforce: 'post',
    apply: 'serve',
    config() {
      const { host, port } = usOptions.server
      const serveConfig = {
        open: false,
        cors: true,
        host,
        port
      }
      return {
        server: serveConfig,
        preview: serveConfig
      } as UserConfig
    },
    async configureServer(server) {
      server.middlewares.use(redirectMiddleware('dev'))
    },
    async configurePreviewServer(server) {
      server.middlewares.use(redirectMiddleware('preview'))
    }
  } as PluginOption
}
