import { defineConfig } from 'vitest/config';

import { rootDefaults } from '@skipa/config/vitest';

export default defineConfig({
  test: {
    ...rootDefaults,
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
  },
});
