import { cdn } from 'vite-plugin-us/cdn/cdn'

describe('CDN', () => {
	test('cdnList', () => {
		expect(cdn.listGet().length).toEqual(8)
	})

	test('cdnLeading', () => {
		expect(cdn.leadingDomesticCDNGet().name).toEqual('npmmirror')
		expect(cdn.leadingForignCDNGet().name).toEqual('jsdelivr')
	})
})
