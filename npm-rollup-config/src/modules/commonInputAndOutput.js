export const commonInputAndOutput = () => {
	return {
		input: 'src/index.ts', // pack entry
		output: [
			{
				file: 'dist/index.mjs', // ouput file
				format: 'esm', // file module specifications
				sourcemap: true
			},
			{
				file: 'dist/index.cjs', // ouput file
				format: 'cjs', // file module specifications
				sourcemap: true
			}
		]
	}
}
