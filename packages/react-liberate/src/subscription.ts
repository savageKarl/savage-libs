import { useEffect } from 'react'

import type { Fun, StateTree } from './types'
import { noop } from './utils'
import { safeHookRun } from './apiEnv'

const subscriptions: Fun[] = []

export function addSubscriptions<T extends Fun>(
	callback: T,
	detached?: boolean,
	onCleanup: () => void = noop
) {
	subscriptions.push(callback)

	const remove = () => {
		const idx = subscriptions.indexOf(callback)
		if (idx > -1) {
			subscriptions.splice(idx, 1)
			onCleanup()
		}
	}

	if (!detached) {
		safeHookRun(() => useEffect(() => remove, []))
	}

	return remove
}

export function triggerSubscription(state: StateTree) {
	subscriptions.forEach(callback => callback(state))
}
