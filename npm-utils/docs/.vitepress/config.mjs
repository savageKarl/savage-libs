import { defineConfig } from 'vitepress'

import apidocConfig from '../apidocConfig.json'

import pkg from '../../package.json'

const name = pkg.name
const path = name.replace(/([a-z]+-)/, 'npm-')

export default defineConfig({
	base: `/${path}/`,
	title: `${name}`,
	head: [[`link`, { rel: `icon`, href: `/${path}/savage.ico` }]],
	themeConfig: {
		logo: {
			src: '/savage.png',
			width: 24,
			height: 24
		},
		sidebar: {
			'/dist/': apidocConfig
		},
		nav: [{ text: 'Guide', link: '/dist/modules' }],
		socialLinks: [{ icon: 'github', link: 'https://github.com/savage181855' }],
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2019-present savage'
		},
		search: {
			provider: 'local'
		}
	}
})
