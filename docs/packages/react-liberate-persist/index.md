# React-liberate-persist

> a plugin of react-liberate that provide storage ability.

## Installtion

::: code-group

```[npm]
npm i react-liberate-persist
```

```[pnpm]
pnpm add react-liberate-persist
```

```[yarn]
yarn add react-liberate-persist
```

:::

## Setup

::: code-group
```ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { liberate } from 'react-liberate'
import { reactLiberatePersist } from 'react-liberate-persist'

liberate.use(reactLiberatePersist)
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)

```
:::
### Typescript definitions

Add the`react-liberate-persist`types definition file to your tsconfig file.

```json
{
  "compilerOptions": {
    "types": [
      "react-liberate-persist"
    ]
  },
}
```



# Issues

Please let me know if there are any issues, click this [link](https://github.com/savage181855/savage-libs/issues).
