## Usage

### Setup

```ts
// src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { loadPlugin } from "react-liberate"
import liberatePlugin from "react-liberate-persist"

loadPlugin(liberatePlugin)
```

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

## Basic usage

By enabling the persist plugin on your store, the whole state will be stored in the sessionStorage by default.

The store id is used as the storage key (to set a custom storage key)

```ts
// src/store/app.ts
import { defineStore } from 'react-liberate'

export const useAppStore = defineStore('appStore', {
  state: () => {
    return {
      firstName: 'S',
      lastName: 'L',
      accessToken: 'xxxxxxxxxxxxx'
    }
  },
  actions: {
    setToken (value: string) {
      this.accessToken = value
    }
  },
  persist: {
    enabled: true
  }
})
```

## Advanced Usage

### Strategies

With`react-liberate-persist`You can use multiple strategies to persist your store data.

You can define a strategy list in your store under the persist key.

```ts
// src/store/app.ts
import { defineStore } from 'react-liberate'

export const useAppStore = defineStore('appStore', {
  state: () => {
    return {
      firstName: 'S',
      lastName: 'L',
      accessToken: 'xxxxxxxxxxxxx'
    }
  },
  actions: {
    setToken (value: string) {
      this.accessToken = value
    }
  },
  persist: {
    enabled: true,
    strategies: [], // <- HERE
  }
})
```

Each strategy is an object like so:

```ts
interface PersistStrategy {
  key?: string; // Storage key
  storage?: Storage; // Actual storage (default: sessionStorage)
  paths?: string[]; // list ok state keys you want to store in the storage
}
```

### Custom storage key

You can set a custom storage key by setting the key `key` in each strategy.

In this example, the whole state will be stored in the localStorage under the key `user`.

```ts
// src/store/app.ts
import { defineStore } from 'react-liberate'

export const useAppStore = defineStore('appStore', {
  state: () => {
    return {
      firstName: 'S',
      lastName: 'L',
      accessToken: 'xxxxxxxxxxxxx'
    }
  },
  actions: {
    setToken (value: string) {
      this.accessToken = value
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage,
      },
    ],
  }
})
```

### Persist partial state

By default the whole state is persisted, but you can specify the state keys you want ot persist, by setting the `paths` key in each strategy.

In this example we persist the `firstName` and `lastName` in the sessionStorage, and the `accessToken` in the localStorage.

```ts
// src/store/app.ts
import { defineStore } from 'react-liberate'

export const useAppStore = defineStore('appStore', {
  state: () => {
    return {
      firstName: 'S',
      lastName: 'L',
      accessToken: 'xxxxxxxxxxxxx'
    }
  },
  actions: {
    setToken (value: string) {
      this.accessToken = value
    }
  },
  persist: {
    enabled: true,
    strategies: [
      { storage: sessionStorage, paths: ['firstName', 'lastName'] },
      { storage: localStorage, paths: ['accessToken'] },
    ],
  }
})
```

### Custom storage

By default the storage is set to sessionStorage, but you can specify the storage you want to use for each strategy by setting the `storage` key.

You can then use `sessionStorage`, `localStorage` or any custom storage object.

In this example we create a storage that uses the `js-cookie` npm module to get and set the user's access token into a cookie.

```ts
// src/store/app.ts
import Cookies from 'js-cookie'

import { defineStore } from 'react-liberate'

const cookiesStorage: Storage = {
  setItem (key, state) {
    return Cookies.set('accessToken', state.accessToken, { expires: 3 })
  },
  getItem (key) {
    return JSON.stringify({
      accessToken: Cookies.getJSON('accessToken'),
    })
  },
}

export const useAppStore = defineStore('appStore', {
  state: () => {
    return {
      firstName: 'S',
      lastName: 'L',
      accessToken: 'xxxxxxxxxxxxx'
    }
  },
  actions: {
    setToken (value: string) {
      this.accessToken = value
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: cookiesStorage,
        paths: ['accessToken']
      },
    ],
  }
})
```
