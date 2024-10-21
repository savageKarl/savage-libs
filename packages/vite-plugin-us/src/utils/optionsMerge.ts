import getPort from 'get-port'

import { mergeDeep } from 'savage-utils'

import { pkg, pluginName } from './constants'
import { UsOptions } from './types'

type TargetType = string | Record<string, string> | undefined

function takeFieldFromTarget(field: string, target: TargetType) {
  if (typeof target === 'object') return target[field] ?? ''
  return target ?? ''
}

const defaultOpts: Required<UsOptions> = {
  entry: '',
  prefix: true,
  autoAddGrant: true,
  server: {
    port: 12345,
    open: {
      enable: true,
      nameOrPath: 'chrome'
    },
    host: 'localhost'
  },
  build: {
    open: {
      enable: true,
      nameOrPath: 'chrome'
    },
    minify: true,
    cssMinify: true,
    external: {
      globals: []
      // resources: []
    }
  },
  generate: {
    modifyMetadata: (metaData) => metaData,
    modifyBundle: (code) => code
  },
  metaData: {
    name: pkg.name || pluginName,
    version: pkg.version || '0.0.1',
    description: pkg.description || 'welcome use vite-plugin-us',
    author: takeFieldFromTarget('name', pkg.author as TargetType),
    supportURL: takeFieldFromTarget('url', pkg.bugs as TargetType),
    require: []
  }
}

getPort({ port: 12345 }).then((n) => (defaultOpts.server.port = n))

export function mergeOptions(opts: UsOptions) {
  const mergedOpts = mergeDeep(defaultOpts, opts)
  return mergedOpts as Required<UsOptions>
}
