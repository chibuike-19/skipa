import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import load from '@commitlint/load';
import lint from '@commitlint/lint';
import { describe, expect, it } from 'vitest';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

describe('tsconfig.base.json', () => {
  const tsconfig = JSON.parse(readFileSync(here('../tsconfig.base.json'), 'utf8')) as {
    compilerOptions: Record<string, unknown>;
  };

  it('keeps the strict flags the coding standards require (brief §13)', () => {
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noUncheckedIndexedAccess).toBe(true);
  });
});

describe('commitlint config', () => {
  const check = async (message: string) => {
    const { rules, parserPreset } = await load({}, { file: here('../commitlint.js') });
    return lint(
      message,
      rules,
      parserPreset ? { parserOpts: parserPreset.parserOpts as object } : {},
    );
  };

  it('accepts a Conventional Commit with a known scope', async () => {
    expect((await check('feat(payments): verify on webhook')).valid).toBe(true);
    expect((await check('chore(repo): bootstrap monorepo')).valid).toBe(true);
  });

  it('rejects a message without a type', async () => {
    expect((await check('fixed stuff')).valid).toBe(false);
  });

  it('rejects an unknown scope, including out-of-MVP areas', async () => {
    expect((await check('feat(wallet): add balance')).valid).toBe(false);
  });
});
