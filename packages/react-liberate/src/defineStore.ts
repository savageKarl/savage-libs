import { useEffect, useReducer, useRef } from 'react'

import { copyDeep, debounce } from 'savage-utils'
import { isObject, isArray } from 'savage-types'

import type {
	DepsType,
	StateType,
	Options,
	Callback,
	Store,
	DepStack,
	Plugins,
	PluginOptions
} from './types'

// global dependency collection
const Dep: DepStack = []

const subscribe: Set<() => unknown> = new Set()

const plugins: Plugins = []

function createReactive<T extends object>(target: T): T {
	const deps: DepsType = new Map()

	const obj = new Proxy(target, {
		get(target, key: string, receiver) {
			const res = Reflect.get(target, key, receiver)
			if (Dep.length > 0) {
				if (!deps.get(key)) deps.set(key, new Set<Callback>())
				Dep.forEach(item => deps.get(key)?.add(item))
			}
			return res
		},
		set(target, key, value, receiver) {
			const oldV = copyDeep(target[key as keyof T] as object)
			const res = Reflect.set(target, key, value, receiver)
			deps.get(key)?.forEach(item => item(oldV, value))
			subscribe.forEach(fn => fn())
			return res
		}
	})

	for (const k in obj) {
		const child = obj[k]
		if (isObject(child) || isArray(child)) {
			obj[k] = createReactive(obj[k] as object) as T[Extract<keyof T, string>]
		}
	}
	return obj
}

/** collect dependency used by components */
function useCollectDep() {
	const [, forceUpdate] = useReducer(c => c + 1, 0)
	const callback = useRef<Callback>()

	// prevent collect dependencies if re-render
	if (!callback.current) {
		callback.current = forceUpdate
		Dep.push(callback.current)
	}
	useEffect(() => {
		Dep.pop()
	})
}

export function loadPlugin(plugin: PluginOptions) {
	plugins.push(plugin)
}

export function defineStore<
	S extends StateType,
	A extends Record<string, Callback>,
	C = object
>(options: Options<S, A, C>) {
	const state = options.state
	const actions = options.actions
	const getters = options.getters

	const baseStore = createReactive({
		...state,
		...getters,
		...actions
	}) as Store<S, A, C>

	for (const k in actions) {
		// @ts-ignore
		baseStore[k] = actions[k].bind(baseStore)
	}

	for (const k in getters) {
		// @ts-ignore
		getters[k] = getters[k].bind(baseStore, baseStore)
		// @ts-ignore
		Dep.push(() => (baseStore[k] = getters[k]()))
		// @ts-ignorere
		baseStore[k] = getters[k]()
		Dep.pop()
	}

	function $patch(val: Partial<S> | ((arg: S) => unknown)) {
		if (typeof val === 'object') {
			for (const k in val) {
				// @ts-ignore
				baseStore[k] = val[k]
			}
		}

		if (typeof val === 'function') {
			val(baseStore)
		}
	}

	function $watch<K extends keyof S>(
		k: K,
		fn: (oldV: S[K], V: S[K]) => unknown
	) {
		// prevent collect dependencies if re-render
		const callback = useRef<Callback<K>>()
		// @ts-ignore
		if (!callback.current) callback.current = fn
		// @ts-ignore
		Dep.push(callback.current)
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const temp = baseStore[k]
		Dep.pop()
	}

	let env: 'component' | 'js' = 'js'

	function $subscribe(cb: () => unknown) {
		if (env === 'component') {
			const callback = useRef<typeof cb>()
			if (!callback.current) callback.current = debounce(() => cb(), 0)
			subscribe.add(callback.current)
		} else {
			subscribe.add(debounce(() => cb(), 0))
		}
	}

	const store = Object.assign(baseStore, {
		$patch,
		$watch,
		$subscribe
	})

	setTimeout(() => {
		plugins.forEach(p => {
			Object.assign(
				store,
				p({
					store,
					// @ts-ignore
					options: options || {}
				})
			)
		})
	}, 0)

	function useStore() {
		env = 'component'

		useEffect(() => {
			env = 'js'
		})

		useCollectDep()
		return store
	}
	return useStore
}
