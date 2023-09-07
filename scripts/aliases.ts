// @ts-check
import { resolve } from 'node:path'

console.log(resolve(`packages/${'savage-data-types'}/src/index.ts`))
const entries = {
	'savage-*': 'packages/savage-*/src/index.ts'
}

export { entries }
