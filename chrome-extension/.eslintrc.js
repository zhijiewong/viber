module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // General rules
    'no-console': 'off', // Allow console in Chrome extension
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // Chrome extension specific
    'no-restricted-globals': 'off', // Allow window/document in content scripts
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  globals: {
    chrome: 'readonly',
    globalThis: 'readonly',
  },
};
