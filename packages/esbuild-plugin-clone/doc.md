## Usage

use [glob](https://github.com/isaacs/node-glob#readme) within, so can use glob pattern

```ts
import { clone } from 'esbuild-plugin-clone'
(async () => {
  const res = await build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    watch: true,
    outfile: './dist/main.js',
    plugins: [
      copy({
        from: './assets/*',
        to: './dist/tmp-assets',
      }),
    ],
  });
})();
```

### options

```ts
interface Options {
	from: string
	to: string
	moment?: 'onStart' | 'onEnd'
}
```
