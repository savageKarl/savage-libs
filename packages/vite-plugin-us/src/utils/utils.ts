import { readFileSync, statSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ServerResponse } from 'node:http'

import { transformWithEsbuild } from 'vite'
import type { ResolvedConfig, EsbuildTransformOptions } from 'vite'
import type { OutputBundle } from 'rollup'
import { isObject, isArray } from 'savage-types'

import type { UsOptions, Mode, Transform } from './types'
import { logger } from './logger'

export const existFile = (path: string) => {
	try {
		return statSync(path).isFile()
	} catch {
		return false
	}
}

/** NPF, `res` */
export function setResHeader(
	res: ServerResponse,
	headers: Record<string, string>
) {
	for (const h in headers) {
		res.setHeader(h, headers[h])
	}
}

export function rmValueFromArr(arr: string[], values: string[]) {
	return [...arr].filter(v => !values.includes(v))
}

export function fnToString<T>(fn: (args: T) => unknown, args: T) {
	return `;(${fn})(${JSON.stringify(args)});`
}

export function unionRegex(arr: RegExp[], flag = 'g') {
	return new RegExp(
		arr.map(r => String(r).replace(/^\/|\/$|g$/g, '')).join('|'),
		flag
	)
}

// export function inlineSvg(
// 	resovledConfig: ResolvedConfig,
// 	code: string,
// 	id: string
// ) {
// 	if (
// 		resovledConfig.assetsInclude(id) &&
// 		/\.svg/.test(id) &&
// 		/__VITE_ASSET__/.test(code)
// 	) {
// 		const base64 = readFileSync(/.+?\.svg/.exec(id)?.[0] as string, {
// 			encoding: 'base64'
// 		})
// 		return `export default 'data:image/svg+xml;base64,${base64}'`
// 	}
// 	return null
// }

/** NPF, `bundle` */
// export function removeSvg(bundle: OutputBundle) {
// 	for (const filename in bundle) {
// 		if (/\.svg/.test(filename)) Reflect.deleteProperty(bundle, filename)
// 	}
// }

interface InjectCssOptions {
	links: string[]
	inline?: string
	minify: boolean
	pluginName: string
}

export async function injectCss(options: InjectCssOptions) {
	const code = fnToString((options: InjectCssOptions) => {
		window.addEventListener('DOMContentLoaded', () => {
			options.links.forEach(v => {
				const link = document.createElement('link')
				link.rel = 'stylesheet'
				link.href = v
				document.head.appendChild(link)
			})

			if (options.inline) {
				const style = document.createElement('style')
				style.dataset.vitePluginId = options.pluginName
				style.textContent = options.inline
				document.head.appendChild(style)
			}
		})
	}, options)
	return options.minify ? await minifyCode(code, 'js') : code
}

/** NPF, `usOptions` */
export function addPrefixForName(usOptions: UsOptions, mode: Mode) {
	const name = usOptions.metaData.name
	if (usOptions.prefix) usOptions.metaData.name = `${mode}: ${name}`
}

export function camelCaseToHyphen(name: string) {
	return name.replace(/[A-Z]/g, match => {
		return `-${match.toLocaleLowerCase()}`
	})
}

export function padEndWithSpace(str: string, maxLength: number) {
	return str.padEnd(maxLength, ' ')
}

export async function transform(
	{ minify, code, filename, loader }: Transform,
	transformOptions?: EsbuildTransformOptions
) {
	return (
		await transformWithEsbuild(
			code,
			filename,
			Object.assign(
				{
					minify,
					loader,
					sourcemap: false,
					legalComments: 'none'
				},
				transformOptions
			)
		)
	).code
}

export function generateJsDataUrlByCode(code: string) {
	return 'data:application/javascript,' + encodeURIComponent(code)
}

export async function minifyCode(code: string, ext: 'js' | 'css') {
	return await transform({
		minify: true,
		code,
		filename: 'temp.js',
		loader: ext
	})
}

export function getViteConfigPath() {
	let viteConfigPath = ''
	const viteConfigTsPath = resolve(process.cwd(), 'vite.config.ts')
	const viteConfigJsPath = resolve(process.cwd(), 'vite.config.js')

	if (existsSync(viteConfigTsPath)) {
		viteConfigPath = viteConfigTsPath
	} else {
		viteConfigPath = viteConfigJsPath
	}
	return viteConfigPath
}

export function hyphenToCamelCase(name: string) {
	return name
		.split('-')
		.map((v, i) => {
			return i > 0
				? v
						.split('')
						.map((v, i) => (i === 0 ? v.toUpperCase() : v))
						.join('')
				: v
		})
		.join('')
}

export function conditionLog(
	target: Record<string, unknown> | unknown[],
	trueMsg: string | Record<string, unknown> | unknown[],
	falseMsg?: string | Record<string, unknown> | unknown[]
) {
	const status = isObjectHasValue(target)

	const handleText = (v: typeof trueMsg) => {
		return isArray(v) || isObject(v) ? JSON.stringify(v, null, 4) : v
	}

	if (status) {
		logger.info(handleText(trueMsg))
	} else {
		falseMsg && logger.info(handleText(falseMsg))
	}

	return status
}

export function isObjectHasValue(target: Record<string, unknown> | unknown[]) {
	const keysLength = Object.keys(target).length

	return keysLength > 0
}

export function removeCommentFromCode(code: string) {
	const regSingleLine = /\/\/\s+[\s\S]+?\n/
	const regMutiline = /\/\*[\s\S]+?\*\//

	return code.replace(unionRegex([regSingleLine, regMutiline]), '')
}

export function getPkgNameByPath(path: string) {
	let pkgNmae: string
	const splitArr = path.split('/')
	if (/^@/.test(path)) {
		pkgNmae = [splitArr[0], splitArr[1]].join('/')
	} else {
		pkgNmae = splitArr[0]
	}

	return pkgNmae
}
