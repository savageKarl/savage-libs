/**
 * @packageDocumentation
`savage-rollup-command` is a rollup plugin that provides several rollup hooks, introduces the [`del`](https://www.npmjs.com/package/del/v/5.1.0) library, and adds shell command execution.
 
 `savage-rollup-command`是一个`rollup`插件，提供了几个`rollup`钩子，并引入了[`del`](https://www.npmjs.com/package/del/v/5.1.0)库，还增加了`shell`命令执行。

 ## install

::: code-group

```[npm]
npm i savage-rollup-command
```

```[pnpm]
pnpm add savage-rollup-command
```

```[yarn]
yarn add savage-rollup-command
```
:::

## use


`rollup.config.mjs`
```js
import { rollupCommand } from 'savage-rollup-command'

export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	plugins: [
		rollupCommand({
			options(context: IContext, options: InputOptions) {
				console.log(context, options)
				return options
			},
			buildStart(context: IContext) {
				console.log(context)
			},
			buildEnd(context: IContext) {
				// You can delete files here whenever you want
				context.del('./dist/*')
				context.run([
					'npm run test',
					function() {
						console.log('hi,there)
					}
				])
			},
			outputOptions(context: IContext, options: OutputOptions) {
				// or you can print options
				console.log(options)
			},
			renderStart(
				context: IContext,
				outputOptions: OutputOptions,
				inputOptions: InputOptions
			) {
				console.log(context, outputOptions, inputOptions)
			},
			writeBundle(context: IContext, options: OutputOptions, bundle: OutputChunk) {
				console.log(context, options, bundle)
			},
			closeBundle(context: IContext) {
				// You can also run some commands here\
				context.run('npm run test')
			}
		})
	]
}
```
 *
*/
export * from './modules/plugin'
