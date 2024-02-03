# Persist partial state

By default the whole state is persisted, but you can specify the state keys you want ot persist, by setting the `paths` key in each strategy.

In this example we persist the `firstName` and `lastName` in the sessionStorage, and the `accessToken` in the localStorage.

::: code-group

```ts [store.ts]
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
:::