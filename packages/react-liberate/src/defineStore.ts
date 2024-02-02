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
import { useRef } from 'react'
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
  let isSyncListening = false

  createStore()
  function createStore() {
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
        this.$patch((v) => {
          Object.assign(v, initState)
        })
      },
      $subscribe(cb: (newValue: S) => unknown) {
        const remove = addSubscriptions(cb, () => unwatch())
        const unwatch = watch(
          $state,
          (state) => {
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
        Object.keys(actions ? actions : []).reduce(
          (x, y) =>
            Object.assign(x, {
              [y]: function () {
                return actions![y].call(store, ...arguments)
              }
            }),
          {} as A
        ),
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

    Promise.resolve().then(() => {
      liberate._plugins.forEach((p) => {
        Object.assign(
          store,
          p({
            store,
            // @ts-ignore
            options
          }) || {}
        )
      })
    })

    liberate._store.set(id, store)
  }

  function useStore() {
    if (!liberate._store.has(id)) createStore()

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
