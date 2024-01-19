import { useState } from 'react'
import { ref, reactive } from '@maoism/runtime-core'
import { setActiveEffect } from './utils'

export function useRefState<S>(initValue: S) {
	const [s, set] = useState({})
	// setActiveEffect()
}

export function useReactiveState<S>(initValue: S) {
	setActiveEffect
}
