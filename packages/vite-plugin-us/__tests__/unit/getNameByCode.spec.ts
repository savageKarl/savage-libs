import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateFiles } from 'savage-node'
import { getNameByCode } from '../../src/cdn/getNameByCode'
import { serviceCDN } from '../../src/cdn/service'
import { existFile } from '../../src/utils/utils'
import { pluginName } from '../../src/utils/constants'
import { packagesRoot } from '../../../../scripts/utils'

function join(path: string) {
	return resolve(
		packagesRoot,
		pluginName,
		'__tests__',
		'unit',
		'getNameByCodeWithTestData',
		path
	)
}

interface Item {
	url: string
	pkgName: string
	name: string
}

// pay attention to dependencies order
const list: Item[] = [
	{
		url: 'https://code.jquery.com/jquery-3.7.1.min.js',
		pkgName: 'jquery',
		name: '$'
	},
	{
		url: 'https://registry.npmmirror.com/vue/3.4.15/files/dist/vue.global.prod.js',
		pkgName: 'vue',
		name: 'Vue'
	},
	{
		url: 'https://registry.npmmirror.com/vue-demi/0.14.6/files/lib/index.iife.js',
		pkgName: 'vue-demi',
		name: 'VueDemi'
	},
	{
		url: 'https://registry.npmmirror.com/pinia/2.1.7/files/dist/pinia.iife.prod.js',
		pkgName: 'pinia',
		name: 'Pinia'
	},
	{
		url: 'https://registry.npmmirror.com/react/18.2.0/files/umd/react.production.min.js',
		pkgName: 'react',
		name: 'React'
	},
	{
		url: 'https://registry.npmmirror.com/react-dom/18.2.0/files/umd/react-dom.production.min.js',
		pkgName: 'react-dom',
		name: 'ReactDOM'
	},
	{
		url: 'https://registry.npmmirror.com/dayjs/1.11.10/files/dayjs.min.js',
		pkgName: 'dayjs',
		name: 'dayjs'
	},
	{
		url: 'https://registry.npmmirror.com/antd/5.13.2/files/dist/antd.min.js',
		pkgName: 'antd',
		name: 'antd'
	},
	{
		url: 'https://registry.npmmirror.com/blueimp-md5/2.19.0/files/js/md5.min.js',
		pkgName: 'blueimp-md5',
		name: 'md5'
	},
	{
		url: 'https://registry.npmmirror.com/echarts/5.4.3/files/dist/echarts.min.js',
		pkgName: 'echarts',
		name: 'echarts'
	},
	{
		url: 'https://registry.npmmirror.com/element-plus/2.5.2/files/dist/index.full.min.js',
		pkgName: 'element-plus',
		name: 'ElementPlus'
	},
	{
		url: 'https://registry.npmmirror.com/vuex/4.1.0/files/dist/vuex.global.prod.js',
		pkgName: 'vuex',
		name: 'Vuex'
	},
	{
		url: 'https://registry.npmmirror.com/xgplayer/3.0.11/files/dist/index.min.js',
		pkgName: 'xgplayer',
		name: 'Player'
	}
]

describe('getNameByCode', () => {
	it('should find the global name', async () => {
		for (const v of list) {
			const path = join(`${v.pkgName}.js`)
			let content: string
			if (existFile(path)) {
				content = await readFile(path, { encoding: 'utf-8' })
			} else {
				const res = await serviceCDN({
					url: v.url,
					time: Date.now(),
					headers: {
						Accept:
							'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
						'Accept-Encoding': 'gzip, deflate, br',
						'Accept-Language': 'zh-CN,zh;q=0.9',
						'Cache-Control': 'max-age=0',
						'Sec-Ch-Ua':
							'"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
						'Sec-Ch-Ua-Mobile': '?0',
						'Sec-Ch-Ua-Platform': '"Windows"',
						'Sec-Fetch-Dest': 'document',
						'Sec-Fetch-Mode': 'navigate',
						'Sec-Fetch-Site': 'none',
						'Sec-Fetch-User': '?1',
						'Upgrade-Insecure-Requests': '1',
						'User-Agent':
							'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
					}
				})
				content = res.data
				await generateFiles({ [path]: content })
			}
			expect(getNameByCode(v.pkgName, content)).toBe(v.name)
		}
	})
})
