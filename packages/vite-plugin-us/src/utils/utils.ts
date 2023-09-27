import { resolve } from 'node:path'
import { readFileSync, statSync } from 'node:fs'
import type { ServerResponse } from 'node:http'

import { transformWithEsbuild } from 'vite'

import type { ResolvedConfig, EsbuildTransformOptions } from 'vite'
import type { OutputBundle } from 'rollup'
import type { IPackageJson } from '@ts-type/package-dts'
import type { UsOptions, Mode, Transform } from '../types/types'

export const pkg = (() => {
	let pkg = '{}'
	try {
		pkg = readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
	} catch {}
	return JSON.parse(pkg) as IPackageJson
})()

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

export const resourcePath = 'node_modules/.vite/vite-plugin-us.resource.json'

export function unionRegex(arr: RegExp[]) {
	return new RegExp(
		arr
			.map(r => String(r).replace(/\/|g/g, ''))
			.join('|')
			.replace(/|$/, '')
	)
}

export function inlineSvg(
	resovledConfig: ResolvedConfig,
	code: string,
	id: string
) {
	if (
		resovledConfig.assetsInclude(id) &&
		/\.svg/.test(id) &&
		/__VITE_ASSET__/.test(code)
	) {
		const base64 = readFileSync(/.+?\.svg/.exec(id)?.[0] as string, {
			encoding: 'base64'
		})
		return `export default 'data:image/svg+xml;base64,${base64}'`
	}
	return null
}

/** NPF, `bundle` */
export function removeSvg(bundle: OutputBundle) {
	for (const filename in bundle) {
		if (/\.svg/.test(filename)) Reflect.deleteProperty(bundle, filename)
	}
}

export function injectExternalCssLink(links: string[]) {
	return fnToString(function (links: string[]) {
		window.addEventListener('DOMContentLoaded', () => {
			links.forEach(v => {
				const link = document.createElement('link')
				link.rel = 'stylesheet'
				link.href = v
				document.head.appendChild(link)
			})
		})
	}, links)
}

/** NPF, `usOptions` */
export function addPrefixForName(usOptions: UsOptions, mode: Mode) {
	const name = usOptions.headMetaData.name
	if (usOptions.prefix) usOptions.headMetaData.name = `${mode}: ${name}`
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

export async function fnToDataUrl<T>(fn: (args: T) => unknown, args: T) {
	return (
		'data:application/javascript,' +
		encodeURIComponent(
			(
				await transform({
					minify: true,
					loader: 'js',
					filename: 'temp.js',
					code: fnToString(fn, args)
				})
			).trimEnd()
		)
	)
}

export async function minifyCode(code: string, ext: 'js' | 'css') {
	return await transform({
		minify: true,
		code,
		filename: 'temp.js',
		loader: ext
	})
}
