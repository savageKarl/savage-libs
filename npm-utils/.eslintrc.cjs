module.exports = {
	extends: [
		'eslint-config-standard',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:prettier/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['promise', 'prettier', 'tsdoc'],
	root: true,
	env: {
		commonjs: true
	},
	rules: {
		'tsdoc/syntax': 'warn',
		'prettier/prettier': 'error', // 对于不符合prettier报eslint错误"rules": {

		'@typescript-eslint/no-explicit-any': ['off'],
		'@typescript-eslint/no-var-requires': ['off']
	},
	parserOptions: { ecmaVersion: 6, sourceType: 'module' }
}
