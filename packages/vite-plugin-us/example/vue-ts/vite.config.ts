import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { us } from '../../src'

export default defineConfig({
	plugins: [
		vue(),
		us({
			entry: 'src/main.ts',
			fileName: 'myscript',
			headMetaData: {
				name: 'vue-ts',
				version: '1',
				author: 'savage',
				description: 'developing plugin',
				include: ['http://localhost:5500/packages/vite-plugin-us/index.html'],
				runAt: 'document_start',
				require: ['https://unpkg.com/vue@3/dist/vue.global.js']
			},
			server: {
				port: 12345
			}
		})
	]
})
