# packages/tokens

**Owner:** frontend agent. Brief §8.1, AD §8.8.

`src/tokens.css` is the canvas's `tokens.css` v1.1, copied **unchanged**. It is the only place
colours, type, space, radii, elevation and motion are defined. A design update = replace that one
file, run `pnpm tokens:build`, review the gallery screenshot diff.

| Output (`pnpm tokens:build`) | What                                                                                                                                            | Used by                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `dist/tokens.css`            | The source as-is (variables, `[data-brand]` modes, reduced motion, `t-*` text styles, `.sk` behaviour) plus one generated rule, below           | every app, the gallery         |
| `dist/tailwind-theme.css`    | Tailwind 4 `@theme inline reference`: semantic tokens only, Tailwind's default palette, spacing, radii, shadows, easings and text sizes removed | `@import` after `tailwindcss`  |
| `dist/fonts.css`             | `@font-face` for the self-hosted subsets in `fonts/` (`font-display: swap`)                                                                     | every app (preload Inter only) |
| `dist/tokens.ts`             | Literal values (Skipa mode) + `brands`, `textStyles`, `space`, …                                                                                | charts, React Native later     |

## Utilities

Semantic names only. Primitives (`indigo-700`, `sand-100`, …) are not exposed.

| Token                                                                      | Utility                                                                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-bg-*`                                                             | `bg-page`, `bg-surface`, `bg-sunken`, `bg-inverse`, `bg-scrim`                                                                        |
| `--color-text-*`                                                           | `text-primary`, `text-secondary`, `text-muted`, `text-disabled`, `text-inverse`, `text-link`                                          |
| `--color-border-*`                                                         | `border-subtle`, `border-default`, `border-strong`                                                                                    |
| `--color-brand-*`, `--color-skipa-*`, `--color-status-*`, `--color-exit-*` | `bg-brand-primary`, `text-brand-on-primary`, `bg-skipa-primary`, `bg-status-success-bg`, `text-status-error-text`, `bg-exit-clear`, … |
| `--chart-*`                                                                | `fill-chart-1`, `stroke-chart-grid`, …                                                                                                |
| `--space-0…10`, `--tap-min`                                                | `p-4` (16 px), `gap-5` (24 px), `min-h-tap` (48 px)                                                                                   |
| `--radius-*`, `--shadow-*`, `--focus-ring`                                 | `rounded-lg`, `rounded-pill`, `shadow-2`, `shadow-focus`                                                                              |
| `--font-ui`, `--font-display`                                              | `font-ui`, `font-display`                                                                                                             |
| `--ease-*`, `--dur-*`                                                      | `ease-enter`, `duration-base` (0 ms under reduced motion)                                                                             |
| text styles                                                                | the `t-*` classes from `tokens.css` (`t-body`, `t-money`, `t-d-kpi`, `t-exit-result`, …)                                              |

`bg-red-500`, `text-white`, `p-11`, `rounded-3xl`, `text-sm` do not compile; the tests check it.

## The one generated rule

`--color-text-link: var(--color-brand-primary-text)` is declared on `:root`. A custom property is
computed where it is declared, so inside a store-branded container it would keep Skipa's indigo.
`dist/tokens.css` adds `[data-brand]{--color-text-link:var(--color-brand-primary-text)}` (generated
for every alias of a brand slot), and `text-link` points straight at the brand slot.

## Fonts

`fonts/*.woff2` are Latin + ₦ subsets, made once with `scripts/subset-fonts.py` (fonttools) from the
upstream OFL sources and committed. Inter is variable 400–700 (29 KB), Bricolage Grotesque is
variable 700–800, display only (31 KB). Licences: `fonts/OFL-*.txt`.
