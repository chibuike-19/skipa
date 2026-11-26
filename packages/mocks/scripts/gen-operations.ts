// pnpm --filter @skipa/mocks mocks:gen → src/generated/operations.ts (operation index for the browser).
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { listOperations, loadSpec, renderOperationsModule } from './contract.ts';

const target = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'generated',
  'operations.ts',
);
const operations = listOperations(await loadSpec());
writeFileSync(target, renderOperationsModule(operations));
process.stdout.write(`mocks: ${operations.length} operations → ${target}\n`);
