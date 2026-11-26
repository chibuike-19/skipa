// pnpm contract:build   writes api/openapi.v1.yaml from the Zod source
// pnpm contract:check   fails if the committed file differs from a fresh build
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { buildYaml } from '../src/openapi/document.ts';

const target = fileURLToPath(new URL('../../../api/openapi.v1.yaml', import.meta.url));
const generated = buildYaml();

if (process.argv.includes('--check')) {
  const committed = readFileSync(target, 'utf8');
  if (committed !== generated) {
    process.stderr.write(
      'api/openapi.v1.yaml is out of date with packages/contracts.\n' +
        'Run `pnpm contract:build` and commit the result (label the PR contract-change).\n',
    );
    process.exit(1);
  }
  process.stdout.write('api/openapi.v1.yaml matches packages/contracts\n');
} else {
  writeFileSync(target, generated);
  process.stdout.write('wrote api/openapi.v1.yaml\n');
}
