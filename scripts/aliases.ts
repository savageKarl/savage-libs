import { resolve } from 'node:path'

console.log(resolve('packages/vite-plugin-us'))

// console.log(resolve(`packages/${'savage-data-types'}/src/index.ts`))
const entries = {
	'savage-data-types': resolve('packages/savage-data-types/src/index.ts'),
	'savage-electron-ipc': resolve('packages/savage-electron-ipc/src/index.ts'),
	'savage-react-store': resolve('packages/savage-react-store/src/index.ts'),
	'savage-utils': resolve('packages/savage-utils/src/index.ts'),
	'vite-plugin-us': resolve('packages/vite-plugin-us/src')
}

export { entries }
