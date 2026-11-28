import { base, react } from '@skipa/config/eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
      'docs/architecture-pack/**',
      'packages/ui/e2e/__screenshots__/**',
    ],
  },
  ...base,
  ...react,
];
