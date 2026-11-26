# packages/ui

**Owner:** frontend agent. Brief §8; AD §8.8. One file per canvas component; props follow the
canvas Tweaks where they describe real states (the canvas's `state="hover"` style props are design
board artefacts; in code those states come from real interaction).

| File                   | Components                                                                                                 | Canvas              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------- |
| `Button.tsx`           | `Button` (primary, secondary, tertiary, link, destructive, pay, success, inverse; lg/md/sm; loading locks) | C-Actions           |
| `Field.tsx`            | `TextField` (text, email, phone, number, search), `OtpField`, `TextArea`, `SelectField`                    | C-Inputs            |
| `Control.tsx`          | `Checkbox`, `RadioGroup`, `Toggle` (Radix), `Stepper`                                                      | C-Inputs            |
| `BrandInput.tsx`       | `LogoUpload`, `ColourField` (contrast figures passed in from `domain/contrast.ts`)                         | C-Inputs            |
| `StatusChip.tsx`       | `StatusChip` (37 statuses, icon + word, never store-coloured)                                              | C-Feedback, C-Rules |
| `Feedback.tsx`         | `Feedback` (toast, alert, banner × 6 tones)                                                                | C-Feedback          |
| `Loading.tsx`          | `ProgressBar`, `StepBar`, `Spinner`, `SkeletonRows`, `SkeletonTable`                                       | C-Feedback          |
| `State.tsx`            | `State` (empty, error with reference, switched off)                                                        | C-Feedback          |
| `Sheet.tsx`            | `Sheet` (bottom sheet, Radix Dialog)                                                                       | C-Shopper           |
| `Overlay.tsx`          | `ConfirmDialog`, `SidePanel`, `Tooltip`, `HoldButton` (press-and-hold 1.5 s, SD-03)                        | C-Dashboard         |
| `Headers.tsx`          | `SkipaHeader`, `StoreHeader` (brand / pay)                                                                 | C-Shopper           |
| `TabBar.tsx`           | `TabBar` (Skipa home, D-10)                                                                                | C-Shopper           |
| `DashNav.tsx`          | `Sidebar` (full / compact), `TopBar`, `BranchMenu`                                                         | C-Dashboard         |
| `NavBits.tsx`          | `Tabs` (panels), `NavTabs` (links), `Segmented` (radio group), `Breadcrumbs`, `Pagination`                 | C-Dashboard         |
| `Table.tsx`, `KPI.tsx` | `Table`, `Kpi`                                                                                             | C-Dashboard         |
| `Brand.tsx`, `art/`    | `Wordmark`, `Mark` (hop spark), `Avatar` (Tomi, Mimi, Ata, Lubo, Sardi)                                    | Brand-Logo, Avatar  |
| `Icon.tsx`             | `Icon` (63 glyphs from the canvas; the brief says 61)                                                      | F-Icons             |

Not in F0, built with the milestone that first uses them: Tour, CartBar, ProductRow, PayMethod,
PayStatus, Receipt, QR, Scanner frame, ExitResult, ExitTools, Stars, Chart, Feed, Help.

## Styling rules (enforced)

- **Tokens only.** Utilities come from `@skipa/tokens` (`bg-surface`, `text-muted`, `bg-brand-primary`,
  `bg-status-success`, …). Raw colours fail ESLint, stylelint and `src/classes.test.ts`; the only
  exceptions are the canvas art in `src/art/` (avatars, logo) and the gallery's test logos.
- **Spacing scale = tokens.** `p-4` is 16 px, `gap-5` is 24 px (`--space-*`). Component dimensions
  use px (`h-[48px]`), because `h-10` would be the 80 px space token. `src/classes.test.ts` compiles
  every class in every component against the theme and fails on unknown utilities.
- **Primitives where the canvas uses them.** A few canvas states have no semantic token (pay hover
  `--indigo-900`, pressed `--red-900` / `--green-800`, disabled `--sand-200` / `--sand-300`, sidebar
  `--indigo-700`, active nav `--ochre-500`); those use the token variable (`bg-(--indigo-900)`).
- **Brand slots only where the canvas allows** (C-Rules): primary/secondary/tertiary buttons, store
  header, selection, links. Pay, status, exit and dashboard chrome never change with the store.

## Deviations from the canvas (accessibility)

- Feedback body text is not faded to 95%: on the solid warning tone that is 4.38:1, below AA.
- The store switcher chevron keeps its 32 px circle but has a 48 px hit area (WCAG 2.5.8, brief §13).
- The canvas draws report tabs, refund tabs and the date range alike; code uses `NavTabs` (links),
  `Tabs` (tab panels) and `Segmented` (radio group) so each has the right semantics.

## Gallery and visual tests

```bash
pnpm gallery                                    # http://localhost:5180/?brand=skipa|adunni|harbour
pnpm --filter @skipa/ui test                    # components + class/colour guards (Vitest)
pnpm --filter @skipa/ui test:visual:docker      # screenshots + axe on Linux, as CI
```

CI's `ui` job screenshots every gallery section and overlay in the three brand modes and runs axe
(zero serious/critical). Baselines in `e2e/__screenshots__` are made by CI on x64: when a screenshot
is new, the job writes it, uploads the `ui-screenshots` artifact and fails until it is committed.
Do not commit baselines made on a Mac or under x64 emulation (axe's colour maths misbehaves under
QEMU; `VISUAL_ARCH=arm64` runs natively for a quick local check).
