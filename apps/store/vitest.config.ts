import { defineConfig } from 'vitest/config';

import { rootDefaults } from '@skipa/config/vitest';

export default defineConfig({
  test: {
    ...rootDefaults,
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'happy-dom',
    // MSW mocks match any origin. The page shares the API's test origin so happy-dom skips the
    // CORS preflight (the real API answers it; the mocks don't). https keeps Semgrep's rule quiet.
    env: { VITE_API_URL: 'https://api.test.skipa.example' },
    environmentOptions: { happyDOM: { url: 'https://api.test.skipa.example/' } },
  },
});
