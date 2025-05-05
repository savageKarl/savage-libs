# Rollup-plugin-executer

> A rollup plugin can execute commands or functions on a specified hook.

## Feature

- execute shell commands
- call the functions
- run on special hook

## How to use

```ts
import { executer, run, del } from 'rollup-plugin-executer'

export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	plugins: [
		// single command, the default hook is buildStart
		executer('echo hello,world'),
		executer(function (InputOptions) {
			console.log('hi,there', InputOptions)
		}),

		// mutiple commands
		executer([
			'echo hello,world',
			function (InputOptions) {
				console.log('hi,there', InputOptions)
			}
		]),

		// single options
		executer({
			commands: [
				'echo hello,world',
				function (InputOptions) {
					run('echo hi,there')
					del(['./dist'])
					console.log(InputOptions)
				}
			],
			hook: 'buildStart'
		}),

		// mutiple options
		executer([
			{
				commands: [
					function (InputOptions) {
						run('echo hi,there')
						del(['./dist'])
						console.log(InputOptions)
					}
				],
				hook: 'options'
			},
			{
				commands: [
					function (code, id) {
						run('echo hi,there')
						del(['./dist'])
						console.log(code, id) // [code, id]
					}
				],
				hook: 'transform'
			},
			{
				commands: [
					'echo hello,world',
					function (InputOptions) {
						run('echo hi,there')
						del(['./dist'])
						console.log(InputOptions)
					}
				],
				hook: 'buildStart'
			}
		])
	]
}
```
