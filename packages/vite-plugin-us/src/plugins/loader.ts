import { PluginOption, transformWithEsbuild } from 'vite'

import type { UsOptions } from '../utils/types'

import { DepCollection } from '../utils/depCollection'
import { pluginName } from '../utils/constants'

export let depCollection: DepCollection

export function loader(usOptions: Required<UsOptions>) {
  return {
    name: `${pluginName}:loader`,
    enforce: 'pre',
    apply: 'build',
    async resolveId(id) {
      // console.log('loader resolveId', id)
      if (id == 'virtual:plugin-us-loader') {
        return '\0' + id
      }
    },
    load(id) {
      // console.log('loader load', id)
      if (id == '\0virtual:plugin-us-loader') {
        debugger
        const moduleSourceCode = [
          `export const cssLoader = ${cssLoader}`,
          `export const jsonLoader = ${jsonLoader}`
        ].join(';')
        return transformWithEsbuild(
          moduleSourceCode,
          '/virtual/plugin-monkey-loader/index.js',
          {
            minify: true,
            sourcemap: true,
            legalComments: 'none'
          }
        )
      }
    }
  } as PluginOption
}

function cssLoader(importName: string) {
  // @ts-ignore
  const css = GM_getResourceText(importName)
  // @ts-ignore
  GM_addStyle(css)
  // console.log(importName)
  return css
}


const jsonLoader = (resourceName: string): unknown =>
  // @ts-ignore
  JSON.parse(GM_getResourceText(resourceName));