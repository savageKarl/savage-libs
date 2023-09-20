import { resolve } from 'node:path'
import { readFileSync, statSync } from 'node:fs'
import type { ServerResponse } from 'node:http'

import type { ResolvedConfig } from 'vite'
import type { OutputBundle } from 'rollup'
import type { IPackageJson } from '@ts-type/package-dts'

import { getSingle } from 'savage-utils'

export const getPkg = getSingle(() => {
	let pkg = '{}'
	try {
		pkg = readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
	} catch {}
	return JSON.parse(pkg) as IPackageJson
})

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

export function funcToString<T>(fn: (args: T) => unknown, args: T) {
	return `;(${fn})(${JSON.stringify(args)});`
}

/** NPF, `ids` */
export function collectCssDependencies(id: string, ids?: Set<string>) {
	if (/node_modules/.test(id) && /css$/.test(id)) {
		if (ids) {
			ids.add(id)
			return null
		} else {
			return ''
		}
	}
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
export function removeSvgBundle(bundle: OutputBundle) {
	for (const filename in bundle) {
		if (/\.svg/.test(filename)) Reflect.deleteProperty(bundle, filename)
	}
}

export function injectExternalCssLink(links: string[]) {
	return funcToString(function (links: string[]) {
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
