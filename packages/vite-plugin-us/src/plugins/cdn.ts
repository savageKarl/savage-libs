import axios from 'axios'

axios.interceptors.response.use(
	response => response,
	err => Promise.resolve(err)
)

// @ts-ignore
// eslint-disable-next-line dot-notation
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const without = [
	// https://unpkg.com/
	'https://unpkg.com',
	// https://www.jsdelivr.com/
	'https://www.jsdelivr.com',
	// https://cdnjs.com/libraries
	'https://cdnjs.cloudflare.com'
]

const widthin = [
	// https://cnpmweb.vercel.app/
	'https://registry.npmmirror.com',
	// https://cdn.bytedance.com/
	'https://lf9-cdn-tos.bytecdntp.com',
	// https://www.bootcdn.cn/
	'https://cdn.bootcdn.net',
	// https://lib.baomitu.com/
	'https://lib.baomitu.com',
	// https://staticfile.org
	'https://cdn.staticfile.org'
]

// 区分国内外的情况，国内的cdn拿npmmirror这个来做分析，国外的
// 用路径分析，然后再去使用最新的cdn进行组合url
const urls = [...without, ...widthin]

// 将在这里进行自动选择cdn
export async function getFastCdn() {
	const winner = await Promise.race([...urls.map(v => axios.options(v))])

	return winner.config.url as string
}
