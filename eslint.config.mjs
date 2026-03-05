// See: https://eslint.org/docs/latest/use/configure/configuration-files

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import jest from 'eslint-plugin-jest'
import prettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['**/coverage', '**/dist', '**/linter', '**/node_modules']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jest.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      },

      ecmaVersion: 2023,
      sourceType: 'module',

      parserOptions: {
        projectService: {
          allowDefaultProject: [
            '__fixtures__/*.ts',
            '__tests__/*.ts',
            'eslint.config.mjs',
            'jest.config.js',
            'rollup.config.ts'
          ]
        },
        tsconfigRootDir: import.meta.dirname
      }
    },

    rules: {
      camelcase: 'off',
      'no-console': 'off',
      'no-shadow': 'off',
      'no-unused-vars': 'off',
      'prettier/prettier': 'error'
    }
  }
)
