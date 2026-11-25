import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      // Work around a known `globals` key with stray whitespace (breaks ESLint flat config).
      globals: Object.fromEntries(
        Object.entries(globals.browser).map(([key, value]) => [key.trim(), value])
      ),
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      // This codebase doesn't use PropTypes (and relies on other typing patterns).
      'react/prop-types': 'off',
      // Allow apostrophes in copy without forcing HTML entities.
      'react/no-unescaped-entities': 'off',
      // React 17+ JSX transform: importing React is optional and often unused.
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Tooling/config files run in Node (or ESM) context.
  {
    files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.js'],
    languageOptions: {
      globals: Object.fromEntries(
        Object.entries(globals.node).map(([key, value]) => [key.trim(), value])
      ),
    },
  },
]
