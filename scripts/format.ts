import { packagesRoot, pkgNames, projectRoot } from './utils'
import { normalizePath } from 'savage-utils'
import glob from 'fast-glob'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as prettier from 'prettier'

const pkgPaths = pkgNames.map((name) => {
  const directories = ['src', 'playground', '__test__']
  return directories.map((t) => {
    const path = normalizePath(
      resolve(packagesRoot, name, t, '**', '*.[tj]s(x)?')
    )
    return path
  })
})

const scriptsPaths = glob.sync(
  normalizePath(resolve(projectRoot, 'scripts', '**', '*.[tj]s(x)?')),
  { ignore: ['**/node_modules/**'] }
)

const paths = pkgPaths
  .map((p) => glob.sync(p, { ignore: ['**/node_modules/**'] }))
  .concat(scriptsPaths)
  .flat()

format()
async function format() {
  const options = await prettier.resolveConfig('./prettierrc.cjs')
  paths.forEach(async (p) => {
    const content = readFileSync(p, 'utf-8')
    writeFileSync(p, await prettier.format(content, options!), 'utf-8')
  })
}
