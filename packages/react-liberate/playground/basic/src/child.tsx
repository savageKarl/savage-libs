import { defineStore } from 'react-liberate'
import { memo } from 'react'

const useStore = defineStore('childStore', {
  state: () => ({ enable: false }),
  actions: {
    show() {
      this.enable = !this.enable
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage
      }
    ]
  }
})

export function Child() {
  const store = useStore()
  console.debug('Child')
  return (
    <>
      {store.enable ? (
        <div
          style={{
            border: '1px solid lightgrey',
            width: '200px',
            height: '200px',
            display: 'flex',
            placeContent: 'center'
          }}
        >
          <h2>child</h2>
        </div>
      ) : null}
      <button onClick={store.show}>show</button>
    </>
  )
}

export default memo(Child)
