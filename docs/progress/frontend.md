# Frontend progress

Updated at the end of every working session: done, next, blocked. Times are WAT.

## 2026-11-26

### Done

- Read the frontend brief in full; AD §1 (AD-01…AD-15), §4, §5, §8, §9, §10; the canvas decisions log
  (Q01–Q25, D-10–D-24), Engineering notes, Handoff, Design review, and the F0 component sources
  (Button, Field, Control, BrandInput, StatusChip, Sheet, Overlay, Icon, Loading, State, Feedback,
  SkipaHeader, StoreHeader, TabBar, DashNav, NavBits, Table, KPI, Wordmark, Mark).
- Checked every pinned frontend version exists on npm. Posted the F0 plan to the lead.

### Next (F0, one PR each, branches off `chore/SKP-0-bootstrap` until it reaches `main`)

1. `packages/tokens`: move `tokens.css` v1.1, `tokens:build` → `dist/{tokens.css,tailwind-theme.css,tokens.ts}`, self-hosted font subsets.
2. `packages/mocks`: move fixtures + validator, MSW handlers per tag, scenarios, fake SSE, `mocks:validate` against the contract.
3. `packages/api-client`: generated types, client factory, idempotency helper, SSE helper with polling fallback, error normaliser.
4. `packages/ui`: 17 core components + Icon (63 glyphs) + Wordmark/Mark, gallery, Playwright screenshots in three brand modes, axe, no-raw-colour lint.
5. Four app shells: routing, session, error mapping, `i18n/en.ts`, GlitchTip tunnel.
6. CI: `size-limit`, Lighthouse CI, gallery screenshots, `mocks:validate`.

### Blocked / waiting on the lead

Questions are in the F0 plan (chat, 26 Nov). Defaults below apply if unanswered by **28 Nov 2026**.

- **Error codes and money helpers not yet in the repo.** `packages/contracts/errors.ts`, `events.ts` and
  `packages/domain/{money,time,contrast}.ts` are backend M0 items; the contract does not enumerate
  error codes. Default: F0 `errors.tsx` types codes from an interim list copied from AD §10.3, marked
  interim, with a test that fails once `@skipa/contracts` exports a different list; switch the import
  when it lands. No money is formatted in F0.
- **Build-time dev dependencies not in brief §3** (listed in the plan). Default: add them, all $0.
- **Lint preset and CI jobs live in backend-owned files** (`packages/config`, `.github/workflows/ci.yml`).
  Default: PRs to those files with the backend agent as reviewer.

### Contract

- No change proposed.

### Conflicts noted (settled by precedence, no action needed)

- Canvas D-24 says refunds reverse the Skipa fee → AD-08 wins: no fee reversal.
- Canvas D-17/Q24 keep phone sign-in for exit checkers → AD-04 wins: email.
- Canvas Eng-Notes list NOTIF-002 "couldn't send the SMS" for receipts → AD-02 wins: NOTIF-005 email copy.
- Canvas Icon has 63 glyphs; brief says 61 → build all 63 from the canvas source.
