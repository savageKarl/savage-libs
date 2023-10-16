import { mdtable } from 'savage-mdtable'
import type { TableOptions } from 'savage-mdtable'

const options: TableOptions = {
	header: ['A', 'B', 'C'],
	alignment: ['R', 'C', 'L'],
	rows: [
		['1', '2', '3'],
		['4', '5', '6'],
		['7', '8', '9']
	]
}

test('basic table', () => {
	const expected = `
| A | B | C |
|--:|:-:|:--|
| 1 | 2 | 3 |
| 4 | 5 | 6 |
| 7 | 8 | 9 |
    `.trim()

	expect(mdtable(options)).toBe(expected)
})

test('table with extra padding', () => {
	const expected = `
|   A   |   B   |   C   |
|------:|:-----:|:------|
|   1   |   2   |   3   |
|   4   |   5   |   6   |
|   7   |   8   |   9   |
    `.trim()

	expect(mdtable(Object.assign({}, { padding: 3 }, options))).toBe(expected)
})

test('table with different alignments', () => {
	const expected = `
| A | B | C |
|:--|:-:|--:|
| 1 | 2 | 3 |
| 4 | 5 | 6 |
| 7 | 8 | 9 |
    `.trim()

	expect(
		mdtable(
			Object.assign({}, options, {
				alignment: ['L', 'C', 'R']
			})
		)
	).toBe(expected)
})

test('table with per-column padding', () => {
	const expected = `
| A | BB | CCC |
|--:|:--:|:----|
| 1 | 2  |  3  |
| 4 | 5  |  6  |
| 7 | 8  |  9  |
`

	expect(mdtable(Object.assign(options, { header: ['A', 'BB', 'CCC'] }))).toBe(
		expected.trim()
	)
})
