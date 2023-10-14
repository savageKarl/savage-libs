## Feature

- supports browser extensions such as Tampermonkey, Violentmonkey, Greasemonkey, and ScriptCat
- automatically add all grants to metadata in development mode
- automatically collect and add grants to metadata in production mode
- automatically open default browser for install \*.user.js in development or production mode
- automatically introduce CDN resources for dependent packages used
- support HMR after changing any files.
- Built-in Tampermonkey's TypeScript type definition.

## How to use

```ts
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
				version: '0.0.1',
				author: 'savage',
				description: 'developing plugin',
				match: ['https://translate.google.com/*'],
				runAt: 'document_start',
			},
			server: {
				port: 12345
			},
			build: {
				open: true,
				// minify: false,
				// cssMinify: false
				external: {
					autoCDN: true,
					exclusions: ['react-dom']
				}
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
```

## Note

### [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

in `vite dev` mode, the code entry is added as script to target host document.head, code need work between two origins

but the browser will prevent the execution of this script according to the CSP strategy

now just use browser extension [Disable-CSP](https://github.com/lisonge/Disable-CSP)
