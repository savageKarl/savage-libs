import { PkgCDN } from '../types/types'

import { regPkgFileNameRules, regPkgFolderRules } from './regexRules'

export function seekPkgMainPath(pkg: PkgCDN, paths: string[]) {
	const pkgName = pkg.name
	const regFullPathRules: string[] = []
	const field = pkg.unpkg || pkg.jsdelivr

	// the order is important, don't change it randomly
	if (field) regFullPathRules.push(field.replace('.', ''))

	regPkgFolderRules.forEach(folder => {
		regFullPathRules.push(...splicePath({ folder, pkgName }))

		regPkgFileNameRules.forEach(name => {
			regFullPathRules.push(...splicePath({ folder, pkgName, name }))
		})
		regFullPathRules.push(...splicePath({ folder, pkgName: 'index' }))
	})
	regFullPathRules.push(...splicePath({ pkgName }))
	regFullPathRules.push(...splicePath({ pkgName: 'index' }))

	const mainField = pkg.main
	if (mainField) regFullPathRules.push(mainField.replace('.', ''))

	return regFullPathRules.filter(v => paths.includes(v))[0]
}

function splicePath(options: {
	pkgName: string
	name?: string
	folder?: string
}) {
	const splitArr: string[] = []
	const twoPaths: string[] = []

	const { name, folder, pkgName } = options

	if (folder) splitArr.push(`/${folder}`)
	splitArr.push(`/${pkgName}`)
	if (name) splitArr.push(`.${name}`)
	splitArr.push('.min.js')
	twoPaths.push(splitArr.join(''))

	splitArr.pop()
	splitArr.push('.js')
	twoPaths.push(splitArr.join(''))

	return twoPaths
}
