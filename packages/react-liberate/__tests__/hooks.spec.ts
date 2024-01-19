// @vitest-environment happy-dom
import { renderHook, act } from '@testing-library/react'
import { useState } from 'react'
// import { useReactiveState, useRefState } from '../src/hooks'

// describe('hooks', () => {
// 	// it('useRefState', () => {
// 	// 	const count = renderHook(useRefState)
// 	// })
// 	it('test count update', () => {
// 		const { result } = renderHook(() => useState({ count: 0 }))
// 		const [state, setState] = result.current
// 		setState({ count: state.count + 1 })
// 		expect(state).toBe({ count: 1 })
// 	})
// 	it('useReactiveState', () => {})
// })

type UseCounterProps = {
	initialCount?: number
}

export const useCounter = ({ initialCount = 0 }: UseCounterProps = {}) => {
	const [count, setCount] = useState(initialCount)

	const increment = () => {
		setCount(prevCount => prevCount + 1)
	}

	return { count, increment }
}

describe('useCounter', () => {
	test('should render the initial count', () => {
		const { result } = renderHook(useCounter)
		expect(result.current.count).toBe(0)
	})
})

test('should accept and render the same initial count', () => {
	const { result } = renderHook(useCounter, {
		initialProps: { initialCount: 10 }
	})
	expect(result.current.count).toBe(10)
})

test('should increment the count', () => {
	const { result } = renderHook(useCounter)
	act(() => result.current.increment())
	expect(result.current.count).toBe(1)
})

test('shit', () => {
	console.log(globalThis.console)
	expect(globalThis).toBe(false)
})
