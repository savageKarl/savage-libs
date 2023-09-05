// This is a plugin that lets you roll-up your .d.ts definition files.
// https://www.npmjs.com/package/rollup-plugin-dts
import { rollupCommand } from 'savage-rollup-command'
import { dts } from 'rollup-plugin-dts'

export const dtsBundleConfig = () => {
	return {
		input: './dist/index.d.ts',
		output: [{ file: 'dist/main.d.ts', format: 'es' }],
		plugins: [
			// When using this plug-in in rollup monitoring mode, input file cannot be change or delete, otherwise an error will be reported. This is a bug that cannot be solved.
			// so i use the nodemon to watch target file
			dts(),
			rollupCommand({
				closeBundle(ctx) {
					ctx.del([
						'dist/*',
						'!dist/index.cjs',
						'!dist/index.mjs',
						'!dist/main.d.ts',
						'!dist/index.cjs.map',
						'!dist/index.mjs.map'
					])
				}
			})
		]
	}
}
