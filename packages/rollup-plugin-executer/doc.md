## Feature

- execute shell commands
- call the functions
- run on special hook

## How to use

```ts
import { executer } from 'rollup-plugin-executer'

export default {
	input: 'src/main.js',
	output: {
		file: 'bundle.js',
		format: 'cjs'
	},
	plugins: [
    // single command, the default hook is buildStart
    executer('echo hello,world'),
	  executer(function () {
	  	console.log('hi,there')
	  }),

    // mutiple commands
	  executer([
	  	'echo hello,world',
	  	function () {
	  		console.log('hi,there')
	  	}
	  ]),

    // single options
	  executer({
	  	commands: [
	  		'echo hello,world',
	  		function (ctx) {
	  			ctx.run('echo hi,there')
	  			ctx.del(['./dist'])
	  			console.log(ctx.hookOptions) // [InputOptions]
	  		}
	  	],
	  	hook: 'buildStart'
	  }),

    // mutiple options
    executer([
      {
        commands: [
          function (ctx) {
            ctx.run('echo hi,there')
            ctx.del(['./dist'])
            console.log(ctx.hookOptions) // [InputOptions]
          }
        ],
        hook: 'options'
      },
      {
        commands: [
          function (ctx) {
            ctx.run('echo hi,there')
            ctx.del(['./dist'])
            console.log(ctx.hookOptions) // [code, id]
          }
        ],
        hook: 'transform'
      },
      {
        commands: [
          'echo hello,world',
          function (ctx) {
            ctx.run('echo hi,there')
            ctx.del(['./dist'])
            console.log(ctx.hookOptions) // [InputOptions]
          }
        ],
        hook: 'buildStart'
      }
    ])
	]
}
```
