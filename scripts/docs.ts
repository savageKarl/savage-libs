/*
 * don't update any typedoc version,
 * cause new version is not compatible with the plugin,
 * alwayls throw a error, remember!!!
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { spawn } from 'cross-spawn'

import { Application, TSConfigReader } from 'typedoc'

import { queueExcution, mergeDeep } from 'savage-utils'
import styleLog from 'picox'

import {
	getFolderByPath,
	getFullpath,
	resolveCliOption,
	resolveTargetPkgNames
} from './utils'

const docsPath = resolve(process.cwd(), 'docs')

const { targetPkgNames, all, mode } = resolveCliOption(process)

const resolvedPkgNames = resolveTargetPkgNames(targetPkgNames, all)

interface ISidebarItem {
	text: string
	link?: string
	items?: ISidebarItem[]
}

type SideBarConfig = Record<
	string,
	{
		base: string
		items: ISidebarItem[]
	}
>

function generateSidebarConfig() {
	const sidebarConfig: SideBarConfig = {}

	resolvedPkgNames.forEach(pkgName => {
		const base = `/${pkgName}/`
		sidebarConfig[base] = {
			base: `/${pkgName}/`,
			items: [
				{
					text: `${pkgName}`,
					link: 'modules'
				}
			]
		}

		const folders = getFolderByPath(resolve(docsPath, pkgName))

		folders.forEach(folder => {
			const type: ISidebarItem = {
				text: folder,
				items: []
			}

			const fullpath = resolve(docsPath, pkgName, folder)

			readdirSync(fullpath).forEach(f => {
				const filename = f.replace(/\.md/g, '')
				type.items?.push({
					text: filename,
					link: `${folder}/${filename}`
				})
			})
			sidebarConfig[base].items.push(type)
		})
	})

	const filePath = resolve(docsPath, 'sidebar.json')

	const content = readFileSync(filePath, { encoding: 'utf-8' })
	writeFileSync(
		filePath,
		JSON.stringify(mergeDeep(JSON.parse(content), sidebarConfig), null, 4)
	)
}

async function generateDoc(pkgName: string) {
	console.log(styleLog.blue(`Generating documents for package ${pkgName}...`))

	const app = new Application()

	app.options.addReader(new TSConfigReader())

	const entry = getFullpath(pkgName)

	app.bootstrap({
		entryPoints: [entry],
		plugin: ['typedoc-plugin-markdown'],
		allReflectionsHaveOwnDocument: true,
		hideBreadcrumbs: true,
		disableSources: true,
		skipErrorChecking: true,
		logLevel: 'Error',
		excludeInternal: true
	} as object)

	const project = app.convert()
	// debugger
	if (project) {
		const outputDir = resolve(docsPath, pkgName)
		await app.generateDocs(project, outputDir)

		console.log(
			styleLog.green(
				`Documentation generated at ${outputDir} for package ${pkgName}.`
			)
		)
	}
}

main()
async function main() {
	if (!['dev', 'preview', 'build'].includes(mode)) {
		throw new Error(
			`mode must be specified as dev, preview or build, receive ${mode}`
		)
	}

	const tasks = resolvedPkgNames.map(name => () => generateDoc(name))
	// it must be queued, otherwise the typedoc-plugin-markdown will throw error,
	await queueExcution(tasks)
	generateSidebarConfig()

	const res = spawn('vitepress', [mode, './docs'])
	res.stdout.on('data', res => console.log(String(res)))
}
