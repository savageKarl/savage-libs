import { resolve } from 'node:path'

import { pkgNames } from './utils'

const alias = pkgNames.reduce(
	(preV, curV) =>
		Object.assign(preV, { [curV]: resolve(`packages/${curV}/src`) }),
	{}
)

export { alias }
