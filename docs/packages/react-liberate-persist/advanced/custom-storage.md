# Custom storage

By default the storage is set to sessionStorage, but you can specify the storage you want to use for each strategy by setting the `storage` key.

You can then use `sessionStorage`, `localStorage` or any custom storage object.

In this example we create a storage that uses the `js-cookie` npm module to get and set the user's access token into a cookie.

::: code-group

```ts [store.ts]
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
:::