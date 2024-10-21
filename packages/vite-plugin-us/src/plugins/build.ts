import http from 'node:http'
import { extname } from 'node:path'

import connect from 'connect'
import getPort from 'get-port'
import open, { apps } from 'open'

import {
  UserConfig,
  PluginOption,
  ResolvedConfig,
  transformWithEsbuild
} from 'vite'
import { OutputChunk, OutputAsset } from 'rollup'

import { Metadata } from '../utils/metadata'
import {
  addPrefixForName,
  hyphenToCamelCase,
  generateJsDataUrlByCode,
  transform,
  fnToString,
  injectCss
} from '../utils/utils'
import { grants, pluginName } from '../utils/constants'
import type { Grants } from '../utils/userscript'
import type { UsOptions, externalGlobal } from '../utils/types'
import { bundleMiddware, redirectMiddleware } from '../utils/middleware'

export function build(usOptions: Required<UsOptions>) {
  let resovledConfig: ResolvedConfig
  let cssUrls: string[]

  return {
    name: `${pluginName}:build`,
    enforce: 'post',
    apply: 'build',
    async config() {
      const externalGlobals = usOptions.build.external?.globals!
      // cssUrls = usOptions.build.external?.resources?.map((item) => item.url)!

      const r = usOptions.metaData.require
      usOptions.metaData.require = r?.concat(await addDataUrl(externalGlobals))

      const res = usOptions.metaData.resource
      // usOptions.metaData.resource = res?.concat(
      //   usOptions.build.external?.resources?.map((item) => [
      //     item.importName,
      //     item.url
      //   ])!
      // )

      const external = externalGlobals.map((item) => item.pkgName)
      const globals = externalGlobals.reduce((x, y) => {
        return {
          ...x,
          ...{
            [y.pkgName]: y.globalVariableName
          }
        }
      }, {})

      return {
        build: {
          minify: usOptions.build.minify,
          cssMinify: usOptions.build.cssMinify,
          lib: {
            entry: usOptions.entry,
            fileName: `${usOptions.metaData.name}`,
            name: hyphenToCamelCase(usOptions.metaData.name as string),
            formats: ['umd']
          },
          rollupOptions: {
            external,
            output: {
              globals
            }
          }
        }
      } as UserConfig
    },
    async load(id) {},
    async configResolved(config) {
      resovledConfig = config
    },
    async generateBundle(options, bundle) {
      const filename = `${usOptions.metaData.name}.umd.cjs`
      const chunk = bundle[filename] as OutputChunk
      chunk.fileName = `${usOptions.metaData.name}.user.js`
      const css = bundle['style.css'] as OutputAsset
      if (css) Reflect.deleteProperty(bundle, 'style.css')
      autoAddGrant(usOptions, chunk)
      addPrefixForName(usOptions, 'production')
      const metadata = new Metadata(usOptions.metaData)
      const metaDataStr = usOptions?.generate?.modifyMetadata?.(
        metadata.generate(),
        'production'
      ) as string
      const codes = [
        metaDataStr,
        '',
        await injectCss({
          links: [],
          inline: css ? String(css.source) : '',
          minify: usOptions.build.cssMinify as boolean,
          pluginName
        }),
        chunk.code
      ]
      chunk.code = codes.join('\n')
    },
    async closeBundle() {
      if (!usOptions.build.open?.enable) return

      const port = await getPort()
      const app = connect()

      app.use(redirectMiddleware('prod'))
      app.use(bundleMiddware(resovledConfig, usOptions))

      http.createServer(app).listen(port)
      const url = `http://localhost:${port}`

      const { nameOrPath } = usOptions.build?.open
      const name = ['chrome', 'firefox', 'edge'].includes(nameOrPath!)
        ? // @ts-ignore
          apps[nameOrPath]
        : nameOrPath

      open(url, {
        app: {
          name
        }
      })
    }
  } as PluginOption
}

/** NPF,`usOptions` */
function autoAddGrant(usOptions: UsOptions, chunk: OutputChunk) {
  if (usOptions.autoAddGrant) {
    const regex = new RegExp(grants.join('|'), 'g')
    const matchRes = [...chunk.code.matchAll(regex)]
    const collectedGrant = matchRes.map((v) => v[0])
    usOptions.metaData.grant = collectedGrant as Grants[]
  }
}

async function addDataUrl(globals: externalGlobal[]) {
  return globals.flatMap((item) => {
    const name = item.globalVariableName

    const template = `
    ;
    window.[name]  = [name] 
   ;
    `

    return [
      item.url,
      generateJsDataUrlByCode(template.replaceAll('[name]', name))
    ]
  })
}
