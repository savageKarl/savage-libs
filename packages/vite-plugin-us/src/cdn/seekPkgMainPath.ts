import { PkgCDN } from '../types/types'
import { Chain } from '../utils/chain'

let pkg: PkgCDN
let paths: string[]
let mainPathResove: (value: string) => void

export function seekPkgMainPath(_pkg: PkgCDN, _paths: string[]) {
	pkg = _pkg
	paths = _paths
	return new Promise<string>(resolve => (mainPathResove = resolve))
}

const chain = new Chain()

const seekCdnField = chain.turnToNode(function () {
	const field = pkg.unpkg || pkg.jsdelivr
	if (field) return mainPathResove(field)

	return 'nextNode'
})

// const seekUmd
