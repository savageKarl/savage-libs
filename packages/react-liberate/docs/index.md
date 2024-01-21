## Features

- **Lightweight**
- **grace**
- **high performance**
- **flexible**
- **Progressive**
- **Modular**

## Function

- **Render on demand**
- **Computed**
- **Watcher**
- **Smart reminder**

**Notice**: The third-party mirror is not synchronized in time, so remember to use the official mirror! ! !

## compatibility

The project uses ES6 `proxy`, only supports mainstream browsers, view[here](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy#%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E6%80%A7).

## quick use

Define a `useStore` hook and export

```javascript
import { defineStore } from "react-liberate";

export const useStore = defineStore({
	state: {
		count: 0,
		name: "savage",
	},
	actions: {
		increment() {
			this.count += 1;
			this.name = "hell";
		},
		changeName() {
			this.name = "foo";
		},
	},
	computed: {
		dbCount(): number {
			console.debug("dbCount just execute once");
			return this.count * 2;
		},
		three(state): number {
			console.debug("can access the state");
			return this.dbCount * 3;
		},
	},
});
```

exist `Counter` Import and use in components

```javascript
import { memo } from "react";

import { useStore } from "../store";

export function Count() {
	console.debug("count rendered");

	const store = useStore();

	const { count, name, increment, changeName } = store;

	store.useWatcher("count", (oldV, value) => {
		console.debug("watch", oldV, value);
	});

	function changeName2() {
		// pass the object
		store.patch({ name: "bar" });
	}

	function changeName3() {
		// pass the function
		store.patch((state) => (state.name = "shit"));
	}
	return (
		<div>
			<h1>I'm the counter</h1>
			<div>number：{count}</div>
			<div>
				<button onClick={() => increment()}> +1</button>
			</div>
			<h3>{name}</h3>

			<div>{store.dbCount}</div>
			<button onClick={() => changeName()}>changeName</button>
			<button onClick={() => changeName2()}>changeName2</button>
			<button onClick={() => changeName3()}>changeName3</button>
		</div>
	);
}

export default memo(Count);
```
