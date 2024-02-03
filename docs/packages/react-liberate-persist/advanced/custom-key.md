# Custom storage key

You can set a custom storage key by setting the key `key` in each strategy.

In this example, the whole state will be stored in the localStorage under the key `user`.

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
      {
        key: 'user',
        storage: localStorage,
      },
    ],
  }
})
```
:::