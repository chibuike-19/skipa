import { defineConfig } from 'vitest/config';

import { projectDefaults, rootDefaults } from '@skipa/config/vitest';

export default defineConfig({
  test: {
    ...rootDefaults,
    // The unit project is empty until the platform plumbing lands; the int project is not.
    passWithNoTests: true,
    projects: [
      {
        test: {
          ...projectDefaults,
          name: 'unit',
          include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
        },
      },
      {
        test: {
          ...projectDefaults,
          name: 'int',
          include: ['test/int/**/*.int.test.ts'],
          globalSetup: ['test/int/global-setup.ts'],
          // One shared database per run; files run one at a time so fixtures do not interleave.
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
