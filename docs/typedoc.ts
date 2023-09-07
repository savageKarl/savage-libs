import { Application, TSConfigReader } from 'typedoc'
import fs from 'fs'
import { resolve, dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

const packages = resolve(__dirname, '..', 'packages')

const targets = fs.readdirSync(packages).filter(f => {
	const p = resolve(packages, f)
	if (!fs.statSync(p).isDirectory()) return false

	const pkg = require(`../packages/${f}/package.json`)
	if (pkg.private && !pkg.buildOptions) return false
	return true
})

async function buildAll(targets: string[]) {
	await queue(0, targets, main)
}

async function queue(
	delay: number,
	targets: string[],
	fn: (...args: any) => void
) {
	targets.forEach((target, i) => {
		const timer = setTimeout(() => {
			fn(target)
			clearTimeout(timer)
		}, i * delay)
	})
}

function rootPath(...args: any) {
	return resolve(__dirname, '..', ...args)
}

let outputFolderName = ''

buildAll(targets)

function getFullpath(target: string) {
	return resolve(packages, target, 'src/index.ts')
}

// 主函数
async function main(target: string) {
	outputFolderName = target
	// 初始化 TypeDoc
	const app = new Application()

	// 使 TypeDoc 拥有读取 tsconfig.json 的能力
	app.options.addReader(new TSConfigReader())

	const entry = getFullpath(target)

	// 指定 TypeDoc 配置项
	app.bootstrap({
		entryPoints: [entry],
		tsconfig: rootPath('tsconfig.json')
		// disableSources: true
	} as any)

	const project = app.convert()

	if (project) {
		// 输出产物位置
		const outputDir = join(__dirname, target)

		// 	// 生成文档内容
		await app.generateDocs(project, outputDir)

		// 生成文档数据结构
		const jsonDir = join(outputDir, 'documentation.json')
		await app.generateJson(project, jsonDir)

		// 解析数据结构，生成 VitePress Config 所需的 Sidebar 配置项
		// await joinConfig(jsonDir)
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

async function joinConfig(jsonDir: string) {
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
		join(__dirname, 'apidocConfig.json'),
		JSON.stringify(result, null, 4),
		'utf8'
	)
}

function transformModuleName(name: string) {
	return name
	// return name.replace(/\//g, '_')
}

function getModulePath(name: string) {
	return join('/dist/modules', `${transformModuleName(name)}`).replace(
		/\\/g,
		'/'
	)
}

function getVariablesPath(moduleName: string, typeName = '') {
	const name = typeName
		? `${transformModuleName(moduleName)}.${typeName}`
		: transformModuleName(moduleName)
	return join(`/${outputFolderName}/variables`, `${name}`).replace(/\\/g, `/`)
}

function getClassPath(moduleName: string, className = '') {
	const name = className
		? `${transformModuleName(moduleName)}.${className}`
		: transformModuleName(moduleName)
	return join(`/${outputFolderName}/classes`, `${name}`).replace(/\\/g, `/`)
}

function getInterfacePath(moduleName: string, interfaceName = '') {
	const name = interfaceName
		? `${transformModuleName(moduleName)}.${interfaceName}`
		: transformModuleName(moduleName)
	return join(`/${outputFolderName}/interfaces`, `${name}`).replace(/\\/g, `/`)
}

function getTypePath(moduleName: string, typeName = '') {
	const name = typeName
		? `${transformModuleName(moduleName)}.${typeName}`
		: transformModuleName(moduleName)
	return join(`/${outputFolderName}/types`, `${name}`).replace(/\\/g, `/`)
}

function getFunctionPath(moduleName: string, functionName = '') {
	const name = functionName
		? `${transformModuleName(moduleName)}.${functionName}`
		: transformModuleName(moduleName)
	return join(`/${outputFolderName}/functions`, `${name}`).replace(/\\/g, `/`)
}
