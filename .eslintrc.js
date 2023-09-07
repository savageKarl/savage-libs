export default {
	extends: [
		'eslint-config-standard',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:prettier/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint/eslint-plugin', 'promise', 'tsdoc', 'prettier'],
	root: true,
	env: {
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
	}
}
