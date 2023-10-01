import { PkgCDN, SpliceSeekPathOptions } from '../types/types'

import { regPkgFileNameRules, regPkgFolderRules } from './regexRules'

class SeekCdnPath {
	private splicePath(options: SpliceSeekPathOptions) {
		const splitArr: string[] = []

		const { name, folder, pkgName } = options

		if (folder) splitArr.push(`/${folder}`)
		if (pkgName) splitArr.push(`/${pkgName}`)
		if (name) splitArr.push(pkgName ? `.${name}` : `/${name}`)

		splitArr.push('.js')
		return splitArr.join('')
	}

	seek(pkg: PkgCDN, paths: string[]) {
		const pkgName = pkg.name
		const regFullPathRules: string[] = []

		// the order is important, don't change it randomly
		regPkgFolderRules.forEach(folder => {
			regFullPathRules.push(this.splicePath({ folder, pkgName }))

			regPkgFileNameRules.forEach(name => {
				regFullPathRules.push(this.splicePath({ folder, pkgName, name }))
				regFullPathRules.push(this.splicePath({ folder, pkgName }))
				regFullPathRules.push(this.splicePath({ pkgName, name }))
			})
		})
		regFullPathRules.push(this.splicePath({ pkgName }))

		const cdnField = pkg.unpkg || pkg.jsdelivr

		if (cdnField) regFullPathRules.push(`/${cdnField}`)
		const mainField = pkg.main
		if (mainField) regFullPathRules.push(mainField.replace('.', ''))

		return regFullPathRules.filter(v => paths.includes(v))[0] || ''
	}
}

export const seekCdnPath = new SeekCdnPath()
