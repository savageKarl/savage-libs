import { Fun } from '../types/types'

class ChainNode {
	private fn: Fun
	private successor: this | null = null

	constructor(fn: Fun) {
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
	turnToNode(fn: Fun) {
		return new ChainNode(fn)
	}
}

const chain = new Chain()

const fn1 = chain.turnToNode(function () {
	console.log('1')
	return 'nextNode'
})

const fn2 = chain.turnToNode(function () {
	console.log('2')
	return 'nextNode'
})

const fn3 = chain.turnToNode(function () {
	console.log('3')
	return 'nextNode'
})

const last = chain.turnToNode(function () {
	console.log('i am the last ndoe')
	return null
})

fn1.setNextNode(fn2).setNextNode(fn3).setNextNode(last)

fn1.passRequest()
