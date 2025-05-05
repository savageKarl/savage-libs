# React-liberate

> simple and elegant React Global State Manager.
## 说明

React-Liberate是一个专为React应用设计的轻量级、简单且优雅的全局状态管理库。它提供了一种直观的方式来定义和管理应用状态，支持State、Getters和Actions，API完全参考[Pinia](https://pinia.vuejs.org/)，为Vue生态的开发者提供无缝化体验。该库内部使用Vue3的reactivity独立包实现响应式系统，确保高效可靠的状态管理。

## 特性

- 🎯 **简单直观** - 基于store的设计，使状态管理变得简单
- 🔄 **强大的响应式** - 基于Vue3 reactivity系统，自动追踪依赖并高效更新组件
- 🧩 **模块化** - 可以创建多个独立的store来组织不同的状态逻辑
- 💪 **TypeScript支持** - 完善的类型定义，提供良好的开发体验
- 🔌 **可扩展** - 支持插件系统进行功能扩展
- 🔧 **开发工具友好** - 简洁的API设计易于调试
- 🔀 **熟悉的API** - 完全参考Pinia的API设计，对Vue开发者友好

## 安装

```bash
# npm
npm install react-liberate

# yarn
yarn add react-liberate

# pnpm
pnpm add react-liberate
```

## 基础使用

### 创建和使用Store

```tsx
import { defineStore } from 'react-liberate'
import { useEffect } from 'react'

// 定义store（与Pinia完全一致的API）
const useCounterStore = defineStore('counter', {
  // 定义初始状态
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  
  // 定义getter方法（类似计算属性）
  getters: {
    doubleCount() {
      return this.count * 2
    }
  },
  
  // 定义actions方法
  actions: {
    increment() {
      this.count++
    },
    
    async fetchSomething() {
      // 支持异步操作
      const result = await api.get('/data')
      this.count = result.count
    }
  }
})

// 在组件中使用
function Counter() {
  // 获取store实例
  const store = useCounterStore()
  
  useEffect(() => {
    // 可以调用action方法
    store.fetchSomething()
  }, [])
  
  return (
    <div>
      <h1>{store.name}: {store.count}</h1>
      <p>Double count: {store.doubleCount}</p>
      <button onClick={() => store.increment()}>Increment</button>
    </div>
  )
}
```

### 多个Store之间的交互

```tsx
import { defineStore } from 'react-liberate'

// 用户Store
const useUserStore = defineStore('user', {
  state: () => ({
    name: 'Anonymous',
    isAdmin: false
  }),
  actions: {
    login(name, admin = false) {
      this.name = name
      this.isAdmin = admin
    },
    logout() {
      this.name = 'Anonymous'
      this.isAdmin = false
    }
  }
})

// Cart Store，依赖于用户Store
const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),
  getters: {
    isEmpty() {
      return this.items.length === 0
    },
    // 可以使用其他store
    isCheckoutAllowed() {
      const userStore = useUserStore()
      return this.items.length > 0 && userStore.name !== 'Anonymous'
    }
  },
  actions: {
    addItem(item) {
      this.items.push(item)
    },
    checkout() {
      const userStore = useUserStore()
      if (userStore.name === 'Anonymous') {
        throw new Error('Login required')
      }
      // 处理结账逻辑...
      this.items = []
    }
  }
})
```

## API参考

### `defineStore`

定义并创建一个store，API与Pinia完全一致。

```ts
defineStore(id, options)
```

**参数：**

- `id: string` - store的唯一标识符
- `options: Object` - store配置选项
  - `state: () => Object` - 返回初始状态对象的函数
  - `getters: Object` - 包含getter方法的对象（类似计算属性）
  - `actions: Object` - 包含action方法的对象（可以修改状态）

**返回值：**

- 返回一个自定义hook，用于在组件中获取store实例

### Store实例

通过调用`defineStore`返回的hook获取store实例，该实例包含以下属性和方法：

#### 属性

- `$id: string` - store的唯一标识符
- `$state: Object` - store的当前状态
- 所有在state中定义的属性
- 所有在getters中定义的计算属性

#### 方法

- `$patch(partialState: Object | (state) => void)` - 批量更新状态
- `$reset()` - 重置状态到初始值
- `$subscribe(callback: (newState) => void)` - 订阅状态变化
- 所有在actions中定义的方法

### 插件系统

React-Liberate支持通过插件扩展功能。

```ts
import { createLiberate, setActiveLiberate } from 'react-liberate'

// 创建liberate实例
const myLiberate = createLiberate()

// 使用插件
myLiberate.use(myPlugin)

// 设置为当前活动的liberate实例
setActiveLiberate(myLiberate)

// 插件示例
function myPlugin({ store, options }) {
  // 为store添加自定义属性或方法
  return {
    customProperty: 'value',
    customMethod() {
      // 自定义逻辑
    }
  }
}
```

## 高级用法

### 状态持久化

对于状态持久化，可以使用官方提供的插件 [react-liberate-persist](https://www.npmjs.com/package/react-liberate-persist)，该插件专为React-Liberate设计，提供了完善的本地存储能力。

```bash
# 安装持久化插件
npm install react-liberate-persist
```

### TypeScript支持

React-Liberate提供完善的TypeScript类型定义：

```tsx
import { defineStore } from 'react-liberate'

interface UserState {
  name: string
  age: number
}

const useUserStore = defineStore<'user', UserState>('user', {
  state: () => ({
    name: '',
    age: 0
  }),
  getters: {
    // 自动推断类型
    isAdult(): boolean {
      return this.age >= 18
    }
  },
  actions: {
    updateUser(name: string, age: number) {
      this.name = name
      this.age = age
    }
  }
})
```

## 调试技巧

### 订阅状态变化

使用`$subscribe`方法可以监听状态变化，方便调试：

```ts
const store = useCounterStore()

// 订阅状态变化
const unsubscribe = store.$subscribe((state) => {
  console.log('State changed:', state)
})

// 后续可以取消订阅
unsubscribe()
```

## 示例

完整的计数器示例：

```tsx
import React from 'react'
import { defineStore } from 'react-liberate'

// 定义store
const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount() {
      return this.count * 2
    },
    isPositive() {
      return this.count > 0
    }
  },
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    reset() {
      this.$reset()
    }
  }
})

// 计数器组件
function Counter() {
  const store = useCounterStore()
  
  return (
    <div>
      <h1>Counter: {store.count}</h1>
      <p>Double: {store.doubleCount}</p>
      <p>Is positive: {store.isPositive ? 'Yes' : 'No'}</p>
      
      <div>
        <button onClick={() => store.increment()}>+</button>
        <button onClick={() => store.decrement()}>-</button>
        <button onClick={() => store.reset()}>Reset</button>
      </div>
    </div>
  )
}

export default Counter
```

## 优势特点

- **熟悉的API** - 与Pinia完全一致的API，Vue生态的开发者可以无缝切换
- **Vue3的响应式系统** - 内部使用Vue3的reactivity独立包，提供强大的响应式能力
- **更简洁的API** - 相比Redux，React-Liberate提供更简洁直观的API，减少样板代码
- **更直接的状态修改** - 无需编写reducer，可以直接修改状态
- **更好的TypeScript集成** - 从设计之初就考虑TypeScript支持
- **模块化设计** - 每个store独立管理，更容易组织复杂应用的状态

## 许可证

GPL-3.0