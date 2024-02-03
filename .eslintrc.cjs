const NodeGlobals = ['module', 'require']

module.exports = {
  extends: [
    'eslint-config-standard',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'promise', 'tsdoc', 'jest'],
  root: true,
  env: {
    node: true,
    es6: true,
    commonjs: true
  },
  rules: {
    '@typescript-eslint/no-non-null-assertion': 0,
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
    'no-restricted-globals': ['error', ...NodeGlobals],
    '@typescript-eslint/no-explicit-any': 0
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  overrides: [
    {
      files: ['**/__tests__/**'],
      rules: {
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off',
        'jest/no-disabled-tests': 'error',
        'jest/no-focused-tests': 'error'
      }
    },
    {
      files: ['packages/*/playground/**/*.js', '.eslintrc.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-restricted-globals': 'off'
      }
    }
  ]
}
