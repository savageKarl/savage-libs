import { PluginOption, transformWithEsbuild } from 'vite'

import type { UsOptions } from '../utils/types'
import { pluginName } from '../utils/constants'

export function externalResources(usOptions: Required<UsOptions>) {
  return {
    name: `${pluginName}:externalResources`,
    enforce: 'pre',
    apply: 'build',
    load(id) {
      // const externalResourse = usOptions.build.external?.resources
      // const isExternalResourse = externalResourse
      //   ?.map((item) => item.importName)
      //   .some((v) => id.includes(v))
      // if (isExternalResourse) return ''
      // const externalResourse = usOptions.build.external?.resources
      // const isExternalResourse = externalResourse
      //   ?.map((item) => item.importName)
      //   .some((v) => id.includes(v))
      // if (isExternalResourse) {
      //   let moudleCode: string[] = []
      //   const r = externalResourse?.find((v) => id.includes(v.importName))!
      //   const ext = id.split('.').pop()
      //   switch (ext) {
      //     case 'css':
      //       moudleCode = [
      //         `import {cssLoader as loader} from 'virtual:plugin-us-loader'`,
      //         `export default loader('${r.importName}')`
      //       ]
      //       break
      //     case 'json':
      //       moudleCode = [
      //         `import {jsonLoader as loader} from 'virtual:plugin-us-loader'`,
      //         `export default loader('${r.importName}')`
      //       ]
      //       break
      //   }
      //   return moudleCode.join(';')
      // }
    },
    transform(code, id) {
      return code
    },
    generateBundle(options, bundle) {
      // TODO
      // if (usOptions.build.external?.resources?.length! > 0) {
      //   usOptions.metaData.grant?.push('GM_getResourceText')
      // }
    }
  } as PluginOption
}

function cssLoader(importName: string) {
  const css = GM_getResourceText(importName)
  GM_addStyle(css)
  return css
}

function jsonLoader(importName: string) {
  return JSON.parse(GM_getResourceText(importName))
}

export const miniCode = async (code: string, type: 'css' | 'js' = 'js') => {
  return (
    await transformWithEsbuild(code, 'any_name.' + type, {
      minify: true,
      sourcemap: false,
      legalComments: 'none'
    })
  ).code.trimEnd()
}
