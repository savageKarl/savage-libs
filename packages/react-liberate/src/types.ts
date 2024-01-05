// export type Callback = (arg: unknown) => unknown
export type StateType = Record<string | number | symbol, unknown>

export type Callback<T = StateType, K = StateType> = (oldV: T, V: K) => void

export type DepsType = Map<unknown, Set<Callback>>

export type ReturnType<T> = T extends (...args: unknown[]) => infer R
	? R extends (...args: unknown[]) => unknown
		? ReturnType<R>
		: R
	: never

export type StoreWithGetters<G> = {
	readonly [K in keyof G]: ReturnType<G[K]>
}

export type GettersTree<S extends StateType> = Record<
	string,
	((state: S) => unknown) | (() => unknown)
>

export type Options<S extends StateType, A, C> = {
	state: S
	getters?: C & ThisType<S & StoreWithGetters<C>> & GettersTree<S>
	actions?: A & ThisType<S & A & StoreWithGetters<C>>
}

export type Api<S> = {
	$patch(v: Partial<S> | ((arg: S) => unknown)): unknown
	$watch<K extends keyof S>(k: K, fn: (oldV: S[K], V: S[K]) => unknown): unknown
	$subscribe: (cb: () => unknown) => unknown
}

export type Store<S, A, C> = S & A & StoreWithGetters<C> & Api<S>

export type DepStack = Callback[]

export type LiberatePluginContext<S extends StateType, A, G> = {
	options: Options<S, A, G>
	store: Store<unknown, unknown, unknown>
}

export type PluginOptions<
	S extends StateType = StateType,
	A = unknown,
	G = unknown
> = (
	ctx: LiberatePluginContext<S, A, G>
) => (Partial<Store<unknown, unknown, unknown>> & object) | undefined | void

export type Plugins = PluginOptions[]
