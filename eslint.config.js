import js from '@eslint/js'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier'
import jest from 'eslint-plugin-jest'

export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
    },
    plugins: {
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^__' }],
      'no-console': 'warn',
      'no-var': 'error',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'curly': ['error', 'all'],
      'consistent-return': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
    },
  },
  {
    files: ['src/**/*.test.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      jest,
    },
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/prefer-expect-assertions': 'off',
    },
  },
]
