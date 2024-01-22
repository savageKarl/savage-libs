import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { normalizePath } from 'savage-utils'
import gb, { type Options } from 'fast-glob'

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

		writeFileSync(path, content, { encoding: 'utf-8' })
	}
}

export interface CopyOptions {
	from: string
	to: string
}

function handlePath(path: string) {
	return normalizePath(path).replace(/\/$/, '')
}

export async function copy(options: CopyOptions) {
	const globOptions: Options = {
		absolute: true,
		dot: true
	}
	options.from = handlePath(options.from)
	options.to = handlePath(options.to)

	try {
		const originFiles = await gb.async(options.from + '/**/*', globOptions)
		const targetFiles = originFiles.map(
			f => options.to + f.replace(options.from, '')
		)
		const fileContentRecord = originFiles
			.map(f => readFileSync(f, { encoding: 'utf-8' }))
			.reduce((x, y, i) => Object.assign(x, { [targetFiles[i]]: y }), {})

		generateFiles(fileContentRecord)
	} catch (e) {
		console.error('copy', e)
	}
}

const { platform } = process

export const isWin = platform === 'win32'
export const isMac = platform === 'darwin'
export const isLinux = platform === 'linux'
