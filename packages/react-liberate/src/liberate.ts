import { StoreGeneric, StateTree, LiberatePlugin } from './types'

interface Liberate {
	_store: Map<string, StoreGeneric>
	_state: Map<string, StateTree>
	_plugins: Set<LiberatePlugin>
}

export let liberate: Liberate

export function createLiberate() {
	return {
		_store: new Map<string, StoreGeneric>(),
		_state: new Map<string, StateTree>(),
		_plugins: new Set<LiberatePlugin>()
	}
}

export function setActiveLiberate(_liberate: Liberate) {
	liberate = _liberate
}

setActiveLiberate(createLiberate())
