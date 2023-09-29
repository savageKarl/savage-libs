import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

import { us } from '../../src'

export default defineConfig({
	plugins: [
		react(),
		us({
			entry: 'src/main.tsx',
			headMetaData: {
				name: 'react-ts',
				version: '1',
				author: 'savage',
				description: 'developing plugin',
				include: ['http://localhost:5501/packages/vite-plugin-us/index.html'],
				match: ['https://translate.google.com/*'],
				// runAt: '',
				runAt: 'document_start',
				require: [
					// 'https://unpkg.com/vue@3'
					//  'https://unpkg.com/element-plus'
				]
			},
			server: {
				port: 12345
				// open: false
			},
			build: {
				minify: false,
				external: {
					autoCDN: true,
					exclusions: ['element-plus']
				},
				cssMinify: false
			},
			generate: {
				headMetaData(code, mode) {
					return code + '\n' + '// hi, there' + mode
				},
				bundle(code) {
					return code + '\n' + '// hi, there'
				}
			}
		})
	]
})
