import fs from 'node:fs/promises'

export function createUsContainer() {
	const usContainer = document.createElement('div')
	usContainer.id = 'usContainer'
	document.body.appendChild(usContainer)
	return usContainer
}

export const existFile = async (path: string) => {
	try {
		return (await fs.stat(path)).isFile()
	} catch {
		return false
	}
}
