import axios from 'axios'

// @ts-ignore
// eslint-disable-next-line dot-notation
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

export const serviceCDN = axios.create({
	headers: {
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.62'
	},
	timeout: 10000
})

serviceCDN.interceptors.response.use(
	response => response,
	err => Promise.reject(err)
)
