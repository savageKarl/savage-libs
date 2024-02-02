import type { ServerResponse } from 'node:http'

import { resolve } from 'node:path'

import type { Connect, ResolvedConfig, ViteDevServer } from 'vite'

import { devPath, previewPath, htmlTempalte } from '../utils/constants'
import { fnToString, setResHeader } from '../utils/utils'

import { readFileSync } from 'node:fs'
import type { UsOptions } from './types'

export function redirectMiddleware(mode: 'dev' | 'preview' | 'prod') {
  const strategy = {
    dev: devPath,
    preview: previewPath,
    prod: previewPath
  }

  const path = strategy[mode]

  return (
    req: Connect.IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction
  ) => {
    const url = req.url || '/'
    if (['/', '/index.html'].includes(url)) {
      setResHeader(res, {
        'content-type': 'text/html',
        'cache-control': 'no-cache',
        'access-control-allow-origin': '*'
      })
      return res.end(
        htmlTempalte.replace('__code__', fnToString(redirect, path))
      )
    }
    return next()
  }
}

export function bundleMiddware(
  resovledConfig: ResolvedConfig,
  usOptions: UsOptions
) {
  return (
    req: Connect.IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction
  ) => {
    if (!new RegExp(previewPath).test(req.url as string)) return next()

    setResHeader(res, {
      'access-control-allow-origin': '*',
      'content-type': 'application/javascript'
    })
    const path = resolve(
      resovledConfig.build.outDir as string,
      `${usOptions.metaData.name?.replace('production: ', '')}.user.js`
    )

    res.end(readFileSync(path, { encoding: 'utf-8' }))
    process.exit(0)
  }
}

interface SeverMiddleOptions {
  server: ViteDevServer
  currentOrigin: string
  usOptions: UsOptions
  newMetaData: string
  grants: string[]
}

export function serverMiddleware({
  server,
  currentOrigin,
  usOptions,
  newMetaData,
  grants
}: SeverMiddleOptions) {
  return async (
    req: Connect.IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction
  ) => {
    if (!new RegExp(devPath).test(req.url as string)) return next()

    setResHeader(res, {
      'access-control-allow-origin': '*',
      'content-type': 'application/javascript'
    })

    const htmlStr = await server.transformIndexHtml('', '')
    const regScriptTag = /<(script)[\s\S]+?<\/script>/g
    const scriptStrList = [...htmlStr.matchAll(regScriptTag)].map((v) => v[0])
    const scriptType = {
      inlineScriptList: [] as string[][],
      linkScriptList: [] as string[]
    }

    scriptStrList.forEach((s) => {
      const path = s.match(/src="(\/.+?)"/)?.[1]
      if (path) return scriptType.linkScriptList.push(`${currentOrigin}${path}`)

      const scriptContent = s.match(
        /<script type="module">([\s\S]+?)<\/script>/
      )?.[1]

      if (scriptContent)
        return scriptType.inlineScriptList.push(
          scriptContent
            .replace(/"/g, "'")
            .replace(/'(.+?)'/, `'${currentOrigin}$1'`)
            .split('\n')
        )
    })

    scriptType.linkScriptList.push(`${currentOrigin}/${usOptions.entry}`)

    type ScriptType = typeof scriptType

    return res.end(
      [
        newMetaData,
        fnToString((scriptType: ScriptType) => {
          scriptType.linkScriptList.reverse().forEach((src) => {
            const script = document.createElement('script')
            script.type = 'module'
            script.src = src as string
            document.head.insertBefore(script, document.head.firstChild)
          })

          scriptType.inlineScriptList.reverse().forEach((str) => {
            const script = document.createElement('script')
            script.type = 'module'
            script.textContent = str.join('\n')
            document.head.insertBefore(script, document.head.firstChild)
          })
          // @ts-ignore
          window.GM.log(
            `current vserion is ${GM.info.version}, enjoy your day!`
          )
        }, scriptType),

        usOptions.autoAddGrant
          ? fnToString((gmApiList: string[]) => {
              // @ts-ignore
              gmApiList.forEach((v) => (unsafeWindow[v] = window[v]))
              // @ts-ignore
              // eslint-disable-next-line dot-notation
              unsafeWindow['GM'] = window['GM']
            }, grants)
          : ''
      ].join('\n')
    )
  }
}

function redirect(path: string) {
  if (window.parent === window) {
    location.href = `/${path}`
    setTimeout(() => {
      window.close()
    }, 500)
  }
}
