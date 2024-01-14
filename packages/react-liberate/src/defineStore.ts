/* eslint-disable @typescript-eslint/ban-types */
import { useEffect, useReducer, useRef } from 'react'

import { isObject, isArray, isFunction } from 'savage-types'

import type {
	DepsType,
	StateTree,
	DefineStoreOptions,
	Callback,
	Store,
	LiberatePlugin,
	_GettersTree,
	_ActionsTree,
	StoreDefinition,
	ActiveEffect,
	LiberateCustomStateProperties
} from './types'

import { reactiveMerge } from './utils'
import { getApiEnv } from './apiEnv'
import { liberate } from './liberate'

let activeEffect: ActiveEffect

const subscribe: Set<() => unknown> = new Set()

const plugins: LiberatePlugin[] = []

export function loadPlugin(plugin: LiberatePlugin) {
	plugins.push(plugin)
}

function createReactive<T extends object>(target: T, cb?: () => unknown): T {
	const dataDepRecord: DepsType = new Map()

	const obj = new Proxy(target, {
		get(target, key: string, receiver) {
			// debugger
			const res = Reflect.get(target, key, receiver)
			if (activeEffect) {
				if (!dataDepRecord.get(key)) dataDepRecord.set(key, new Set<Callback>())
				dataDepRecord.get(key)?.add(activeEffect)
			}

			return res
		},
		set(target, key, value, receiver) {
			// debugger
			const status = Reflect.set(target, key, value, receiver)
			dataDepRecord.get(key)?.forEach(dep => dep(value))

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
		activeEffect = callback.current
	}
	useEffect(() => (activeEffect = undefined))
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
	function useStore() {
		if (!liberate._store.has(id)) {
			// debugger
			const { state, actions, getters } = options

			const initState = state ? state() : {}

			const baseStore = createReactive(
				{
					...(state ? state() : {}),
					...actions,
					...getters,
					$id: id,
					$patch(val: Partial<S> | ((arg: S) => unknown)) {
						if (isObject(val)) reactiveMerge(liberate._state.get(id) as S, val)
						if (isFunction(val)) val(liberate._state.get(id) as S)
					},

					$reset() {
						reactiveMerge(liberate._state.get(id) as S, initState, true)
					},

					$subscribe(cb: () => unknown) {
						if (getApiEnv() === 'component') {
							const callback = useRef<typeof cb>()
							if (!callback.current) callback.current = cb
							subscribe.add(callback.current)
						} else {
							subscribe.add(cb)
						}
					}
				},
				() => subscribe.forEach(fn => fn())
			)

			for (const k in actions) {
				// @ts-ignore
				baseStore[k] = baseStore[k].bind(baseStore)
			}

			// for (const k in getters) {
			// 	let value: unknown

			// 	const dep = () => {
			// 		// @ts-ignore
			// 		value = getters[k].call(baseStore, baseStore)
			// 	}

			// 	Object.defineProperties(baseStore, {
			// 		[k]: {
			// 			get() {
			// 				if (!value) {
			// 					pushDep(dep)
			// 					dep()
			// 					removeDep()
			// 				}
			// 				return value
			// 			}
			// 		}
			// 	})
			// }
			debugger
			for (const k in getters) {
				const $state = liberate._state.get(id) as S &
					LiberateCustomStateProperties<S>

				// @ts-ignore
				activeEffect = () =>
					// @ts-ignore
					(baseStore[k] = getters[k].call(baseStore, $state))

				const tempGetterValue = getters[k].call(baseStore, $state)

				activeEffect = undefined
				// @ts-ignore
				baseStore[k] = tempGetterValue
			}

			const $state = createReactive(state ? state() : {}) as S
			for (const k in $state) {
				activeEffect = newV => ($state[k] = newV as S[Extract<keyof S, string>])
				// @ts-ignore
				const tempStoreValue = baseStore[k] as S[Extract<keyof S, string>]
				activeEffect = undefined

				activeEffect = newV => {
					// @ts-ignore
					if (!Object.is(newV, baseStore[k])) baseStore[k] = newV
				}
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const temp$stateValue = $state[k]
				activeEffect = undefined

				$state[k] = tempStoreValue
			}

			liberate._state.set(id, $state)

			Object.defineProperties(baseStore, {
				$state: {
					get() {
						return liberate._state.get(id)
					}
				}
			})

			const store = baseStore as Store<Id, S, G, A>

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

			liberate._store.set(id, store)
		}

		if (getApiEnv() === 'component') useCollectDep()

		const store = liberate._store.get(id) as Store<Id, S, G, A>

		return store
	}
	useStore.$id = id

	return useStore
}
