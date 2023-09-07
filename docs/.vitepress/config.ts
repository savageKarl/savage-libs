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
		// sidebar: (sidebar ? sidebar : {}) as any,
		sidebar,
		nav: [
			{ text: 'Guide', link: '/guide' },
			{
				text: 'Dropdown Menu',
				items: [
					{ text: 'Item A', link: '/item1-1' },
					{ text: 'Item B', link: '/item-2' },
					{ text: 'Item C', link: '/item-3' }
				]
			}
		],
		socialLinks: [{ icon: 'github', link: 'https://github.com/savage181855' }],
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2019-present savage'
		},
		search: {
			provider: 'algolia',
			options: {
				appId: '8J64VVRP8K',
				apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
				indexName: 'vitepress'
			}
		}
	}
})
