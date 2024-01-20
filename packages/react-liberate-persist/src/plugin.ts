import type { LiberatePluginContext, LiberatePlugin } from 'react-liberate'

export interface PersistStrategy {
	key?: string
	storage?: Storage
	paths?: string[]
}

export interface PersistOptions {
	enabled: true
	strategies?: PersistStrategy[]
}

type Store = LiberatePluginContext['store']
type PartialState = Partial<Store['$state']>

declare module 'react-liberate' {
	export interface DefineStoreOptionsBase<S, Store> {
		persist?: PersistOptions
	}
}

export const updateStorage = (strategy: PersistStrategy, store: Store) => {
	const storage = strategy.storage || sessionStorage
	const storeKey = strategy.key || store.$id

	if (strategy.paths) {
		const partialState = strategy.paths.reduce((finalObj, key) => {
			finalObj[key] = store.$state[key]
			return finalObj
		}, {} as PartialState)

		storage.setItem(storeKey, JSON.stringify(partialState))
	} else {
		storage.setItem(storeKey, JSON.stringify(store.$state))
	}
}

export const reactLiberatePersist: LiberatePlugin = ({
	options,
	store
}: LiberatePluginContext): void => {
	if (options.persist?.enabled) {
		const defaultStrat: PersistStrategy[] = [
			{
				key: store.$id,
				storage: sessionStorage
			}
		]
		const strategies = options.persist?.strategies?.length
			? options.persist?.strategies
			: defaultStrat

		strategies.forEach(strategy => {
			const storage = strategy.storage || sessionStorage
			const storeKey = strategy.key || store.$id
			const storageResult = storage.getItem(storeKey)

			if (storageResult) {
				store.$patch(JSON.parse(storageResult))
				updateStorage(strategy, store)
			}
		})

		store.$subscribe(() => {
			strategies.forEach(strategy => {
				updateStorage(strategy, store)
			})
		})
	}
}
