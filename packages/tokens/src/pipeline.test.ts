import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from '@tailwindcss/node';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  brandAliases,
  buildTokens,
  FONT_FILES,
  parseTokens,
  resolve,
  themeKey,
  type TokenOutputs,
} from './pipeline.ts';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(pkg, 'src', 'tokens.css'), 'utf8');
const tokens = parseTokens(source);
let out: TokenOutputs;

beforeAll(() => {
  out = buildTokens(source);
});

describe('source', () => {
  it('is tokens.css v1.1 from the canvas, unchanged', () => {
    expect(source.startsWith('/* Skipa design tokens v1.1')).toBe(true);
    expect(source).toContain('/* ---------- v1.1 additions (Stage 7 review) ---------- */');
  });

  it('has the three brand modes plus the Skipa reset block', () => {
    expect([...tokens.brands.keys()].sort()).toEqual(['adunni', 'harbour', 'skipa']);
  });
});

describe('dist/tokens.css', () => {
  it('keeps the whole source, brand blocks and the reduced-motion rule', () => {
    expect(out.tokensCss).toContain(source);
    expect(out.tokensCss).toContain('[data-brand="adunni"]');
    expect(out.tokensCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('recomputes aliases of brand slots inside every brand scope', () => {
    // --color-text-link points at a brand slot; on :root alone it would stay Skipa indigo in a store.
    expect(brandAliases(tokens).get('--color-text-link')).toBe('--color-brand-primary-text');
    expect(out.tokensCss).toContain(
      '[data-brand]{--color-text-link:var(--color-brand-primary-text)}',
    );
  });
});

describe('dist/tailwind-theme.css', () => {
  it('maps every semantic token and no primitive', () => {
    const semantic = [...tokens.root.keys()].filter((n) => themeKey(n) !== undefined);
    for (const name of semantic) expect(out.themeCss).toContain(`${themeKey(name) ?? ''}: var(`);
    for (const primitive of [
      '--indigo-700',
      '--sand-100',
      '--green-700',
      '--exit-yellow',
      '--paper',
      '--ink',
    ]) {
      expect(themeKey(primitive)).toBeUndefined();
    }
  });

  it('exposes nothing with a raw colour value', () => {
    const body = out.themeCss.slice(out.themeCss.indexOf('@theme'));
    expect(body).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(body).not.toMatch(/rgba?\(/);
  });

  describe('compiled with Tailwind 4', () => {
    let css: (classes: string[]) => string;

    beforeAll(async () => {
      const compiler = await compile(`@import 'tailwindcss';\n${out.themeCss}`, {
        base: pkg,
        onDependency: () => undefined,
      });
      css = (classes) => compiler.build(classes);
    });

    it.each([
      ['bg-surface', 'background-color: var(--color-bg-surface)'],
      ['text-primary', 'color: var(--color-text-primary)'],
      ['text-link', 'color: var(--color-brand-primary-text)'],
      ['border-subtle', 'border-color: var(--color-border-subtle)'],
      ['bg-brand-primary', 'background-color: var(--color-brand-primary)'],
      ['text-brand-on-primary', 'color: var(--color-brand-on-primary)'],
      ['bg-status-success', 'background-color: var(--color-status-success)'],
      ['bg-exit-clear', 'background-color: var(--color-exit-clear)'],
      ['fill-chart-1', 'fill: var(--chart-1)'],
      ['p-4', 'padding: var(--space-4)'],
      ['gap-5', 'gap: var(--space-5)'],
      ['min-h-tap', 'min-height: var(--tap-min)'],
      ['rounded-lg', 'border-radius: var(--radius-lg)'],
      ['rounded-pill', 'border-radius: var(--radius-pill)'],
      ['font-display', 'font-family: var(--font-display)'],
      ['ease-enter', 'transition-timing-function: var(--ease-enter)'],
      ['duration-base', 'transition-duration: var(--dur-base)'],
    ])('%s → %s', (cls, decl) => {
      expect(css([cls])).toContain(decl);
    });

    it('defines no variables of its own on :root (tokens.css is the only source)', () => {
      expect(css(['bg-brand-primary', 'rounded-lg'])).not.toMatch(/--color-brand-primary\s*:/);
    });

    it.each([
      'bg-red-500',
      'text-white',
      'bg-black',
      'p-11',
      'w-12',
      'rounded-3xl',
      'shadow-lg',
      'text-sm',
      'bg-indigo-700',
      'bg-sand-100',
    ])('%s does not exist', (cls) => {
      expect(css([cls])).not.toMatch(new RegExp(`\\.${cls}\\s*\\{`));
    });
  });
});

describe('dist/tokens.ts', () => {
  it('resolves values in Skipa mode and in each brand', () => {
    expect(out.tokensTs).toContain('"bg-surface": "#FFFFFF"');
    expect(resolve(tokens, '--color-brand-primary', 'adunni')).toBe('#7A1F4A');
    expect(resolve(tokens, '--color-brand-primary', 'harbour')).toBe('#B3400F');
    expect(resolve(tokens, '--color-text-link', 'harbour')).toBe('#B3400F');
    expect(resolve(tokens, '--color-status-success', 'adunni')).toBe('#0A7A3E'); // never branded
  });

  it('is importable and typed as const', async () => {
    // The build script writes this same string; load it from a data URL (types stripped) to check it runs.
    const mod = (await import(
      `data:text/javascript,${encodeURIComponent(out.tokensTs.replace(/ as const;/g, ';').replace(/^export type .*$/gm, ''))}`
    )) as {
      brands: Record<string, Record<string, string>>;
      textStyles: Record<string, { fontSize: number; fontFamily: string; tabularNums?: boolean }>;
      space: Record<string, string>;
    };
    expect(Object.keys(mod.brands).sort()).toEqual(['adunni', 'harbour', 'skipa']);
    expect(mod.brands.adunni?.['primary']).toBe('#7A1F4A');
    expect(mod.textStyles['t-exit-result']).toMatchObject({ fontSize: 56, fontFamily: 'display' });
    expect(mod.textStyles['t-money']?.tabularNums).toBe(true);
    expect(mod.space['4']).toBe('16px');
  });
});

describe('fonts', () => {
  it('are self-hosted, swap, and never load from a CDN', () => {
    expect(out.fontsCss).not.toMatch(/https?:\/\//);
    expect(out.fontsCss.match(/font-display:swap/g)).toHaveLength(2);
    expect(out.fontsCss).toContain('U+20A6'); // ₦
  });

  it('ship within the AD §8.5 budget (Inter ≤ 60 KB, Bricolage ≤ 35 KB)', () => {
    const fonts = join(pkg, 'fonts');
    expect(
      readdirSync(fonts)
        .filter((f) => f.endsWith('.woff2'))
        .sort(),
    ).toEqual(Object.values(FONT_FILES).sort());
    expect(statSync(join(fonts, FONT_FILES.inter)).size).toBeLessThanOrEqual(60 * 1024);
    expect(statSync(join(fonts, FONT_FILES.bricolage)).size).toBeLessThanOrEqual(35 * 1024);
  });
});
