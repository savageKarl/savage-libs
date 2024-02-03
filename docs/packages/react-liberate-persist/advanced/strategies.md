
# Strategies

With`react-liberate-persist`You can use multiple strategies to persist your store data.

You can define a strategy list in your store under the persist key.

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
    strategies: [], // <- HERE
  }
})
```
:::

Each strategy is an object like so:

```ts
interface PersistStrategy {
  key?: string; // Storage key
  storage?: Storage; // Actual storage (default: sessionStorage)
  paths?: string[]; // list ok state keys you want to store in the storage
}
```
