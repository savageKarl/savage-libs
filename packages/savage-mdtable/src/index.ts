export interface TableOptions {
	/**
	 * the header of the table
	 */
	header: string[]
	/**
	 * alignment of table columns
	 */
	alignment: ('L' | 'C' | 'R')[]
	/**
	 * each row of data in the table
	 */
	rows: string[][]
	/**
	 *  add a space of padding between delimiters and cells
	 * @defaultValue 1
	 */
	padding?: number
}

function padLR(target: string, width: number) {
	const len = width - target.length
	const side = len / 2
	const char = ' '
	const remainder = len % 2 > 0

	return `${char.repeat(side)}${target}${char.repeat(side)}${
		remainder ? char : ''
	}`
}

class Table {
	private options: Required<TableOptions>
	private columnLens: number[] = []

	constructor(options: TableOptions) {
		this.options = Object.assign(
			{ padding: 1 },
			options
		) as Required<TableOptions>
	}

	private generateHeader() {
		return this.generateRow(this.options.header)
	}

	private generateAlignments() {
		const str = this.options.alignment
			// eslint-disable-next-line array-callback-return
			.map((v, i) => {
				switch (v) {
					case 'L':
						return `:${'-'.repeat(this.columnLens[i] - 1)}`
					case 'C':
						return `:${'-'.repeat(this.columnLens[i] - 2)}:`
					case 'R':
						return `${'-'.repeat(this.columnLens[i] - 1)}:`
				}
			})
			.join('|')

		return `|${str}|`
	}

	private generateRow(row: TableOptions['rows'][number]) {
		const str = row.map((v, i) => padLR(v, this.columnLens[i])).join('|')

		return `|${str}|`
	}

	private generateRows() {
		return this.options.rows.map(v => this.generateRow(v)).join('\n')
	}

	public genereate() {
		const { header, rows, padding } = this.options

		const headerLen = header.length
		const columnLens = [
			...this.options.header,
			...([] as TableOptions['rows']).concat(...rows)
		]
			.reduce((preV, curV, index) => {
				const columnIndex = index % headerLen

				if (curV.length > preV[columnIndex]) preV[columnIndex] = curV.length

				return preV
			}, new Array(headerLen).fill(1))
			.map((v: number) => v + padding * 2)

		this.columnLens = columnLens

		return [
			this.generateHeader(),
			this.generateAlignments(),
			this.generateRows()
		].join('\n')
	}
}

export function mdtable(options: TableOptions) {
	const table = new Table(options)
	return table.genereate()
}

export default mdtable
