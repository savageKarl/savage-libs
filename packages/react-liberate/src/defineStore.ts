/* eslint-disable @typescript-eslint/ban-types */
import { useEffect, useReducer, useRef } from 'react'

import { copyDeep, debounce } from 'savage-utils'
import { isObject, isArray, isFunction } from 'savage-types'

import type {
	DepsType,
	StateTree,
	DefineStoreOptions,
	Callback,
	Store,
	DepStack,
	LiberatePlugin,
	_GettersTree,
	_ActionsTree,
	StoreDefinition
} from './types'

import { reactiveMerge } from './utils'

import { getApiEnv } from './apiEnv'

// global dependency collection
const Dep: DepStack = []

function pushDep(fn: Callback) {
	Dep.push(fn)
}

function removeDep() {
	Dep.pop()
}

function getDep() {
	return Dep.length > 0 ? Dep[Dep.length - 1] : undefined
}

const subscribe: Set<() => unknown> = new Set()

const plugins: LiberatePlugin[] = []

function createReactive<T extends object>(target: T, cb?: () => unknown): T {
	const dataDepRecord: DepsType = new Map()

	const obj = new Proxy(target, {
		get(target, key: string, receiver) {
			// debugger
			const res = Reflect.get(target, key, receiver)
			const dep = getDep()

			if (dep) {
				if (!dataDepRecord.get(key)) dataDepRecord.set(key, new Set<Callback>())
				dataDepRecord.get(key)?.add(dep)
			}

			return res
		},
		set(target, key, value, receiver) {
			// debugger
			const oldV = copyDeep(target[key as keyof T] as object) as StateTree
			const status = Reflect.set(target, key, value, receiver)
			dataDepRecord.get(key)?.forEach(dep => dep(oldV, value))
			cb?.()
			return status
		}
	})

	for (const k in obj) {
		const child = obj[k]
		if (isObject(child) || isArray(child)) {
			obj[k] = createReactive(child as object, cb) as T[Extract<
				keyof T,
				string
			>]
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
		pushDep(callback.current)
	}
	useEffect(removeDep)
}

export function loadPlugin(plugin: LiberatePlugin) {
	plugins.push(plugin)
}

export function defineStore<
	Id extends string,
	S extends StateTree,
	G extends _GettersTree<S> = {},
	A extends _ActionsTree = {}
>(
	id: Id,
	options: DefineStoreOptions<Id, S, G, A>
): StoreDefinition<Id, S, G, A> {
	const { state, actions, getters } = options

	const initState = state ? state() : {}

	const baseStore = createReactive(
		{
			...(state ? state() : {}),
			...getters,
			...actions
		},
		() => subscribe.forEach(fn => fn())
	)

	for (const k in actions) {
		// @ts-ignore
		baseStore[k] = baseStore[k].bind(baseStore)
	}

	for (const k in getters) {
		// @ts-ignore
		getters[k] = getters[k].bind(baseStore, baseStore)
		// @ts-ignore
		pushDep(() => (baseStore[k] = getters[k]()))
		// @ts-ignorere
		baseStore[k] = getters[k]()
		removeDep()
	}

	const $state = createReactive(state ? state() : {}) as S
	for (const k in $state) {
		pushDep((oldV, newV) => ($state[k] = newV as S[Extract<keyof S, string>]))
		const tempStoreValue = baseStore[k] as S[Extract<keyof S, string>]
		removeDep()

		pushDep((oldV, newV) => {
			if (!Object.is(newV, baseStore[k])) baseStore[k] = newV
		})
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const temp$stateValue = $state[k]
		removeDep()
		$state[k] = tempStoreValue
	}

	function $patch(val: Partial<S> | ((arg: S) => unknown)) {
		if (isObject(val)) reactiveMerge($state, val)
		if (isFunction(val)) val($state)
	}

	function $reset() {
		reactiveMerge($state, initState, true)
	}

	function $subscribe(cb: () => unknown) {
		if (getApiEnv() === 'component') {
			const callback = useRef<typeof cb>()
			if (!callback.current) callback.current = cb
			subscribe.add(callback.current)
		} else {
			subscribe.add(cb)
		}
	}

	const store = Object.assign(baseStore, {
		$id: id,
		$state,
		$patch,
		$subscribe,
		$reset
	}) as Store<Id, S, G, A>

	setTimeout(() => {
		plugins.forEach(p => {
			Object.assign(
				store,
				p({
					store,
					// @ts-ignore
					options
				}) || {}
			)
		})
	}, 0)

	function useStore() {
		if (getApiEnv() === 'component') useCollectDep()
		return store
	}
	useStore.$id = id

	return useStore
}
