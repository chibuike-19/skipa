// pnpm mocks:validate (brief §5): every mock response, in every scenario, must match the contract.
//
//   1. Each fixture in fixtures/*.json validates against its named schema (same as validate_fixtures.py).
//   2. src/generated/operations.ts matches the contract (no drift).
//   3. Every sample request of every mock validates against the operation's request schema, and
//      every response (each built scenario) has a documented status and a body matching its schema.
//
// Exits 1 on any failure. Also prints how many operations are mocked so far.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { OPERATIONS, type OperationId } from '../src/generated/operations.ts';
import { MOCKED_OPERATIONS, MOCKS } from '../src/index.ts';
import { createMockServer } from '../src/node.ts';
import { SCENARIOS, setScenario, type Scenario } from '../src/scenarios.ts';
import { resetState } from '../src/state.ts';
import { createValidator, listOperations, loadSpec, renderOperationsModule } from './contract.ts';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'http://localhost:4000';

/** Scenarios in which an operation is expected to fail at the network level. */
const NETWORK_DOWN: Partial<Record<Scenario, (op: OperationId) => boolean>> = {
  offline: () => true,
  'exit-no-connection': (op) => op === 'exitLookup' || op === 'exitHeartbeat',
};

export interface ValidationReport {
  failures: string[];
  checked: number;
  mocked: number;
  total: number;
}

export async function runValidation(): Promise<ValidationReport> {
  const spec = await loadSpec();
  const v = await createValidator(spec);
  const failures: string[] = [];
  let checked = 0;

  // 1. Fixtures
  const fixtureDir = join(pkg, 'fixtures');
  for (const file of readdirSync(fixtureDir)
    .filter((f) => f.endsWith('.json'))
    .sort()) {
    const fixture = JSON.parse(readFileSync(join(fixtureDir, file), 'utf8')) as {
      schema: string;
      data: unknown;
    };
    const errors = v.schema(fixture.schema, fixture.data);
    checked += 1;
    if (errors.length > 0)
      failures.push(`fixture ${file} (${fixture.schema}): ${errors.join('; ')}`);
  }

  // 2. Generated operation index
  const fresh = renderOperationsModule(listOperations(spec));
  const committed = readFileSync(join(pkg, 'src', 'generated', 'operations.ts'), 'utf8');
  if (fresh !== committed)
    failures.push(
      'src/generated/operations.ts is stale: run `pnpm --filter @skipa/mocks mocks:gen`',
    );

  // 3. Handlers × samples × scenarios
  const server = createMockServer();
  server.listen({ onUnhandledFrame: 'error' });
  try {
    const scenarios = (Object.keys(SCENARIOS) as Scenario[]).filter((s) => SCENARIOS[s].built);
    for (const m of MOCKS) {
      const op = OPERATIONS[m.operationId];
      for (const [i, sample] of m.samples.entries()) {
        const label = `${m.operationId} sample ${i + 1}`;
        if (op.idempotent && sample.headers?.['Idempotency-Key'] === undefined) {
          failures.push(`${label}: operation needs an Idempotency-Key; add one to the sample`);
        }
        const reqErrors = v.request(m.operationId, sample.body);
        if (reqErrors.length > 0) failures.push(`${label} request body: ${reqErrors.join('; ')}`);

        for (const scenario of scenarios) {
          resetState();
          setScenario(scenario);
          let path: string = op.path;
          for (const [k, val] of Object.entries(sample.params ?? {}))
            path = path.replace(`{${k}}`, encodeURIComponent(val));
          const url = new URL(path, BASE);
          for (const [k, val] of Object.entries(sample.query ?? {})) url.searchParams.set(k, val);
          const headers = new Headers(sample.headers);
          if (sample.body !== undefined) headers.set('Content-Type', 'application/json');
          let res: Response;
          try {
            res = await fetch(url, {
              method: op.method.toUpperCase(),
              headers,
              body: sample.body === undefined ? undefined : JSON.stringify(sample.body),
            });
          } catch {
            if (NETWORK_DOWN[scenario]?.(m.operationId) !== true)
              failures.push(`${label} [${scenario}]: unexpected network error`);
            checked += 1;
            continue;
          }
          if (NETWORK_DOWN[scenario]?.(m.operationId) === true) {
            failures.push(`${label} [${scenario}]: expected a network error, got ${res.status}`);
          }
          if (res.headers.get('X-Request-Id') === null)
            failures.push(`${label} [${scenario}]: no X-Request-Id header`);
          const text = await res.text();
          const body: unknown = text === '' ? undefined : JSON.parse(text);
          const errors = v.response(m.operationId, res.status, body);
          checked += 1;
          if (errors.length > 0)
            failures.push(`${label} [${scenario}] ${res.status}: ${errors.join('; ')}`);
        }
      }
    }
  } finally {
    server.close();
    setScenario('default');
    resetState();
  }

  return {
    failures,
    checked,
    mocked: MOCKED_OPERATIONS.size,
    total: Object.keys(OPERATIONS).length,
  };
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const report = await runValidation();
  for (const f of report.failures) process.stderr.write(`FAIL ${f}\n`);
  process.stdout.write(
    `mocks:validate: ${report.checked} checks, ${report.failures.length} failures. ` +
      `Mocked ${report.mocked} of ${report.total} operations; the rest answer 501 MOCK-501.\n`,
  );
  process.exitCode = report.failures.length > 0 ? 1 : 0;
}
