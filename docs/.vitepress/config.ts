import { resolve } from 'node:path'
import { packagesRoot } from '../../scripts/utils'
import { defineConfig } from 'vitepress'

import sidebar from '../sidebar.json'
import rewrites from '../rewrites.json'

import { getPkgJson, projectRoot } from '../../scripts/utils'

const name = getPkgJson(projectRoot).name

export default defineConfig({
  base: `/${name}/`,
  title: `${name}`,
  head: [[`link`, { rel: 'icon', href: `/${name}/savage.ico` }]],
  themeConfig: {
    logo: {
      src: '/savage.png',
      width: 24,
      height: 24
    },
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/savage181855/savage-libs' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present savage'
    },
    search: {
      provider: 'local'
    }
  },
  rewrites: rewrites as any
})
