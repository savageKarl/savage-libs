import { resolve } from 'node:path'

import { spawn } from 'cross-spawn'
import prompts from 'prompts'

import { packagesRoot, generateFiles } from './utils'

const template = {
	name: '',
	version: '0.0.0',
	description: '',
	miniprogram: 'dist',
	main: 'dist/index.cjs',
	module: 'dist/index.js',
	types: 'dist/index.d.ts',
	files: ['dist'],
	exports: {
		'.': {
			import: './dist/index.js',
			require: './dist/index.cjs'
		}
	},
	buildOptions: {
		format: ['esm', 'cjs'],
		dts: true,
		minify: true
	},
	type: 'module',
	scripts: {},
	keywords: [],
	author: '',
	devDependencies: {},
	dependencies: {}
}

async function genereatePkg() {
	const questions = [
		{
			type: 'text',
			name: 'name',
			message: 'What is package name?',
			validate(input: string) {
				if (input === '') return 'please provide the package name!!!'
				return true
			}
		},
		{
			type: 'text',
			name: 'description',
			message: 'What is package description?'
		}
	] as prompts.PromptObject<string>[]

	const response = await prompts(questions)
	const { name, description } = response
	template.name = name
	template.description = description

	const pkgPath = resolve(packagesRoot, name)
	const srcPath = resolve(pkgPath, 'src')

	const indexFilePath = resolve(srcPath, 'index.ts')
	const pkgJsonPath = resolve(pkgPath, 'package.json')

	generateFiles({
		[pkgJsonPath]: JSON.stringify(template, null, 2),
		[indexFilePath]: ''
	})

	spawn('pnpm readme -t', [name])
}

main()
function main() {
	genereatePkg()
}
