import { createLogger } from 'savage-log'

import type { UmdOptions } from './types'

export function validate(options: UmdOptions, entryPath: string) {
  const log = createLogger({
    label: 'esbuild-plugin-umd'
  })

  let status = true

  const setFalse = () => (status = false)

  log.info('Building entry', entryPath)

  if (options.libraryName === '') {
    log.error('libraryName must be provide!')
    setFalse()
  }

  for (const pkg of options.external) {
    const key = options.globalVariableName[pkg]
    if (!key) {
      log.error(`library ${pkg} must be provide global variable name!`)
    }
  }

  return status
}
