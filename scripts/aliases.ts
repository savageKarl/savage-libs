import { resolve } from 'node:path'

console.log(resolve('packages/vite-plugin-us'))

// console.log(resolve(`packages/${'savage-types'}/src/index.ts`))
const entries = {
	'savage-types': resolve('packages/savage-types/src/index.ts'),
	'elec-ipc': resolve('packages/elec-ipc/src/index.ts'),
	'savage-react-store': resolve('packages/savage-react-store/src/index.ts'),
	'savage-utils': resolve('packages/savage-utils/src/index.ts'),
	'vite-plugin-us': resolve('packages/vite-plugin-us/src')
}

export { entries }
