import { MetaData } from './userscript'

import { camelCaseToHyphen, padEndWithSpace } from './utils'

export class Metadata {
  private options: MetaData
  private metadataList: string[] = []
  constructor(options: MetaData) {
    this.options = options
  }

  private addMetadata(key: string, value: string | boolean) {
    if (typeof value === 'boolean') value = ''

    const padLen = 31
    this.metadataList.push(`// @${padEndWithSpace(key, padLen)}${value}`)
  }

  public generate() {
    const useHyphen = ['excludeMatch', 'runAt']
    const tupleArray = ['antifeature', 'resource']

    for (let [k, v] of Object.entries(this.options)) {
      if (useHyphen.includes(k)) k = camelCaseToHyphen(k)

      if (typeof v === 'string' || typeof v === 'boolean')
        this.addMetadata(k, v)

      if (Array.isArray(v)) {
        if (tupleArray.includes(k)) {
          v.forEach((subv) => {
            let [name, value, tag] = subv
            tag = tag ? `:${tag}` : ''

            const fistParagraph = padEndWithSpace(k + tag, 19)
            this.addMetadata(fistParagraph + name, value as string)
          })
        } else {
          v.forEach((subv) => this.addMetadata(k, subv as string))
        }
      }
    }

    return [
      '// ==UserScript==',
      ...this.metadataList,
      '// ==/UserScript=='
    ].join('\n')
  }
}
