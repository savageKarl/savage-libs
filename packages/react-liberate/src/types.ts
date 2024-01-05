/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

export type StateTree = Record<string | number | symbol, unknown>

export type Callback<T = StateTree, K = StateTree> = (oldV: T, V: K) => void
export type DepsType = Map<unknown, Set<Callback>>

export type ReturnType<T> = T extends (...args: unknown[]) => infer R
	? R extends (...args: unknown[]) => unknown
		? ReturnType<R>
		: R
	: never

export type _StoreWithGetters<G> = {
	readonly [K in keyof G]: ReturnType<G[K]>
}

export type _GettersTree<S extends StateTree> = Record<
	string,
	((state: S) => unknown) | (() => unknown)
>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LiberateCustomStateProperties<
	S extends StateTree = StateTree
> {}

export type _ActionsTree = Record<
	string | number | symbol,
	(...args: any[]) => any
>

/**
 * Interface to be extended by the user when they add properties through plugins.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LiberateCustomProperties<
	Id extends string = string,
	S extends StateTree = StateTree,
	G /* extends GettersTree<S> */ = _GettersTree<S>,
	A /* extends ActionsTree */ = _ActionsTree
> {}

export type _DeepPartial<T> = { [K in keyof T]?: _DeepPartial<T[K]> }

export interface _StoreWithState<Id extends string, S extends StateTree, G, A> {
	$id: Id
	$state: S & LiberateCustomStateProperties<S>
	$patch(partialState: _DeepPartial<S>): void
	$patch<F extends (state: S) => unknown>(
		stateMutator: ReturnType<F> extends Promise<unknown> ? never : F
	): void
	$reset(): void
	$subscribe(callback: (...args: unknown[]) => unknown): void
}

export type Store<
	Id extends string,
	S extends StateTree,
	G,
	A
> = _StoreWithState<Id, S, G, A> &
	S &
	_StoreWithGetters<G> &
	A &
	LiberateCustomProperties<Id, S, G, A> &
	LiberateCustomStateProperties<S>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DefineStoreOptionsBase<S extends StateTree, Store> {}

export interface DefineStoreOptions<
	Id extends string,
	S extends StateTree,
	G /* extends GettersTree<S> */,
	A /* extends Record<string, StoreAction> */
> extends DefineStoreOptionsBase<S, Store<Id, S, G, A>> {
	state: () => S
	getters?: G & ThisType<S & _StoreWithGetters<G>> & _GettersTree<S>
	actions?: A & ThisType<S & A & _StoreWithGetters<G>>
}

export type DepStack = Callback[]

export type LiberatePluginContext<
	Id extends string = string,
	S extends StateTree = StateTree,
	G = _GettersTree<S>,
	A = _ActionsTree
> = {
	options: DefineStoreOptions<Id, S, G, A>
	store: Store<Id, S, G, A>
}

export interface LiberatePlugin {
	(
		context: LiberatePluginContext
	): Partial<LiberateCustomProperties & LiberateCustomStateProperties> | void
}
