import { resolve } from 'node:path'

// console.log(resolve(`packages/${'savage-data-types'}/src/index.ts`))
const entries = {
	// 'savage-*': '../packages/savage-*/src/index.ts'
	'savage*': resolve('packages/savage-/src/index.ts'),
	'savage-data-types': resolve('packages/savage-data-types/src/index.ts'),
	'savage-electron-ipc': resolve('packages/savage-electron-ipc/src/index.ts'),
	'savage-react-store': resolve('packages/savage-react-store/src/index.ts'),
	'savage-utils': resolve('packages/savage-utils/src/index.ts')
}

export { entries }
