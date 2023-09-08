module.exports = {
	extends: [
		'eslint-config-standard',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:prettier/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint/eslint-plugin',
		'promise',
		'tsdoc',
		'jest',
		'prettier'
	],
	root: true,
	env: {
		node: true,
		es6: true,
		commonjs: true
	},
	rules: {
		'prettier/prettier': 'error',
		'@typescript-eslint/ban-ts-comment': 0,
		'tsdoc/syntax': 'warn'
	},
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	overrides: [
		{
			files: ['**/__tests__/**', 'packages/dts-test/**'],
			rules: {
				'no-restricted-globals': 'off',
				'no-restricted-syntax': 'off',
				'jest/no-disabled-tests': 'error',
				'jest/no-focused-tests': 'error'
			}
		}
	]
}
