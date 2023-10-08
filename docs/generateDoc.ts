/*
 * don't update any typedoc version,
 * cause new version alwayls throw a error, remember!!!
 */
import { Application, TSConfigReader } from 'typedoc'
import fs from 'fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { pkgNames, getFolderByPath } from '../scripts/utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const packages = resolve(__dirname, '..', 'packages')

async function main() {
	await buildAll(pkgNames)
	generateSidebarConfig()
}

main()

type SideBarConfig = Record<
	string,
	{
		base: string
		items: ISidebarItem[]
	}
>

interface ISidebarItem {
	text: string
	link?: string
	items?: ISidebarItem[]
}

function generateSidebarConfig() {
	const sidebarConfig: SideBarConfig = {}

	pkgNames.forEach(t => {
		const base = `/${t}/`
		sidebarConfig[base] = {
			base: `/${t}/`,
			items: [
				{
					text: `${t}`,
					link: 'modules'
				}
			]
		}

		const folders = getFolderByPath(resolve(__dirname, t))
		folders.forEach(folder => {
			const type: ISidebarItem = {
				text: folder,
				items: []
			}

			const fullpath = resolve(__dirname, t, folder)

			fs.readdirSync(fullpath).forEach(f => {
				const filename = f.replace(/\.md/g, '')
				type.items?.push({
					text: filename,
					link: `${folder}/${filename}`
				})
			})
			sidebarConfig[base].items.push(type)
		})
	})

	const filename = 'sidebar.json'
	fs.writeFileSync(resolve(__dirname, filename), JSON.stringify(sidebarConfig))
}

function getFilesSync(folerPath: string) {
	const files: string[] = []
	fs.readdirSync(folerPath).forEach(f => {
		const fullpath = resolve(folerPath, f)
		const stat = fs.statSync(fullpath)
		if (!stat.isDirectory()) {
			files.push(fullpath)
		} else {
			files.push(...getFilesSync(fullpath))
		}
	})

	return files
}

async function buildAll(targets: string[]) {
	const tasks: (() => Promise<boolean>)[] = []
	targets.forEach(t =>
		tasks.push(async () => {
			await generateDoc(t)
			return true
		})
	)

	// it must be queued, otherwise the typedoc-plugin-markdown will throw error,
	// what the hell.
	let task: () => Promise<any>

	while (true) {
		task = tasks.pop() || (() => Promise.resolve(true))
		await task()
		if (tasks.length === 0) break
	}
}

function rootPath(...args: any) {
	return resolve(__dirname, '..', ...args)
}

let outputFolderName = ''

function getFullpath(target: string) {
	return resolve(packages, target, 'src/index.ts')
}

async function generateDoc(target: string) {
	// outputFolderName = target
	const app = new Application()

	app.options.addReader(new TSConfigReader())
	const entry = getFullpath(target)

	app.bootstrap({
		entryPoints: [entry],
		tsconfig: rootPath('tsconfig.json'),
		plugin: ['typedoc-plugin-markdown'],
		allReflectionsHaveOwnDocument: true,
		hideBreadcrumbs: true,
		disableSources: true
	} as any)

	const project = app.convert()

	if (project) {
		const outputDir = resolve(__dirname, target)
		await app.generateDocs(project, outputDir)
		// const jsonDir = resolve(outputDir, 'documentation.json')
		// await app.generateJson(project, jsonDir)
	}
}

// main().catch(console.error)

interface IMoudle {
	kindString: string
	name: string
	children: any[]
}

function removeSrcContent(path: string) {
	const buffer = fs.readFileSync(path, 'utf8')
	fs.writeFileSync(
		path,
		buffer
			.toString()
			.replace(/\/src"/g, '"')
			.replace(/\/src|_src/g, ''),
		'utf8'
	)
}

function removeSrcPath() {
	fs.readdirSync(resolve('..', 'docs', outputFolderName)).forEach(f => {
		const folder = resolve('..', `docs/${outputFolderName}/${f}`)
		if (fs.statSync(resolve(folder)).isDirectory()) {
			fs.readdirSync(folder).forEach(f => {
				const file = resolve(folder, f)
				fs.rename(file, file.replace(/_src/g, ''), () => null)
				removeSrcContent(file)
			})
		} else {
			console.log(folder)
			removeSrcContent(folder)
		}
	})
}

async function resolveConfig(jsonDir: string) {
	const result: any = {}

	// 读取文档数据结构的 json 文件
	const buffer = await fs.promises.readFile(jsonDir, 'utf8')
	const data = JSON.parse(buffer.toString())
	if (!data.children || data.children.length <= 0) {
		return
	}

	data.children.forEach((module: IMoudle) => {
		const name = `/${module.name.replace(/\/src/, '')}/`

		result[name] = {
			base: name,
			items: []
		}

		module.children.forEach(item => {
			const actionsType = {
				Variable() {
					result[name].items.push({
						text: `${item.name}`,
						link: getVariablesPath(item.name)
					})
				},
				Class() {
					result[name].items.push({
						text: `${item.name}`,
						link: getClassPath(name, item.name)
					})
				},
				Interface() {
					result[name].items.push({
						text: `${item.name}`,
						link: getInterfacePath(name, item.name)
					})
				},
				'Type alias': () => {
					result[name].items.push({
						text: `${item.name}`,
						link: getTypePath(name)
					})
				},
				Function() {
					result[name].items.push({
						text: `${item.name}`,
						link: getFunctionPath(name)
					})
				}
			} as any
			actionsType[item.kindString]()
		})
	})

	// 转换成的导航数据输出到 doc/apidocConfig.json
	await fs.promises.writeFile(
		resolve(__dirname, 'apidocConfig.json'),
		JSON.stringify(result, null, 4),
		'utf8'
	)
}

function transformModuleName(name: string) {
	return name
	// return name.replace(/\//g, '_')
}

function getModulePath(name: string) {
	return resolve('/dist/modules', `${transformModuleName(name)}`).replace(
		/\\/g,
		'/'
	)
}

function getVariablesPath(moduleName: string, typeName = '') {
	const name = typeName
		? `${transformModuleName(moduleName)}.${typeName}`
		: transformModuleName(moduleName)
	return resolve(`/${outputFolderName}/variables`, `${name}`).replace(
		/\\/g,
		`/`
	)
}

function getClassPath(moduleName: string, className = '') {
	const name = className
		? `${transformModuleName(moduleName)}.${className}`
		: transformModuleName(moduleName)
	return resolve(`/${outputFolderName}/classes`, `${name}`).replace(/\\/g, `/`)
}

function getInterfacePath(moduleName: string, interfaceName = '') {
	const name = interfaceName
		? `${transformModuleName(moduleName)}.${interfaceName}`
		: transformModuleName(moduleName)
	return resolve(`/${outputFolderName}/interfaces`, `${name}`).replace(
		/\\/g,
		`/`
	)
}

function getTypePath(moduleName: string, typeName = '') {
	const name = typeName
		? `${transformModuleName(moduleName)}.${typeName}`
		: transformModuleName(moduleName)
	return resolve(`/${outputFolderName}/types`, `${name}`).replace(/\\/g, `/`)
}

function getFunctionPath(moduleName: string, functionName = '') {
	const name = functionName
		? `${transformModuleName(moduleName)}.${functionName}`
		: transformModuleName(moduleName)
	return resolve(`/${outputFolderName}/functions`, `${name}`).replace(
		/\\/g,
		`/`
	)
}
