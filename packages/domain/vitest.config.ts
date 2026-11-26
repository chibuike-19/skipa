import { defineConfig } from 'vitest/config';

import { projectDefaults, rootDefaults } from '@skipa/config/vitest';

export default defineConfig({
  test: {
    ...rootDefaults,
    ...projectDefaults,
    coverage: {
      ...rootDefaults.coverage,
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      // Brief §14: at least 90% line coverage in packages/domain.
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
});
