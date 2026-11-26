// pnpm tokens:build → packages/tokens/dist/{tokens.css,tailwind-theme.css,fonts.css,tokens.ts}
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTokens } from '../src/pipeline.ts';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(pkg, 'dist');
const result = buildTokens(readFileSync(join(pkg, 'src', 'tokens.css'), 'utf8'));

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'tokens.css'), result.tokensCss);
writeFileSync(join(out, 'tailwind-theme.css'), result.themeCss);
writeFileSync(join(out, 'fonts.css'), result.fontsCss);
writeFileSync(join(out, 'tokens.ts'), result.tokensTs);
process.stdout.write(`tokens: wrote 4 files to ${out}\n`);
