import { ItemCDN } from '../utils/types'

// const jsdelivr: ItemCDN = {
// 	homePage: 'https://www.jsdelivr.com',
// 	name: 'jsdelivr',
// 	url: 'https://cdn.jsdelivr.net/npm',
// 	useAt: true,
// 	range: 'foreign',
// 	leading: true,
// 	removeDistPath: false,
// 	addFilesFolder: false,
// 	supportSvgAndJson: true,
// 	provideMinify: true
// }

// const unpkg: ItemCDN = {
// 	homePage: 'https://unpkg.com',
// 	name: 'unpkg',
// 	url: 'https://unpkg.com',
// 	useAt: true,
// 	range: 'foreign',
// 	provideMinify: false,
// 	removeDistPath: false,
// 	addFilesFolder: false,
// 	supportSvgAndJson: true
// }

// const cloudflare: ItemCDN = {
// 	homePage: 'https://cdnjs.com',
// 	name: 'cloudflare',
// 	url: ' https://cdnjs.cloudflare.com/ajax/libs',
// 	range: 'foreign',
// 	useAt: false,
// 	addFilesFolder: false,
// 	removeDistPath: true,
// 	provideMinify: true,
// 	supportSvgAndJson: false
// }

const npmmirror: ItemCDN = {
  homePage: 'https://npmmirror.com',
  name: 'npmmirror',
  url: 'https://registry.npmmirror.com',
  addFilesFolder: true,
  provideMinify: false,
  leading: true,
  removeDistPath: false,
  useAt: false,
  range: 'domestic',
  supportSvgAndJson: true
}

// const bytedance: ItemCDN = {
// 	homePage: 'https://cdn.bytedance.com',
// 	range: 'domestic',
// 	provideMinify: true,
// 	removeDistPath: true,
// 	addFilesFolder: false,
// 	supportSvgAndJson: false,
// 	useAt: false,
// 	name: 'bytedance',
// 	url: 'https://lf6-cdn-tos.bytecdntp.com/cdn/expire-1-M'
// }

// const bootcdn: ItemCDN = {
// 	homePage: 'https://www.bootcdn.cn',
// 	range: 'domestic',
// 	provideMinify: true,
// 	removeDistPath: true,
// 	addFilesFolder: false,
// 	supportSvgAndJson: false,
// 	useAt: false,
// 	name: 'bootcdn',
// 	url: 'https://cdn.bootcdn.net/ajax'
// }

// const baomitu: ItemCDN = {
// 	homePage: 'https://cdn.baomitu.com',
// 	range: 'domestic',
// 	provideMinify: true,
// 	removeDistPath: true,
// 	addFilesFolder: false,
// 	supportSvgAndJson: false,
// 	useAt: false,
// 	name: 'baomitu',
// 	url: 'https://lib.baomitu.com'
// }

// const staticfile: ItemCDN = {
// 	homePage: 'https://staticfile.org',
// 	range: 'domestic',
// 	provideMinify: true,
// 	removeDistPath: true,
// 	addFilesFolder: false,
// 	supportSvgAndJson: false,
// 	useAt: false,
// 	name: 'staticfile',
// 	url: 'https://cdn.staticfile.org'
// }

export const usedCdnList = [
  // jsdelivr,
  // unpkg,
  // cloudflare,
  npmmirror
  // bytedance,
  // bootcdn,
  // baomitu,
  // staticfile
]
