import { defineConfig } from 'vitepress'

import sidebar from '../sidebar.json'

const name = 'savage-libs'

export default defineConfig({
	base: `/${name}/`,
	title: `${name}`,
	head: [[`link`, { rel: `icon`, href: `/${name}/savage.ico` }]],
	themeConfig: {
		logo: {
			src: '/savage.png',
			width: 24,
			height: 24
		},
		sidebar,
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
