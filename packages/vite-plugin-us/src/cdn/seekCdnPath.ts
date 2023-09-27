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
		const field = pkg.unpkg || pkg.jsdelivr

		// the order is important, don't change it randomly
		if (field) regFullPathRules.push(field.replace('.', ''))

		regPkgFolderRules.forEach(folder => {
			regFullPathRules.push(this.splicePath({ folder, pkgName }))

			regPkgFileNameRules.forEach(name => {
				regFullPathRules.push(this.splicePath({ folder, pkgName, name }))
				regFullPathRules.push(this.splicePath({ folder, name }))
				regFullPathRules.push(this.splicePath({ name }))
			})
		})
		regFullPathRules.push(this.splicePath({ pkgName }))

		const mainField = pkg.main
		if (mainField) regFullPathRules.push(mainField.replace('.', ''))

		return regFullPathRules.filter(v => paths.includes(v))[0] || ''
	}
}

export const seekCdnPath = new SeekCdnPath()
