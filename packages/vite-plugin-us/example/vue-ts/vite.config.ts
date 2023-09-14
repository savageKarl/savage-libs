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
				include: ['*'],
				runAt: 'document_start'
			},
			server: {
				port: 12345
			}
		})
	]
})
