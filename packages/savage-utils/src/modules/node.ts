import { existsSync, mkdirSync } from 'node:fs'

import { writeFile } from 'node:fs/promises'

export function normalizePath(path: string) {
	return path.replaceAll('\\', '/')
}

export function generateFiles(pathRecord: Record<string, string>) {
	for (let [path, content] of Object.entries(pathRecord)) {
		path = normalizePath(path)

		const dirs = path
			.split('/')
			.map((v, i, arr) => arr.slice(0, i).join('/'))
			.filter((v, i, arr) => i !== 0 && i !== 1 && i !== arr.length)

		let index = 0

		for (const dir of dirs) {
			const status = existsSync(dir)
			if (status) {
				index = dirs.length
			} else {
				index = dirs.findIndex(v => v === dir)
				break
			}
		}

		if (index !== dirs.length) {
			dirs.slice(index).forEach(path => mkdirSync(path))
		}

		writeFile(path, content, { encoding: 'utf-8' })
	}
}
