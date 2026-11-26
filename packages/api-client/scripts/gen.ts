// pnpm api-client:gen → src/generated/schema.ts (brief §5: never hand-write request/response types).
//
// openapi-typescript builds its output with the TypeScript compiler API, which TypeScript 7.0.2
// does not ship (ADR-32). This package type-checks with 7.0.2, so `typescript` resolves to 7 here.
// The hook below sends openapi-typescript's own `import 'typescript'` to the `typescript-6` alias
// (6.0.3) and leaves every other import alone. See docs/adr/ADR-36.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ts6 = pathToFileURL(createRequire(import.meta.url).resolve('typescript-6')).href;

registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier === 'typescript' &&
      context.parentURL?.includes('/openapi-typescript/') === true
    ) {
      return { url: ts6, shortCircuit: true, format: 'commonjs' };
    }
    return next(specifier, context);
  },
});

const { default: openapiTS, astToString } = await import('openapi-typescript');

export const CONTRACT = join(here, '..', '..', '..', 'api', 'openapi.v1.yaml');
export const TARGET = join(here, '..', 'src', 'generated', 'schema.ts');

export async function generate(): Promise<string> {
  const ast = await openapiTS(pathToFileURL(CONTRACT), {
    // Optional properties stay optional; `null` only where the contract says so.
    exportType: true,
    alphabetize: true,
  });
  return (
    '// Generated from api/openapi.v1.yaml by `pnpm api-client:gen` (openapi-typescript). Do not edit.\n' +
    '// A test fails when this file and the contract disagree.\n\n' +
    astToString(ast)
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const check = process.argv.includes('--check');
  const fresh = await generate();
  if (check) {
    const stale = readFileSync(TARGET, 'utf8') !== fresh;
    process.stdout.write(
      stale
        ? 'api-client: schema.ts is stale, run pnpm api-client:gen\n'
        : 'api-client: schema.ts is current\n',
    );
    process.exitCode = stale ? 1 : 0;
  } else {
    writeFileSync(TARGET, fresh);
    process.stdout.write(`api-client: wrote ${TARGET}\n`);
  }
}
