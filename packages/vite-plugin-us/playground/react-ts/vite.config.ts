import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

import { us } from '../../src'

export default defineConfig({
	plugins: [
		react(),
		us({
			entry: 'src/main.tsx',
			metaData: {
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
				open: true,
				// minify: false,
				external: {
					autoCDN: true,
					exclusions: ['react-dom']
				}
				// cssMinify: false
			},
			generate: {
				modifyMetadata(code, mode) {
					return code + '\n' + '// hi, there ' + mode
				},
				modifyBundle(code) {
					return code + '\n' + '// hi, there'
				}
			}
		})
	]
})
