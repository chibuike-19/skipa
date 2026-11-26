import { base } from '@skipa/config/eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
      'docs/architecture-pack/**',
    ],
  },
  ...base,
];
