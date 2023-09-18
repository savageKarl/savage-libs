import { ChainNodeFun } from '../types/types'

class ChainNode {
	private fn: ChainNodeFun
	private successor: this | null = null
	private isUsePreviosArgs: boolean

	constructor(fn: ChainNodeFun, isUsePreviosArgs: boolean) {
		this.fn = fn
		this.isUsePreviosArgs = isUsePreviosArgs
	}

	setNextNode(successor: this) {
		return (this.successor = successor)
	}

	passRequest(...rest: unknown[]): void {
		const result = this.fn(this.next, ...rest)

		if (result === 'nextNode' && this.successor) {
			return this.isUsePreviosArgs
				? this.successor.passRequest(result)
				: this.successor.passRequest(...rest)
		}

		return result as void
	}

	next(...rest: unknown[]) {
		return this.successor && this.successor.passRequest(...rest)
	}
}

export class Chain {
	private isUsePreviosArgs: boolean

	constructor(isUsePreviosArgs = false) {
		this.isUsePreviosArgs = isUsePreviosArgs
	}

	turnToNode(fn: ChainNodeFun) {
		return new ChainNode(fn, this.isUsePreviosArgs)
	}
}
