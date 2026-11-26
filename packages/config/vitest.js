// Shared Vitest defaults. Packages spread this into their own vitest.config.ts.
/** @type {import('vitest/config').ViteUserConfig['test']} */
export const testDefaults = {
  include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
  environment: 'node',
  passWithNoTests: false,
  coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
};
