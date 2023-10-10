import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

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

serviceCDN.interceptors.request.use(config => {
	config.time = Date.now()
	return config
})

serviceCDN.interceptors.response.use(
	response => {
		response.time = Date.now()
		return response
	},
	err => {
		// writeFile(resolve('axiosErrorLog.json'), JSON.stringify(err, null, 4), {
		// 	encoding: 'utf-8'
		// })
		return Promise.reject(err)
	}
)
