// Shared ESLint flat config (typescript-eslint strict, type-aware).
// The lint toolchain (eslint, typescript-eslint, TypeScript 6.0.3 for its parser) is installed at
// the repo root; see docs/adr/ADR-32-typescript-7-and-lint-toolchain.md.
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const base = defineConfig(
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: { allowDefaultProject: ['*.js'] },
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Money is integer kobo through packages/domain/money.ts; floats never touch amounts.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name='parseFloat'], CallExpression[callee.property.name='parseFloat']",
          message: 'Use parseNaira() or koboFromDb() from @skipa/domain/money.',
        },
        {
          selector: "CallExpression[callee.property.name='toFixed']",
          message: 'Use formatNaira() from @skipa/domain/money.',
        },
      ],
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
    },
  },
  prettier,
);
