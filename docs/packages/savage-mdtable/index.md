# Savage-mdtable

> A library for generate markdown tables.

## Installtion

::: code-group

```[npm]
npm i savage-mdtable
```

```[pnpm]
pnpm add savage-mdtable
```

```[yarn]
yarn add savage-mdtable
```

:::

## Feature

- support CJS & ESM
- support typescript type definition
- generate a markdown ([GFM](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables)) table.

## How to use

```ts
import { mdtable } from 'savage-mdtable'
import type { TableOptions } from 'savage-mdtable'

const options: TableOptions = {
  header: ['A', 'B', 'C'],
  alignment: ['L', 'C', 'R'],
  rows: [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
  ]
}

console.log(mdtable(options))

// it will be

| A | B | C |
|:--|:-:|--:|
| 1 | 2 | 3 |
| 4 | 5 | 6 |
| 7 | 8 | 8 |
`

```


# Issues

Please let me know if there are any issues, click this [link](https://github.com/savage181855/savage-libs/issues).
