# Esbuild-plugin-umd

> A esbuild plugin for building UMD module.

## Installtion

::: code-group

```[npm]
npm i esbuild-plugin-umd
```

```[pnpm]
pnpm add esbuild-plugin-umd
```

```[yarn]
yarn add esbuild-plugin-umd
```

:::

## Feature

- support format umd for building UMD module

## How to use

```ts
import esbuild from 'esbuild'
import umd from 'esbuild-plugin-umd'

esbuild
  .build({
    entryPoints: ["input.js"],
    outdir: "dist",
    format: "umd",
    bundle: true,
    plugins: [
      umd({
        libraryName: 'myName',
        external: ['vue'],
        globalVariableName: {
          vue: 'Vue'
      }
    })],
  })
```


# Issues

Please let me know if there are any issues, click this [link](https://github.com/savage181855/savage-libs/issues).
