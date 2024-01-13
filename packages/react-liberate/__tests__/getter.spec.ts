import { defineStore } from '../src'

describe('Getters', () => {
	const useStore = defineStore('main', {
		state: () => ({
			name: 'Eduardo'
		}),
		getters: {
			upperCaseName() {
				return this.name.toUpperCase()
			},
			doubleName(): string {
				return this.upperCaseName
			},
			composed(): string {
				return this.upperCaseName + ': ok'
			},
			arrowUpper(): string {
				return this.name.toUpperCase()
			}
		},
		actions: {
			o() {
				this.arrowUpper.toUpperCase()
				this.o().toUpperCase()
				return 'a string'
			}
		}
	})

	beforeEach(() => {
		const store = useStore()
		store.$reset()
	})

	const useB = defineStore('B', {
		state: () => ({ b: 'b' })
	})

	const useA = defineStore('A', {
		state: () => ({ a: 'a' }),
		getters: {
			fromB(): string {
				const bStore = useB()
				return this.a + ' ' + bStore.b
			}
		}
	})

	it('adds getters to the store', () => {
		const store = useStore()
		expect(store.upperCaseName).toBe('EDUARDO')

		store.name = 'Ed'
		expect(store.upperCaseName).toBe('ED')
	})

	it('updates the value', () => {
		const store = useStore()
		store.name = 'Ed'
		expect(store.upperCaseName).toBe('ED')
	})

	it('supports changing between applications', () => {
		const aStore = useA()

		const bStore = useB()
		bStore.b = 'c'

		aStore.a = 'b'
		expect(aStore.fromB).toBe('b c')
	})

	it('can use other getters', () => {
		const store = useStore()
		expect(store.composed).toBe('EDUARDO: ok')
		store.name = 'Ed'
		expect(store.composed).toBe('ED: ok')
	})
})
