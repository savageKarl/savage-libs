import { defineStore } from 'react-liberate'
import Child from './child'

const useStore = defineStore('parentStore', {
  state: () => ({ count: 0 }),
  persist: {
    enabled: true
  }
})

export function Parent() {
  const store = useStore()
  console.debug('Parent')
  return (
    <>
      <h1>count: {store.count}</h1>
      <div className='card'>
        <button onClick={() => store.count++}>add</button>
      </div>
      <Child></Child>
    </>
  )
}
