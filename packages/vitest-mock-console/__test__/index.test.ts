import { mockConsole } from '../src/index'

describe('mock console', () => {
	it('should match the arguments', () => {
		console.log = vi.fn(() => 'log called')
		console.error = vi.fn(() => 'error called')
		console.warn = vi.fn(() => 'warn called')

		const cancelMock = mockConsole()
		console.log('foo')
		expect(console.log).toHaveBeenCalled()
		expect(console.log).toHaveBeenCalledWith('foo')
		expect(console.log).toHaveBeenCalledTimes(1)

		console.log('foo', 'bar')
		expect(console.log).toHaveBeenLastCalledWith('foo', 'bar')

		cancelMock()
	})

	it('should match the resturn values', () => {
		const cancelMock = mockConsole()
		console.log('foo', 'bar')
		expect(console.log).toHaveReturned()
		expect(console.log).toHaveLastReturnedWith(['foo', 'bar'])
		cancelMock()
	})

	it('should can cancel mock', () => {
		const cancelMock = mockConsole()

		console.error('hello')
		expect(console.error).toHaveBeenCalled()
		cancelMock()
		console.error()
		expect(console.error).toReturnWith('error called')
	})
})
