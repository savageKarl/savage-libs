import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'cross-spawn'
import matter from 'gray-matter'
import glob from 'fast-glob'
import { capitalize, normalizePath } from 'savage-utils'
import { copy, generateFiles } from 'savage-node'
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

async function generateSidebarConfig() {
	const contents = await Promise.all(
		resolvedPkgNames.map(async pkgName => {
			const path = normalizePath(`${packagesRoot}/${pkgName}/docs/sidebar.json`)

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
	const paths = resolvedPkgNames.map(async pkgName => {
		const path = normalizePath(`${docsPath}/packages/${pkgName}/index.md`)
		const pkgJson = getPkgJson(resolve(packagesRoot, pkgName))

		const template = await spliceTemplate(['commonHeader', 'doc'])

		const content = replaceTemplateVariable(template, {
			capitalizeName: capitalize(pkgJson.name),
			description: pkgJson.description,
			name: pkgJson.name
		})

		await generateFiles({ [path]: content })
		return path
	})

	return await Promise.all(paths)
}

async function copyFiles() {
	resolvedPkgNames.forEach(pkgName => {
		const from = `${packagesRoot}/${pkgName}/docs`
		const to = `${docsPath}/packages/${pkgName}`

		copy({ from, to }).catch(err => {
			console.error(err)
		})
	})
}

async function generateRewrites() {
	const paths = resolvedPkgNames
		.map(pkgName => {
			const files = glob.sync(
				normalizePath(`${docsPath}/packages/${pkgName}/**/*`)
			)
			return files.map(f => 'packages' + f.split('packages')[1])
		})
		.flat()
	const rewrites = paths.reduce(
		(x, y) =>
			Object.assign(x, {
				[y]: y.replace('packages/', '').replace('docs/', '')
			}),
		{} as Record<string, string>
	)

	const rewritesFilePath = resolve(docsPath, 'rewrites.json')
	generateFiles({ [rewritesFilePath]: JSON.stringify(rewrites, null, 4) })
}

main()
async function main() {
	const log = createLogger()
	if (!['dev', 'preview', 'build'].includes(mode)) {
		throw new Error(
			`mode must be specified as dev, preview or build, receive ${mode}`
		)
	}

	log.info('Generating documention...')

	await generateRootIndex()
	await generateSidebarConfig()
	await copyFiles()
	await generateIndex()
	await generateRewrites()

	log.success('Documention generate sucessful!')

	const res = spawn('pnpm -F docs run docs:dev')
	res.stdout.on('data', res => console.log(String(res)))
}
