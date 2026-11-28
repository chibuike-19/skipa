// Token pipeline (brief §8, AD §8.8). One source, src/tokens.css (copied verbatim from the Claude
// Design canvas, tokens.css v1.1), becomes:
//   dist/tokens.css           the source, plus brand-scope re-evaluation of aliases (see below)
//   dist/tailwind-theme.css   Tailwind 4 `@theme inline` with semantic names only
//   dist/fonts.css            @font-face for the self-hosted subsets in fonts/
//   dist/tokens.ts            the same values as a typed object (charts, React Native later)
//
// Kept pure (string in, strings out) so the tests run it without touching the file system.
import postcss, { type Declaration, type Root, type Rule } from 'postcss';

export interface TokenOutputs {
  tokensCss: string;
  themeCss: string;
  fontsCss: string;
  tokensTs: string;
}

type VarMap = Map<string, string>;

export interface ParsedTokens {
  /** Every custom property declared on `:root`, in source order. */
  root: VarMap;
  /** `[data-brand="<mode>"]` blocks: mode → overridden properties. */
  brands: Map<string, VarMap>;
  /** `.t-*` text style classes: class name → declarations. */
  textStyles: Map<string, Map<string, string>>;
}

const BRAND_SELECTOR = /^\[data-brand="([a-z]+)"\]$/;
const VAR_REF = /var\((--[a-z0-9-]+)\)/g;

export function parseTokens(source: string): ParsedTokens {
  const ast: Root = postcss.parse(source);
  const root: VarMap = new Map();
  const brands = new Map<string, VarMap>();
  const textStyles = new Map<string, Map<string, string>>();

  ast.walkRules((rule: Rule) => {
    // Rules inside @media (reduced motion) only change durations; the defaults are what we export.
    if (rule.parent?.type === 'atrule') return;
    const props = (): VarMap => {
      const map: VarMap = new Map();
      rule.walkDecls((d: Declaration) => {
        if (d.prop.startsWith('--')) map.set(d.prop, d.value.trim());
      });
      return map;
    };
    if (rule.selector === ':root') {
      for (const [k, v] of props()) root.set(k, v);
      return;
    }
    const brand = BRAND_SELECTOR.exec(rule.selector);
    if (brand?.[1] !== undefined) {
      brands.set(brand[1], props());
      return;
    }
    if (/^\.t-[a-z0-9-]+$/.test(rule.selector)) {
      const decls = new Map<string, string>();
      rule.walkDecls((d: Declaration) => {
        decls.set(d.prop, d.value.trim());
      });
      textStyles.set(rule.selector.slice(1), decls);
    }
  });
  return { root, brands, textStyles };
}

/** Resolve a property to a literal value, following var() chains, under an optional brand mode. */
export function resolve(
  tokens: ParsedTokens,
  name: string,
  brand?: string,
  seen = new Set<string>(),
): string {
  if (seen.has(name)) throw new Error(`Circular token reference at ${name}`);
  seen.add(name);
  const value =
    (brand !== undefined ? tokens.brands.get(brand)?.get(name) : undefined) ??
    tokens.root.get(name);
  if (value === undefined) throw new Error(`Unknown token ${name}`);
  return value.replace(VAR_REF, (_m, ref: string) => resolve(tokens, ref, brand, new Set(seen)));
}

/** Properties a store can override at runtime (anything declared in a brand block). */
function brandSlots(tokens: ParsedTokens): Set<string> {
  const slots = new Set<string>();
  for (const block of tokens.brands.values()) for (const k of block.keys()) slots.add(k);
  return slots;
}

/**
 * `:root` properties whose value refers (directly or through other aliases) to a brand slot, e.g.
 * `--color-text-link: var(--color-brand-primary-text)`. A custom property is computed where it is
 * declared, so declared on `:root` it would keep Skipa's value inside a store-branded container.
 * Returns alias → the brand slot it finally points at.
 */
export function brandAliases(tokens: ParsedTokens): Map<string, string> {
  const slots = brandSlots(tokens);
  const out = new Map<string, string>();
  const follow = (name: string, depth: number): string | undefined => {
    if (depth > 10) return undefined;
    const m = /^var\((--[a-z0-9-]+)\)$/.exec(tokens.root.get(name) ?? '');
    const ref = m?.[1];
    if (ref === undefined) return undefined;
    return slots.has(ref) ? ref : follow(ref, depth + 1);
  };
  for (const name of tokens.root.keys()) {
    if (slots.has(name)) continue;
    const slot = follow(name, 0);
    if (slot !== undefined) out.set(name, slot);
  }
  return out;
}

/**
 * Source token → Tailwind theme key. Only semantic tokens are mapped; primitives (indigo-700,
 * sand-100, …) are deliberately left out so components cannot use them (brief §8.2).
 * Returns undefined for tokens that are not exposed as utilities.
 */
export function themeKey(name: string): string | undefined {
  let m: RegExpExecArray | null;
  if ((m = /^--color-bg-(.+)$/.exec(name))) return `--background-color-${m[1] ?? ''}`; // bg-surface
  if ((m = /^--color-text-(.+)$/.exec(name))) return `--text-color-${m[1] ?? ''}`; // text-muted
  if ((m = /^--color-border-(.+)$/.exec(name))) return `--border-color-${m[1] ?? ''}`; // border-subtle
  if (/^--color-(brand|skipa|status|exit|on-dark)-/.test(name) || name === '--color-focus')
    return name;
  if ((m = /^--chart-(.+)$/.exec(name))) return `--color-chart-${m[1] ?? ''}`; // fill-chart-1
  if ((m = /^--space-(\d+)$/.exec(name))) return `--spacing-${m[1] ?? ''}`; // p-4 = 16px
  if (name === '--tap-min') return '--spacing-tap'; // min-h-tap
  if (/^--radius-/.test(name)) return name; // rounded-lg
  if (/^--shadow-/.test(name)) return name; // shadow-2
  if (name === '--focus-ring') return '--shadow-focus'; // shadow-focus
  if (/^--font-(ui|display)$/.test(name)) return name; // font-ui
  if (/^--ease-/.test(name)) return name; // ease-standard
  if (name === '--pattern-exit-mismatch') return '--background-image-exit-mismatch';
  return undefined;
}

const HEADER = (what: string): string =>
  `/* ${what}\n * Generated by packages/tokens (pnpm tokens:build) from src/tokens.css v1.1. Do not edit. */\n`;

function buildTokensCss(source: string, tokens: ParsedTokens): string {
  const aliases = brandAliases(tokens);
  let extra = '';
  if (aliases.size > 0) {
    const decls = [...aliases].map(([alias, slot]) => `${alias}:var(${slot})`).join(';');
    // Every brand scope (named modes and runtime `data-brand="store"`) recomputes the aliases.
    extra = `\n/* generated: aliases of brand slots, recomputed inside each brand scope */\n[data-brand]{${decls}}\n`;
  }
  return HEADER('Skipa design tokens: CSS variables, brand modes, text styles') + source + extra;
}

function buildThemeCss(tokens: ParsedTokens): string {
  const aliases = brandAliases(tokens);
  const lines: string[] = [];
  for (const name of tokens.root.keys()) {
    const key = themeKey(name);
    if (key === undefined) continue;
    // Point utilities straight at the brand slot for aliases, so they follow the store's brand.
    lines.push(`  ${key}: var(${aliases.get(name) ?? name});`);
  }
  const durations = [...tokens.root.keys()].filter((n) => n.startsWith('--dur-'));
  const durationUtilities = durations
    .map(
      (n) =>
        `@utility duration-${n.slice('--dur-'.length)} {\n  transition-duration: var(${n});\n}`,
    )
    .join('\n');
  return (
    HEADER('Tailwind 4 theme: semantic tokens only, Tailwind defaults removed') +
    // inline: utilities use var(--source-token) directly. reference: Tailwind emits no :root
    // variables of its own, so tokens.css stays the only place a value is defined.
    '@theme inline reference {\n' +
    // Remove Tailwind's default palette, spacing scale, radii, shadows, easings and type sizes so
    // only Skipa tokens exist (bg-red-500, p-7, rounded-3xl, text-sm do not compile).
    '  --color-*: initial;\n  --spacing: initial;\n  --radius-*: initial;\n  --shadow-*: initial;\n' +
    '  --inset-shadow-*: initial;\n  --drop-shadow-*: initial;\n  --ease-*: initial;\n  --text-*: initial;\n' +
    lines.join('\n') +
    '\n}\n' +
    durationUtilities +
    '\n'
  );
}

export const FONT_FILES = {
  inter: 'inter-latin-400-700.woff2',
  bricolage: 'bricolage-latin-700-800.woff2',
} as const;

function buildFontsCss(): string {
  // Latin + ₦ subsets (scripts/subset-fonts.py). Paths are relative to dist/ so bundlers hash them.
  const range =
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20A6, U+2122, U+2190-2193, U+2212, U+2215, U+FEFF, U+FFFD';
  return (
    HEADER('Self-hosted fonts (no font CDN). Preload Inter only.') +
    `@font-face{font-family:'Inter';font-style:normal;font-weight:400 700;font-display:swap;src:url('../fonts/${FONT_FILES.inter}') format('woff2');unicode-range:${range}}\n` +
    `@font-face{font-family:'Bricolage Grotesque';font-style:normal;font-weight:700 800;font-display:swap;src:url('../fonts/${FONT_FILES.bricolage}') format('woff2');unicode-range:${range}}\n`
  );
}

function parseTextStyle(decls: Map<string, string>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  const font = decls.get('font');
  const m =
    font === undefined
      ? null
      : /^(\d+)\s+(\d+)px\/(\d+)px\s+var\(--font-(ui|display)\)$/.exec(font);
  if (m === null) throw new Error(`Unexpected font shorthand: ${font ?? '(none)'}`);
  out.fontWeight = Number(m[1]);
  out.fontSize = Number(m[2]);
  out.lineHeight = Number(m[3]);
  out.fontFamily = m[4] ?? 'ui';
  const ls = decls.get('letter-spacing');
  if (ls !== undefined) out.letterSpacing = ls;
  if (decls.get('font-variant-numeric') === 'tabular-nums') out.tabularNums = true;
  if (decls.get('text-transform') === 'uppercase') out.uppercase = true;
  return out;
}

function group(
  tokens: ParsedTokens,
  prefix: string,
  rename = (n: string) => n.slice(prefix.length),
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of tokens.root.keys())
    if (name.startsWith(prefix)) out[rename(name)] = resolve(tokens, name);
  return out;
}

function buildTokensTs(tokens: ParsedTokens): string {
  const color: Record<string, string> = {};
  for (const name of tokens.root.keys()) {
    const key = themeKey(name);
    if (key === undefined || !/^--(color|background-color|text-color|border-color)-/.test(key))
      continue;
    color[name.replace(/^--(color-)?/, '')] = resolve(tokens, name);
  }
  const slots = [...brandSlots(tokens)];
  const brands: Record<string, Record<string, string>> = {};
  for (const mode of [...tokens.brands.keys()].sort()) {
    brands[mode] = Object.fromEntries(
      slots.map((s) => [s.replace(/^--color-brand-/, ''), resolve(tokens, s, mode)]),
    );
  }
  const textStyles: Record<string, Record<string, string | number | boolean>> = {};
  for (const [cls, decls] of tokens.textStyles) textStyles[cls] = parseTextStyle(decls);
  const body = {
    color,
    brands,
    space: group(tokens, '--space-'),
    tapMin: resolve(tokens, '--tap-min'),
    radius: group(tokens, '--radius-'),
    shadow: group(tokens, '--shadow-'),
    font: { ui: resolve(tokens, '--font-ui'), display: resolve(tokens, '--font-display') },
    duration: group(tokens, '--dur-'),
    easing: group(tokens, '--ease-'),
    textStyles,
  };
  const entries = Object.entries(body)
    .map(([k, v]) => `export const ${k} = ${JSON.stringify(v, null, 2)} as const;`)
    .join('\n\n');
  return (
    '// Generated by packages/tokens (pnpm tokens:build) from src/tokens.css v1.1. Do not edit.\n' +
    '// Values are resolved to literals in Skipa mode; brand modes are listed under `brands`.\n\n' +
    entries +
    '\n\nexport type BrandMode = keyof typeof brands;\nexport type BrandSlot = keyof (typeof brands)[BrandMode];\n' +
    'export type ColorToken = keyof typeof color;\nexport type TextStyle = keyof typeof textStyles;\n'
  );
}

export function buildTokens(source: string): TokenOutputs {
  const tokens = parseTokens(source);
  return {
    tokensCss: buildTokensCss(source, tokens),
    themeCss: buildThemeCss(tokens),
    fontsCss: buildFontsCss(),
    tokensTs: buildTokensTs(tokens),
  };
}
