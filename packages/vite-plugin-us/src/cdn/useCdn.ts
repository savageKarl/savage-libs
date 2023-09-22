import { ItemCDN } from '../types/types'

const jsdelivr: ItemCDN = {
	// https://www.jsdelivr.com
	name: 'jsdelivr',
	url: 'https://cdn.jsdelivr.net/npm',
	useAt: true,
	range: 'foreign',
	isLeading: true
}

const unpkg: ItemCDN = {
	// https://unpkg.com
	name: 'unpkg',
	url: 'https://unpkg.com',
	useAt: true,
	range: 'foreign',
	provideMinify: false,
	removeDistPath: false
}

const cloudflare: ItemCDN = {
	// https://cdnjs.com
	name: 'cloudflare',
	url: ' https://cdnjs.cloudflare.com/ajax/libs',
	range: 'foreign'
}

const npmmirror: ItemCDN = {
	// https://cnpmweb.vercel.app
	name: 'npmmirror',
	url: 'https://registry.npmmirror.com',
	addFilesFolder: true,
	provideMinify: false,
	isLeading: true,
	removeDistPath: false
}

const bytedance: ItemCDN = {
	// https://cdn.bytedance.com
	name: 'bytedance',
	url: 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M'
}

const bootcdn: ItemCDN = {
	// https://www.bootcdn.cn
	name: 'bootcdn',
	url: 'https://cdn.bootcdn.net/ajax'
}

const staticfile: ItemCDN = {
	// https://staticfile.org
	name: 'staticfile',
	url: 'https://cdn.staticfile.org'
}

export const usedCdnList = [
	jsdelivr,
	unpkg,
	cloudflare,
	npmmirror,
	bytedance,
	bootcdn,
	staticfile
]
