module.exports = {
	extends: [
		'eslint-config-standard',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:prettier/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['promise', 'prettier'],
	root: true,
	env: {
		commonjs: true
	},
	rules: {
		'prettier/prettier': 'error' // 对于不符合prettier报eslint错误
	},
	parserOptions: { ecmaVersion: 6, sourceType: 'module' }
}
