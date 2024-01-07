import { useState } from 'react'

type ApiEnv = 'component' | 'js' | 'pending'

let apiExecuteEnv: ApiEnv = 'component'

function setApiEnv(env: ApiEnv) {
	apiExecuteEnv = env
}

export function getApiEnv() {
	try {
		setApiEnv('pending')
		useState()
		setApiEnv('component')
	} catch (e) {
		setApiEnv('js')
	}

	return apiExecuteEnv
}

const originErrorConsole = window.console.error

window.console.error = function (...args: unknown[]) {
	if (apiExecuteEnv === 'pending') return undefined

	originErrorConsole(...args)
}
