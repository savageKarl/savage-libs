// @ts-check

// Using esbuild for faster dev builds.
// We are still using Rollup for production builds because it generates
// smaller files w/ better tree-shaking.

import esbuild from 'esbuild'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import minimist from 'minimist'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'
import chalk from 'chalk'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const args = minimist(process.argv.slice(2))
const target = args._[0]
const format = args.f || 'cjs'
const inlineDeps = args.i || args.inline

if (!target || !format) {
	// console.log
	throw new Error(
		`
${chalk.bgRed.white(' ERROR ')} ${chalk.red(
			'The target package name must be passed!'
		)}

${chalk.bgGreen.white(' Correct example ')} ${chalk.bgGrey(
			' pnpm run dev utils '
		)}
		`
	)
}

const pkg = require(`../packages/${target}/package.json`)

const outputFormat = format === 'cjs' ? 'cjs' : 'esm'

const postfix = format

const outfile = resolve(
	__dirname,
	`../packages/${target}/dist/${target}.${postfix}.js`
)
const relativeOutfile = relative(process.cwd(), outfile)

// resolve externals
let external = []
if (!inlineDeps) {
	// cjs & esm-bundler: external all deps
	if (format === 'cjs' || format.includes('esm-bundler')) {
		external = [
			...external,
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {})
		]
	}
}

const plugins = [
	{
		name: 'log-rebuild',
		setup(build) {
			build.onEnd(() => {
				console.log(`built: ${relativeOutfile}`)
			})
		}
	}
]

if (format === 'cjs' || pkg.buildOptions?.enableNonBrowserBranches) {
	plugins.push(polyfillNode())
}

esbuild
	.context({
		entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
		outfile,
		bundle: true,
		external,
		sourcemap: true,
		format: outputFormat,
		globalName: pkg.buildOptions?.name,
		platform: format === 'cjs' ? 'node' : 'browser',
		plugins,
		define: {}
	})
	.then(ctx => ctx.watch())
