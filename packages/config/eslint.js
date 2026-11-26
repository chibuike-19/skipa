// Shared ESLint flat config (typescript-eslint strict, type-aware).
// The lint toolchain (eslint, typescript-eslint, TypeScript 6.0.3 for its parser) is installed at
// the repo root; see docs/adr/ADR-32-typescript-7-and-lint-toolchain.md.
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { fixupPluginRules } from '@eslint/compat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

// Money is integer kobo through packages/domain/money.ts; floats never touch amounts.
const MONEY_SELECTORS = [
  {
    selector:
      "CallExpression[callee.name='parseFloat'], CallExpression[callee.property.name='parseFloat']",
    message: 'Use parseNaira() or koboFromDb() from @skipa/domain/money.',
  },
  {
    selector: "CallExpression[callee.property.name='toFixed']",
    message: 'Use formatNaira() from @skipa/domain/money.',
  },
];

// No raw colours in frontend code: tokens only (brief §8.2).
const COLOUR_SELECTORS = [
  {
    selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b|\\b(?:rgba?|hsla?)\\(/]',
    message: 'No raw colour values: use a token utility (bg-surface, text-muted, …).',
  },
  {
    selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b|\\b(?:rgba?|hsla?)\\(/]',
    message: 'No raw colour values: use a token utility (bg-surface, text-muted, …).',
  },
];

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
      'no-restricted-syntax': ['error', ...MONEY_SELECTORS],
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
    },
  },
  {
    // Test doubles often stand in for async handlers without awaiting anything.
    files: ['**/*.test.ts', '**/test/**/*.ts'],
    rules: { '@typescript-eslint/require-await': 'off' },
  },
  prettier,
);

const FRONTEND = ['apps/{shopper,exit,store,admin}/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'];

// Frontend preset (brief §16): React hooks rules, jsx-a11y (strict) and browser globals for the four
// apps and packages/ui, plus the no-raw-colour rule. eslint-plugin-jsx-a11y 6.10.2 declares
// ESLint ≤ 9; @eslint/compat's fixupPluginRules adapts it to ESLint 10 (frontend F0 question 2).
// Canvas art (packages/ui/src/art), the gallery and tests may use raw colours; money rules stay.
export const react = defineConfig(
  {
    files: FRONTEND,
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      // react-hooks 7.1.1's rule types predate ESLint 10's Plugin type; the runtime shape is correct.
      'react-hooks': /** @type {import('eslint').ESLint.Plugin} */ (
        /** @type {unknown} */ (reactHooks)
      ),
      'jsx-a11y': fixupPluginRules(jsxA11y),
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.strict.rules,
      'no-restricted-syntax': ['error', ...MONEY_SELECTORS, ...COLOUR_SELECTORS],
    },
  },
  {
    files: [
      'packages/ui/src/art/**',
      'packages/ui/gallery/**',
      'apps/*/src/**/*.test.{ts,tsx}',
      'packages/ui/src/**/*.test.{ts,tsx}',
    ],
    rules: { 'no-restricted-syntax': ['error', ...MONEY_SELECTORS] },
  },
);
