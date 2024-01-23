import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'cross-spawn'
import matter from 'gray-matter'
import chokidar from 'chokidar'
import glob from 'fast-glob'
import { capitalize, normalizePath, debounce } from 'savage-utils'
import { generateFiles } from 'savage-node'
import { createLogger } from 'savage-log'
import {
	resolveCliOption,
	resolveTargetPkgNames,
	packagesRoot,
	replaceTemplateVariable,
	getPkgJson,
	spliceTemplate,
	projectRoot
} from './utils'

const docsPath = resolve(process.cwd(), 'docs')
const { targetPkgNames, all, mode } = resolveCliOption(process)
const resolvedPkgNames = resolveTargetPkgNames(targetPkgNames, all)
const log = createLogger({ label: 'scripts/doc' })

async function generateSidebarConfig() {
	const contents = await Promise.all(
		resolvedPkgNames.map(async pkgName => {
			const path = normalizePath(`${docsPath}/packages/${pkgName}/sidebar.json`)

			return readFileSync(path, { encoding: 'utf-8' })
		})
	)

	const sidebarFilePath = normalizePath(`${docsPath}/sidebar.json`)
	const content = contents
		.map(v => JSON.parse(v))
		.reduce((x, y) => Object.assign(x, y), {} as Record<string, string>)

	generateFiles({ [sidebarFilePath]: JSON.stringify(content, null, 4) })

	return contents
}

async function generateRootIndex() {
	try {
		const template = {
			layout: 'home',
			hero: {
				name: 'Documentions',
				image: {
					src: '/logo.png',
					alt: 'VitePress'
				}
			},
			features: [] as any
		}
		const pkgs = resolvedPkgNames.map(name => {
			return getPkgJson(resolve(packagesRoot, name))
		})
		template.features = pkgs.map(pkg => ({
			title: pkg.name,
			details: pkg.description,
			link: `/${pkg.name}/index`,
			linkText: 'go on'
		}))

		const content = matter.stringify('', template)
		const indexPath = resolve(projectRoot, 'docs', 'index.md')
		generateFiles({ [indexPath]: content })
	} catch (e) {
		console.error('generateRootIndex', e)
	}
}

async function generateIndex() {
	async function handle(path: string, pkgName: string) {
		const pkgJson = getPkgJson(resolve(packagesRoot, pkgName))
		const template = await spliceTemplate(['commonHeader', 'doc'])

		const content = replaceTemplateVariable(template, {
			capitalizeName: capitalize(pkgJson.name),
			description: pkgJson.description,
			name: pkgJson.name,
			content: readFileSync(path, { encoding: 'utf-8' })
		})
		generateFiles({ [path.replace('doc.md', 'index.md')]: content })
	}

	const paths = await Promise.all(
		resolvedPkgNames.map(async pkgName => {
			const path = normalizePath(`${docsPath}/packages/${pkgName}/doc.md`)
			handle(path, pkgName)
			return path
		})
	)

	if (mode !== 'dev') return
	chokidar.watch(paths).on('change', async path => {
		path = normalizePath(path)
		const splitArr = path.split('/')
		const pkgName = splitArr[splitArr.length - 2]
		log.info(`${normalizePath(path)} has changed!`)
		handle(path, pkgName)
	})

	return await Promise.all(paths)
}

async function generateRewrites() {
	const rewritesFilePath = resolve(docsPath, 'rewrites.json')
	generateFiles({ [rewritesFilePath]: '{}' })

	const isNotMarkdownFile = (p: string) => !/[\w\d-]+\.md$/.test(p)
	const isDocFile = (p: string) => /doc.*?\.md$/.test(p.split('/').reverse()[0])
	const getRewrites = (paths: string[]) =>
		paths
			.map(f => 'packages' + f.split('packages')[1])
			.reduce(
				(x, y) =>
					Object.assign(x, {
						[y]: y.replace('packages/', '')
					}),
				{} as Record<string, string>
			)

	if (mode === 'build') {
		const paths = (
			await glob.async(
				normalizePath(resolve(docsPath, 'packages', '**', '*.md'))
			)
		).filter(p => !isDocFile(p))

		const rewrites = getRewrites(paths)
		generateFiles({ [rewritesFilePath]: JSON.stringify(rewrites, null, 4) })
	}

	if (mode !== 'dev') return undefined
	const watcher = chokidar.watch(normalizePath(`${docsPath}/packages`))

	const stack: string[] = []

	const addRewrites = debounce(() => {
		const paths = stack.slice().map(f => normalizePath(f))
		stack.length = 0

		const rewrites = getRewrites(paths)

		const pathRecord = JSON.parse(
			readFileSync(rewritesFilePath, { encoding: 'utf-8' }) || '{}'
		) as Record<string, string>

		const content = JSON.stringify(Object.assign(rewrites, pathRecord), null, 4)
		generateFiles({ [rewritesFilePath]: content })
	}, 500)

	watcher.on('add', async path => {
		path = normalizePath(path)

		if (isNotMarkdownFile(path) || isDocFile(path)) return
		stack.push(path)
		addRewrites()
	})

	watcher.on('unlink', path => {
		if (isNotMarkdownFile(path)) return undefined

		const shortPath = 'packages' + normalizePath(path).split('packages')[1]
		const pathRecord = JSON.parse(
			readFileSync(rewritesFilePath, { encoding: 'utf-8' })
		) as Record<string, string>

		Reflect.deleteProperty(pathRecord, shortPath)
		generateFiles({
			[rewritesFilePath]: JSON.stringify(pathRecord, null, 4)
		})
	})
}

main()
async function main() {
	if (!['dev', 'preview', 'build'].includes(mode)) {
		log.error(
			'mode must be specified as dev, preview or build, receive',
			`"${mode}"`
		)
		process.exit()
	}

	await generateRootIndex()
	await generateSidebarConfig()
	await generateIndex()
	await generateRewrites()

	const res = spawn('pnpm', ['-F', 'docs', `docs:${mode}`])
	res.stdout.on('data', res => console.log(String(res)))

	res.stderr.on('error', err => {
		log.error('command execute error', JSON.stringify(err, null, 4))
	})

	res.on('error', err => {
		log.error('command not found error', JSON.stringify(err, null, 4))
	})
}
