import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import { us } from '../../src'

export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			resolvers: [ElementPlusResolver()]
		}),
		Components({
			resolvers: [ElementPlusResolver()]
		}),
		us({
			entry: 'src/main.ts',
			headMetaData: {
				name: 'vue-ts',
				version: '1',
				author: 'savage',
				description: 'developing plugin',
				include: ['http://localhost:5500/packages/vite-plugin-us/index.html'],
				// runAt: '',
				runAt: 'document_start',
				require: [
					// 'https://unpkg.com/vue@3'
					//  'https://unpkg.com/element-plus'
				]
			},
			server: {
				port: 12345,
				open: false
			},
			build: {
				minify: false,
				external: {
					cdn: 'auto',
					exclude: ['element-plus']
				}
				// cssMinify: false
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
