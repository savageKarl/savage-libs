# Esbuild-plugin-clone

> copy dirs and files.

## Installtion

::: code-group

```[npm]
npm i esbuild-plugin-clone
```

```[pnpm]
pnpm add esbuild-plugin-clone
```

```[yarn]
yarn add esbuild-plugin-clone
```

:::

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


# Issues

Please let me know if there are any issues, click this [link](https://github.com/savage181855/savage-libs/issues).
