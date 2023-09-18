import { ChainNodeFun } from '../types/types'

class ChainNode {
	private fn: ChainNodeFun
	private successor: this | null = null

	constructor(fn: ChainNodeFun) {
		this.fn = fn
	}

	setNextNode(successor: this) {
		return (this.successor = successor)
	}

	passRequest(...rest: unknown[]) {
		const result = this.fn(...rest)

		if (result === 'nextNode') {
			return this.successor && this.successor.passRequest(...rest)
		}

		return result
	}

	next(...rest: unknown[]) {
		return this.successor && this.successor.passRequest(...rest)
	}
}

export class Chain {
	turnToNode(fn: ChainNodeFun) {
		return new ChainNode(fn)
	}
}
