module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: { jsx: true, useJSXTextNode: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'no-console': 2,
    'arrow-parens': ['error', 'always'],
    'react/prop-types': 0,
    'no-async-promise-executor': 0,
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      { classes: false, functions: false, variables: false },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { vars: 'all', args: 'none', ignoreRestSiblings: true },
    ],

    // https://reactjs.org/docs/hooks-rules.html#eslint-plugin
    'react-hooks/rules-of-hooks': 'error', // Check rules of hooks
    'react-hooks/exhaustive-deps': 'warn', // Check effect dependencies
  },
};
