// Kept in its own file: runValidation() starts and closes its own MSW server.
import { expect, it } from 'vitest';

import { runValidation } from '../scripts/validate.ts';

it('every mock response in every built scenario matches api/openapi.v1.yaml (mocks:validate)', async () => {
  const report = await runValidation();
  expect(report.failures).toEqual([]);
  expect(report.mocked).toBeGreaterThanOrEqual(21);
}, 30_000);
