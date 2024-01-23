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
