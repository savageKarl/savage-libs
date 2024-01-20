import { parseNpmmirrorPathInfo } from '../../src/cdn/cdn'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateFiles } from 'savage-node'
import { serviceCDN } from '../../src/cdn/service'
import { existFile } from '../../src/utils/utils'
import { pluginName } from '../../src/utils/constants'
import { packagesRoot } from '../../../../scripts/utils'
import { isString } from 'savage-types'

interface Item {
	pkgName: string
	url: string
}

const list = [
	{
		pkgName: 'jquery',
		url: 'https://registry.npmmirror.com/jquery/3.7.1/files?meta'
	},
	{
		pkgName: 'vue',
		url: 'https://registry.npmmirror.com/vue/3.4.15/files?meta'
	},
	{
		pkgName: 'vue-demi',
		url: 'https://registry.npmmirror.com/vue-demi/0.14.6/files?meta'
	},
	{
		pkgName: 'pinia',
		url: 'https://registry.npmmirror.com/pinia/2.1.7/files?meta'
	},
	{
		pkgName: 'react',
		url: 'https://registry.npmmirror.com/react/18.2.0/files?meta'
	},
	{
		pkgName: 'react-dom',
		url: 'https://registry.npmmirror.com/react-dom/18.2.0/files?meta'
	},
	{
		pkgName: 'dayjs',
		url: 'https://registry.npmmirror.com/dayjs/1.11.10/files?meta'
	},
	{
		pkgName: 'antd',
		url: 'https://registry.npmmirror.com/antd/5.13.2/files?meta'
	},
	{
		pkgName: 'blueimp-md5',
		url: 'https://registry.npmmirror.com/blueimp-md5/2.19.0/files?meta'
	},
	{
		pkgName: 'echarts',
		url: 'https://registry.npmmirror.com/echarts/5.4.3/files?meta'
	},
	{
		pkgName: 'element-plus',
		url: 'https://registry.npmmirror.com/element-plus/2.5.2/files?meta'
	},
	{
		pkgName: 'vuex',
		url: 'https://registry.npmmirror.com/vuex/4.1.0/files?meta'
	},
	{
		pkgName: 'xgplayer',
		url: 'https://registry.npmmirror.com/xgplayer/3.0.11/files?meta'
	}
]

function join(path: string, snap = false) {
	const split = [packagesRoot, pluginName, '__tests__', 'unit']
	if (snap) {
		split.push(...['__fileSnapshot__', 'parseNpmmirrorPathInfo'])
	} else {
		split.push('parseNpmmirrorPathInfoTestData')
	}
	split.push(path)

	return resolve(...split)
}

describe('CDN', () => {
	it('should correctly parse directory information', async () => {
		for (const v of list) {
			const path = join(`${v.pkgName}.json`)
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
				await generateFiles({
					[path]: JSON.stringify(content, null, 4)
				})
			}
			content = isString(content) ? JSON.parse(content) : content

			expect(
				JSON.stringify(parseNpmmirrorPathInfo(content as any), null, 4)
			).toMatchFileSnapshot(join(`${v.pkgName}.json`, true))
		}
	})
})
