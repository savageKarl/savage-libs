import { useState } from 'react'
import { ref, reactive, computed } from '@maoism/runtime-core'
import { setActiveEffect } from './utils'

export function useRefState<S>(initValue: S) {
	setActiveEffect()
	const res = ref(initValue)
	return res
}

export function useReactiveState<S extends object>(initValue: S) {
	setActiveEffect()
	const res = reactive(initValue)
	return res
}

export function useGetterState<F extends () => any>(f: F) {
	return computed(f)
}
