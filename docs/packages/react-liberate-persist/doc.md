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

