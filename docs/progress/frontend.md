# Frontend progress

Updated at the end of every working session: done, next, blocked. Times are WAT.

## 2026-11-28

### Done — F0 Foundations complete (pending review and merge)

| PR  | Item                                                                                                           | Status                                     |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| #15 | `packages/tokens`: tokens.css v1.1 → CSS vars, Tailwind 4 `@theme`, `tokens.ts`; self-hosted Inter + Bricolage | CI green, awaiting review                  |
| #16 | `packages/mocks`: MSW handlers, scenarios, fake SSE, `mocks:validate` against the contract                     | CI green, awaiting review                  |
| #17 | `packages/api-client`: generated types, client, idempotency, realtime (SSE + polling)                          | CI green, awaiting review (stacked on #16) |
| #18 | `packages/ui`: core components, gallery, Playwright screenshots in three brand modes, axe, no-raw-colour lint  | CI green, awaiting review (stacked on #15) |
| #19 | App shells (shopper, exit, store, admin) + CI `apps` job (builds, size-limit, Lighthouse)                      | CI running (stacked on #18, merges #17)    |

F0 acceptance criteria:

- Gallery matches canvas components in all three brand modes: screenshot baselines committed (#18).
- No raw hex in `packages/ui`: Stylelint `color-no-hex` + ESLint rule (#18).
- Mocks validate against the contract: `pnpm mocks:validate` in the `contract` CI job (#16).
- Shopper shell < 120 KB gz: **117.7 KB** entry JS; first load 188 KB gz (< 500 KB). Lighthouse
  (mobile, 3G, 4× CPU): TTI 0.75 s, accessibility 1.0.

Shells: routing, sessions (shopper device + guest; staff email + code sign-in, guard with return
path, AUTH-001 ends the session), every catalogue error code mapped with reference, GlitchTip via
the tunnel (SDK loaded after first paint), copy in `i18n/en.ts`, `pnpm dev:mocks` for all four.

### Next

- Merge order: #15 → #18, #16 → #17, then #19.
- F1 (Skipa home and entry): home 4 tabs, store search, check-in states, registration/sign-in,
  consents, tours, install prompt.

### Blocked / waiting on the lead

- Defaults from 26 Nov applied (no answer by 28 Nov): build/test dev dependencies added;
  jsx-a11y loaded through `@eslint/compat`; openapi-typescript on TypeScript 6 (ADR-36); lint and
  CI changes made by PR to the shared files.
- **Exit sign-in transport.** AD §5 says web apps use the httpOnly cookie, but the sessions row
  says "Native/exit devices: `Authorization: Bearer`". The exit shell uses the cookie (it is a web
  app at `exit.skipa.ng`). Default if unanswered by **2 Dec 2026**: keep the cookie.
- Sign-in forms in the staff shells are working placeholders on shared components; they are
  matched to Exit-F01, SD-Signin and SA-Signin in F4/F5/F6.

### Contract

- No change proposed.

## 2026-11-26

### Done

- Read the frontend brief in full; AD §1 (AD-01…AD-15), §4, §5, §8, §9, §10; the canvas decisions log
  (Q01–Q25, D-10–D-24), Engineering notes, Handoff, Design review, C-Rules, F-Type, and the F0 component
  sources (Button, Field, Control, BrandInput, StatusChip, Sheet, Overlay, Icon, Loading, State, Feedback,
  SkipaHeader, StoreHeader, TabBar, DashNav, NavBits, Table, KPI, Wordmark, Mark).
- Checked every pinned frontend version on npm. Posted the F0 plan to the lead (second session: re-posted
  after the backend M0 stack merged to `main`).

### Next (F0, one PR each, branched from `main`)

1. `packages/tokens`: move `tokens.css` v1.1, `tokens:build` → `dist/{tokens.css,tailwind-theme.css,tokens.ts}`, self-hosted font subsets.
2. `packages/mocks`: move fixtures + validator (and the `contract` CI job's path), MSW handlers, scenario switch, fake SSE, `mocks:validate`.
3. `packages/api-client`: generated types, client factory, idempotency helper, SSE helper with polling fallback, error normaliser.
4. `packages/ui`: 17 core components + NavBits, Icon (63 glyphs), Wordmark/Mark, Avatar; gallery; Playwright screenshots in three brand modes; axe; no-raw-colour lint.
5. App shells: shopper (with Opera Mini page, manifest, SW skeleton), exit, store, admin: routing, session, error mapping, `i18n/en.ts`, GlitchTip tunnel.
6. CI: frontend lint preset, `size-limit`, Lighthouse CI, gallery screenshots, `mocks:validate`, api-client drift check.

### Blocked / waiting on the lead

Defaults below apply if unanswered by **28 Nov 2026**.

- **Build/test dev dependencies not in brief §3** (all $0, none ship to users). Default: add them.
- **eslint-plugin-jsx-a11y 6.10.2 declares ESLint ≤ 9; the repo is on ESLint 10.15.0.** Default: load it
  through `@eslint/compat` `fixupPluginRules`; if rules still break, report with output.
- **openapi-typescript 7.13.0 needs the TypeScript 5.x/6.x compiler API; TS 7.0.2 has none.** Default: run
  `api-client:gen` with the root's TypeScript 6.0.3 (same rule as ADR-32), recorded as an ADR.
- **Lint preset and CI jobs live in backend-owned files** (`packages/config`, `.github/workflows/ci.yml`).
  Default: PRs to those files with the backend agent as reviewer. Moving the fixtures changes the
  `contract` job's path in the same PR.

### Resolved since last session

- `packages/contracts/src/errors.ts` is on `main` (77 codes). `errors.tsx` imports it directly; no interim list.
- Still not on `main`: `contracts/events.ts` (backend M1) and `domain/contrast.ts` (backend M6). Neither is
  needed in F0.

### Contract

- No change proposed.

### Conflicts noted (settled by precedence, no action needed)

- Canvas D-24 says refunds reverse the Skipa fee → AD-08 wins: no fee reversal.
- Canvas D-17/Q24 keep phone sign-in for exit checkers → AD-04 wins: email.
- Canvas Eng-Notes list NOTIF-002 "couldn't send the SMS" for receipts → AD-02 wins: NOTIF-005 email copy.
- Canvas Eng-Notes mark `session_started` and `payment_started` as client events → AD §9.1 wins: server.
- Canvas Icon has 63 glyphs; brief says 61 → build all 63 from the canvas source.
- Brief §3 pins `@tanstack/react-router` 1.170.46; `@tanstack/router-plugin` is versioned separately
  (latest 1.169.0) → pin 1.169.0.
