const DOMGlobals = ['window', 'document']
const NodeGlobals = ['module', 'require']

// eslint-disable-next-line no-restricted-globals
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
		'tsdoc/syntax': 'warn',
		'no-debugger': 'error',
		'no-unused-vars': [
			'error',
			// we are only using this rule to check for unused arguments since TS
			// catches unused variables but not args.
			{ varsIgnorePattern: '.*', args: 'none' }
		],
		// most of the codebase are expected to be env agnostic
		'no-restricted-globals': ['error', ...DOMGlobals, ...NodeGlobals],

		'no-restricted-syntax': [
			'error',
			// since we target ES2015 for baseline support, we need to forbid object
			// rest spread usage in destructure as it compiles into a verbose helper.
			'ObjectPattern > RestElement',
			// tsc compiles assignment spread into Object.assign() calls, but esbuild
			// still generates verbose helpers, so spread assignment is also prohiboted
			'ObjectExpression > SpreadElement'
			// 'AwaitExpression'
		]
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
		},
		// Node scripts
		{
			files: ['scripts/**', '*.{js,ts}', 'packages/**/index.js'],
			rules: {
				'no-restricted-globals': 'off',
				'no-restricted-syntax': 'off'
			}
		}
	]
}
