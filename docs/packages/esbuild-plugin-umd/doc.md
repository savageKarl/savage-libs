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
