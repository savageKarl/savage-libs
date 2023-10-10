import { mergeDeep } from 'savage-utils'

import { ChainNodeFun } from '../types/types'

class ChainNode {
	private fn: ChainNodeFun
	private successor: this | null = null
	private usePreviosResult: boolean

	constructor(fn: ChainNodeFun, usePreviosResult: boolean) {
		this.fn = fn
		this.usePreviosResult = usePreviosResult
	}

	public setNextNode(successor: this) {
		return (this.successor = successor)
	}

	public passRequest<T = unknown>(...rest: unknown[]): T {
		const result = this.fn(this.next, ...rest)

		if (result === 'nextNode' && this.successor) {
			return this.usePreviosResult
				? this.successor.passRequest(result)
				: this.successor.passRequest(...rest)
		}

		return result as T
	}

	private next(...rest: unknown[]) {
		return this.successor && this.successor.passRequest(...rest)
	}
}

interface ChianOptions {
	/**
	 * use result of previos called function for arguments
	 *
	 * @defaultValue `false`
	 */
	usePreviosResult: boolean
}

export class Chain {
	private options: ChianOptions = {
		usePreviosResult: false
	}

	constructor(options?: ChianOptions) {
		this.options = Object.assign(this.options, options)
	}

	turnToNode(fn: ChainNodeFun) {
		return new ChainNode(fn, this.options.usePreviosResult)
	}
}
