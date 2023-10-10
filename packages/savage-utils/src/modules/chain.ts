type Fun = (...args: unknown[]) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChainNodeFun = (next: Fun, ...args: any) => unknown

class ChainNode {
	private fn: ChainNodeFun
	private successor: this | null = null

	constructor(fn: ChainNodeFun) {
		this.fn = fn
	}

	public setNextNode(successor: this) {
		return (this.successor = successor)
	}

	public passRequest<T = unknown>(...rest: unknown[]): T {
		const result = this.fn(this.next.bind(this), ...rest)

		if (result === 'nextNode' && this.successor) {
			return this.successor.passRequest(...rest)
		}

		return result as T
	}

	private next(...rest: unknown[]) {
		return this.successor && this.successor.passRequest(...rest)
	}
}

export class Chain {
	turnToNode(fn: ChainNodeFun) {
		return new ChainNode(fn)
	}
}
