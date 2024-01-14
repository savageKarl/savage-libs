import { StoreGeneric, StateTree } from './types'

interface Liberate {
	_store: Map<string, StoreGeneric>
	_state: Map<string, StateTree>
}

export let liberate: Liberate

export function createLiberate() {
	return {
		_store: new Map<string, StoreGeneric>(),
		_state: new Map<string, StateTree>()
	}
}

export function setActiveLiberate(_liberate: Liberate) {
	liberate = _liberate
}

setActiveLiberate(createLiberate())
