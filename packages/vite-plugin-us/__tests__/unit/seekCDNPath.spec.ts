import { removeBeginDot } from '../../src/cdn/seekCdnPath'

describe('removeBeginDot', () => {
	it('should remove start dot of path', () => {
		expect(removeBeginDot('./foo/bar/jack')).toBe('/foo/bar/jack')
		expect(removeBeginDot('/abc/xyz')).toBe('/abc/xyz')
		expect(removeBeginDot('asdf/hjkl')).toBe('/asdf/hjkl')
	})
})
