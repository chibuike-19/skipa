// Guards for the styling rules (brief §8.2, AD §8.8):
//   1. No raw colour values in components (art under src/art is the canvas-listed exception).
//   2. Every class in a component's class strings compiles with the Skipa token theme. The theme
//      removes Tailwind's default palette and spacing scale, so `bg-red-500`, `text-white` or
//      `h-10` (which would mean the 80 px space token, not 40 px) fail here instead of silently
//      producing nothing or the wrong size.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from '@tailwindcss/node';
import { beforeAll, describe, expect, it } from 'vitest';

import { GLYPHS } from './Icon.tsx';
import { STATUSES } from './StatusChip.tsx';

const src = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(src)
  .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && f !== 'test-setup.ts')
  .map((f) => ({ name: f, text: readFileSync(join(src, f), 'utf8') }));

/** Classes defined in tokens.css (text styles, behaviour, animation helpers) and styles.css. */
const TOKEN_CLASSES = /^(sk|t-[a-z0-9-]+|sk-[a-z-]+)$/;

/** Literals that look like class lists but are attribute values. */
const NOT_CLASSES = new Set([
  'one-time-code',
  'image/png,image/svg+xml',
  'aria-current',
  'aria-hidden',
  'aria-label',
  'date-range',
  ...Object.keys(GLYPHS),
  ...Object.keys(STATUSES),
]);

/** Width/height/size utilities must use px or keywords, never the spacing scale (see header). */
const SCALE_DIMENSION = /^(?:[a-z-]+:)*-?(?:w|h|size|min-w|min-h|max-w|max-h)-(?!0$)\d/;

function classLiterals(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) {
    const literal = m[2] ?? '';
    if (literal.includes('${') || literal.trim() === '') continue;
    const tokens = literal.trim().split(/\s+/);
    const classy =
      tokens.every((t) => /^[!-]?[a-z0-9[\]():/._%=,'*>+&-]+$/.test(t)) &&
      tokens.some((t) => /[-:[]/.test(t));
    if (classy && !NOT_CLASSES.has(literal) && !/^(?:\.\/|@|var\()/.test(literal))
      out.push(...tokens);
  }
  return out;
}

describe('no raw colours (brief §8.2)', () => {
  it.each(files.map((f) => [f.name, f.text] as const))(
    '%s has no hex, rgb() or hsl() colour',
    (_name, text) => {
      const code = text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(code).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(code).not.toMatch(/\b(?:rgba?|hsla?)\(/);
    },
  );
});

describe('every class compiles against the token theme', () => {
  let build: (classes: string[]) => string;

  beforeAll(async () => {
    const css = readFileSync(join(src, 'styles.css'), 'utf8').replace(/@source[^;]*;/, '');
    const compiler = await compile(css, { base: src, onDependency: () => undefined });
    build = (c) => compiler.build(c);
  });

  const all = [...new Set(files.flatMap((f) => classLiterals(f.text)))].sort();

  it('finds the component class strings', () => {
    expect(all.length).toBeGreaterThan(200);
  });

  it.each(all.filter((c) => !TOKEN_CLASSES.test(c)))('%s', (cls) => {
    expect(
      SCALE_DIMENSION.test(cls),
      `${cls}: use px (w-[48px]) or a keyword, not the spacing scale`,
    ).toBe(false);
    const escaped = cls.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
    expect(build([cls]), `${cls} produced no CSS`).toContain(`.${escaped}`);
  });
});
