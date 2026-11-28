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
      'apps/*/src/routeTree.gen.ts',
      'apps/*/dev-dist/**',
    ],
  },
  ...base,
  ...react,
  {
    // TanStack Router's control flow is `throw redirect(…)` / `throw notFound()`; allow exactly
    // those two, every other throw must still be an Error.
    files: ['apps/*/src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: ['Redirect', 'NotFoundError'],
            },
          ],
        },
      ],
    },
  },
];
