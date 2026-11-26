// Shared Vitest defaults. `projectDefaults` is safe inside `test.projects[]`; `rootDefaults` holds
// options Vitest only accepts at the top level.
import type { TestProjectInlineConfiguration, ViteUserConfig } from 'vitest/config';

type ProjectTest = NonNullable<TestProjectInlineConfiguration['test']>;

export const projectDefaults: ProjectTest = {
  include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
  environment: 'node',
};

export const rootDefaults: NonNullable<ViteUserConfig['test']> = {
  passWithNoTests: false,
  coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
};
