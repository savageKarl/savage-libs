/* eslint-disable @typescript-eslint/ban-types */

import {
	reactive,
	toRefs,
	markRaw,
	computed,
	watch,
	type ComputedRef
} from '@maoism/runtime-core'
import { isFunction } from 'savage-types'

import type {
	StateTree,
	DefineStoreOptions,
	Store,
	_GettersTree,
	_ActionsTree,
	StoreDefinition,
	_DeepPartial,
	_StoreWithState
} from './types'

import { noop, mergeReactiveObjects, setActiveEffect } from './utils'
import { safeHookRun } from './apiEnv'
import { liberate } from './liberate'
import { addSubscriptions, triggerSubscription } from './subscription'

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
		let isSyncListening = false

		if (!liberate._store.has(id)) {
			const { state, actions, getters } = options
			const $state = reactive(state ? state() : {}) as S

			const initState = state ? state() : {}

			const baseStore = {
				$id: id,
				$state,
				$patch(val: _DeepPartial<S> | ((arg: S) => unknown)) {
					isSyncListening = false
					if (isFunction(val)) {
						val($state as S)
					} else {
						mergeReactiveObjects($state as S, val)
					}

					isSyncListening = true
					triggerSubscription($state)
				},
				$reset() {
					this.$patch(v => {
						Object.assign(v, initState)
					})
				},
				$subscribe(cb: (newValue: S) => unknown, options = { detached: true }) {
					const remove = addSubscriptions(cb, options.detached, () => unwatch())
					const unwatch = watch(
						$state,
						state => {
							if (isSyncListening) {
								cb(state)
							}
						},
						{
							deep: true,
							flush: 'sync'
						}
					)
					return remove
				}
			} as _StoreWithState<Id, S, G, A>

			liberate._state.set(id, $state)

			const store = reactive(
				Object.assign(
					baseStore,
					toRefs($state),
					actions,
					Object.keys(getters || {}).reduce(
						(computedGetters, name) => {
							computedGetters[name] = markRaw(
								computed(() => {
									return getters?.[name].call(store, store)
								})
							)
							return computedGetters
						},
						{} as Record<string, ComputedRef>
					)
				)
			) as unknown as Store<Id, S, G, A>

			for (const k in actions) {
				// @ts-ignore
				store[k] = store[k].bind(store)
			}

			liberate._plugins.forEach(p => {
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

		safeHookRun(() => {
			setActiveEffect()
		})

		isSyncListening = true
		const store = liberate._store.get(id) as Store<Id, S, G, A>
		return store
	}
	useStore.$id = id

	return useStore
}
