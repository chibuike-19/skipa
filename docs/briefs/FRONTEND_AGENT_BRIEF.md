# Skipa — Frontend Agent Brief

| | |
|---|---|
| Version | 1.0, 25 November 2026 |
| You receive | This brief, `SKIPA_SYSTEM_ARCHITECTURE.md` (the architecture document, "AD"), the PRD (v2.0, with v1.0 for unchanged sections), `api/openapi.v1.yaml` (the contract), `mocks/fixtures/*.json`, `design/tokens.css`, and the Claude Design canvas |
| Design canvas | `https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH` — every link below opens one artboard (`#artboard-<name>`) |
| You report to | The Skipa lead engineer (human) — the only person who can approve changes to money flows, data protection or the contract |

Read this brief fully, then AD §1 (decisions AD-01…AD-15), §8 (frontend design), §9 (analytics) and §10.3 (error codes). Precedence: this brief and the AD record the latest owner decisions; then the design canvas (including its decisions log Q01–Q25, D-10–D-24); then the PRD.

---

## 1. Your role and scope

You are the **frontend agent**. You build and own:

- `apps/shopper` — installable PWA "Skipa" at `shop.skipa.ng` (Skipa home + store-branded shopping, offline scanning).
- `apps/exit` — exit mode at `exit.skipa.ng` (phone and tablet, online only).
- `apps/store` — store dashboard at `stores.skipa.ng`.
- `apps/admin` — super admin at `admin.skipa.ng`.
- `packages/ui` (shared React components), `packages/tokens` (design tokens pipeline), `packages/api-client` (generated typed client), `packages/mocks` (MSW handlers and fixtures), `packages/analytics` (client tracking: batching, outbox).
- Playwright end-to-end journeys (with the backend agent), accessibility tests, Lighthouse CI, bundle budgets.

**Out of scope (owned by the backend agent):** the API and worker (`apps/api`), `packages/contracts` (Zod schemas → OpenAPI, error codes, event names — you review changes), `packages/domain` (you consume money formatting, RBAC map and contrast checker from it), database, jobs, integrations, infrastructure and CI pipelines (you add your jobs to `ci.yml` through PRs).

**Not in the MVP:** referrals, promotions, wallet, native apps (design page 14 is concept only), dark mode for dashboards, languages other than English.

---

## 2. Decisions you must respect (they change some designs)

| Decision | What it means for the UI |
|---|---|
| Payment truth comes from the server | Never show "paid", a receipt or a success state from the Paystack callback. After the popup closes, show **Confirming payment** until the API says Paid (SSE `receipt.issued` or polling). After 2 minutes: "We couldn't confirm your payment yet. Don't pay again; we're still checking." (SH-19, PAY-007) |
| Receipts: app + email, no SMS (AD-02) | Receipt always in the app. **Send receipt** (05.2) offers **email only**; registration/profile has an **"Email my receipts"** toggle. Remove the SMS option from the design. |
| SMS only for shopper sign-in codes (AD-03) | No other SMS copy anywhere ("we'll text you" only on shopper code screens). |
| Exit checkers sign in by **email** (AD-04) | Exit sign-in (EX-F01) asks for **email**, then a 6-digit emailed code. The canvas still shows phone — change the field and copy. Invites to exit checkers are by email. |
| Store alerts: dashboard + email (AD-05) | Settings → Notifications matrix has columns **Dashboard** and **Email** only (remove SMS). |
| Refunds happen outside Skipa (AD-07) | Shopper requests a whole-order refund; the store approves or declines; **the store pays the shopper itself** (cash, transfer, card reversal); a manager **records** the payment. Store dashboard Refunds needs a **"Record refund payment"** step (method, date, reference required for bank transfer, note). Shopper copy: "The store will pay you back directly — usually at the customer service desk or by bank transfer. Don't share card details or PINs in chat." Status "Paid" = "Refund paid by the store". |
| Skipa fee not reversed on refunds (AD-08) | No fee-reversal line anywhere in refund screens. |
| Guest support contact (AD-10) | "Message store support" for guests asks for an **optional email** (not phone). Replies always appear in the Support tab. |
| Opera Mini (AD-11) | Detect Opera Mini and show a simple "Open Skipa in Chrome" page (new, copy below). |
| Exit is online only (D-16) | Do **not** build the `clear-offline` ExitResult state or the "queued checks" list that remain in the canvas source. No connection = "No connection · checks paused". |
| Payout report (AD-06) | Reconciliation payout tie-out shows: sales, **Paystack fees** (paid by the store), **Skipa fee**, chargebacks, payout; **refunds paid by the store** shown below, outside the payout. |
| Super admin second step (D-23) | SA sign-in shows the TOTP step only when the API returns `secondStepRequired`. |
| Fonts | Self-host Inter and Bricolage Grotesque subsets (no Google Fonts CDN). |

---

## 3. Approved stack (pin these)

| Area | Package | Version |
|---|---|---|
| Runtime / language / PM | Node.js 24 LTS · TypeScript 7.0.2 · pnpm 12.23.0 · Turborepo 2.11.13 | |
| UI | react, react-dom | 19.3.1 |
| Build | vite | 8.3.8 |
| PWA | vite-plugin-pwa (Workbox 7.4), workbox-window | 2.0.0, 7.4.1 |
| IndexedDB | dexie | 4.4.7 |
| Routing / server state | @tanstack/react-router, @tanstack/react-query | 1.170.46, 5.108.4 |
| Tables (dashboards) | @tanstack/react-table | latest 8.x at bootstrap (pin) |
| Forms | react-hook-form + @hookform/resolvers, zod | 7.92.0, 4.6.7 |
| Styling | tailwindcss | 4.3.5 |
| Headless widgets | Radix Primitives (`@radix-ui/react-*`) | latest 1.x at bootstrap (pin) |
| Charts (dashboards only, lazy) | recharts | 3.11.1 |
| Scanner | barcode-detector (zxing-wasm) | 3.2.4 (3.1.7) |
| QR rendering | qrcode | 1.5.4 |
| API client | openapi-typescript, openapi-fetch | 7.13.0, 0.17.0 |
| Mocks | msw | 3.0.7 |
| Payments | @paystack/inline-js | 2.28.2 |
| Errors | @sentry/react | 11.17.0 (via API tunnel `/v1/monitoring/tunnel`) |
| Tests | vitest, @playwright/test, @axe-core/playwright, @lhci/cli, size-limit | 5.1.1, 1.65.1, latest (pin) |

No additional UI kits, state libraries or analytics SDKs without approval (the client does **not** load posthog-js; events go to our API).

---

## 4. Repository layout you work in

```
apps/
  shopper/  src/routes/… src/features/{scan,cart,pay,receipt,help,home,account,tours} src/sw.ts src/db.ts (Dexie)
  exit/     src/routes/… src/features/{signin,scan,result,check,offline,shift,tour}
  store/    src/routes/… src/features/{live,receipts,exit,refunds,support,analytics,recon,catalogue,staff,settings,privacy,faqs,branding,shoppers}
  admin/    src/routes/… src/features/{overview,stores,onboarding,shoppers,transactions,disputes,recon,loss,analytics,errors,billing,config,users,audit,support,branding,loyalty,viewas,alerts}
packages/
  ui/          one file per canvas component (see §8) + gallery route for visual tests
  tokens/      src/tokens.css (copied verbatim from the canvas) → dist/{tokens.css,tailwind-theme.css,tokens.ts}
  api-client/  generated types (openapi-typescript) + client factory (openapi-fetch) + SSE helper
  mocks/       MSW handlers per tag + fixtures (start from mocks/fixtures/*.json) + scenarios
  analytics/   track(), batching, Dexie outbox, plan types (names from packages/contracts/events.ts)
e2e/           Playwright journeys P1–P8 + PRD 17.1 scenarios (shared with backend)
```

Each app: `src/main.tsx`, `src/router.tsx` (TanStack file routes), `src/api.ts` (client with `credentials: 'include'` and `X-Skipa-Client: <app>/<version>`), `src/session.tsx`, `src/errors.tsx` (code → message map), `src/i18n/en.ts` (all copy, plain English, from the canvas content guide).

---

## 5. The API contract is the agreement

- `api/openapi.v1.yaml` (OpenAPI 3.1, 177 operations) is the contract. The backend implements it; **you build against it with MSW mocks** until each endpoint is live on staging, then switch by turning off the mock for that tag (`VITE_USE_MOCKS=true|false` plus per-tag overrides in `packages/mocks/config.ts`).
- Generate types with `pnpm api-client:gen` (openapi-typescript) — never hand-write request/response types.
- If the contract is missing something the design needs, open a PR labelled `contract-change` with the proposed change (YAML + reason + screen link) and wait for the backend agent's approval. Do not invent fields or call undocumented endpoints.
- Conventions: money arrives as integer kobo (`totalKobo`) — format with `formatNaira()` from `packages/domain/money.ts` ("₦31,300"; kobo shown only when non-zero, "₦4,500.50"); times arrive in UTC — display in West Africa Time with `packages/domain/time.ts`; errors arrive as `{error:{code,userMessage,requestId}}`; send `Idempotency-Key` (a UUID created when the user starts the action, reused on retry) wherever the contract lists it.

### Mock data that matches the contract

`mocks/fixtures/*.json` are valid examples (checked by `mocks/validate_fixtures.py` against the contract): `check-in.json` (ShoppingSession, Adunni Mart Lekki with brand tokens), `catalogue.json` (available, category_off, till_only products), `order-pending.json`, `payment-attempt.json`, `receipt-valid.json`, `exit-flagged.json`, `exit-invalid-used.json`, `refund-awaiting-ho.json`, `error-pay-007.json`. Build `packages/mocks` from them:

- Handlers per OpenAPI tag, returning fixtures; every handler response must validate against the contract in CI (`pnpm mocks:validate`, using the same schema validation as the Python script or `@readme/openapi-parser` + Ajv in TypeScript).
- Seed-consistent data: organisations **Adunni Mart** (pilot; branches `LK` Lekki Phase 1, `IK` Ikeja GRA; primary `#7A1F4A`, accent `#F2B705`) and **Harbour Grocers** (paid 2%; branch `VI`; primary `#B3400F`, accent `#1D6F8A`); Skipa default primary `#23336B`, accent `#E8A317`. Use the canvas sample content (e.g. receipt `LK-04822`, order `SKP-LK-04815`, checker "Chidi O.", manager "Bisi Kalu", head office "Femi Ogunleye", super admin "Tolu Adebayo").
- **Scenarios** switched by `?scenario=` or a dev toolbar: `payment-success`, `payment-pending-long` (stays pending > 2 min → PAY-007 copy), `payment-failed`, `payments-unavailable` (pay at till), `branch-switched-off`, `price-changed`, `cart-limit`, `offline`, `exit-clear`, `exit-flagged`, `exit-large-basket`, `exit-random`, `exit-mismatch`, `exit-invalid-used|expired|unpaid|other-branch`, `exit-no-connection`, `refund-requested|awaiting-head-office|approved|declined|paid`, `ticket-replied`, `empty-states`, `server-error` (SYS-500 with reference).
- SSE in mocks: a fake `EventSource` that emits `order.updated`/`receipt.issued` after a delay, `exit.check_recorded`, `live.counters` every 5 s.

---

## 6. Screens and routes mapped to the design

Canvas base: `https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH`. "All states" boards show every screen and state of a flow; "source" boards are the component files with props.

### 6.1 Shopper PWA (`apps/shopper`)

| Route | Screens / states | Design (all states · source) | PRD |
|---|---|---|---|
| `/` | Skipa home (guest, registered, continue cart, last store, recent receipts) | [Flow-F10](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F10) · [SH-F10](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F10) | SH-25, D-10 |
| `/scan-store` | Scan store QR (in-app camera) | Flow-F10 (10.2) | SH-01 |
| `/stores`, `/stores/:branchId` | Find a store (name/area, Near me, offline visited), store page (store brand) | Flow-F10 (10.3–10.4) | SH-26 |
| `/support`, `/support/:ticketId` | Support tab, thread, store replied, resolved + rate | Flow-F10 (10.5), [Flow-F08](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F08) | SH-27, HP-11, HP-14 |
| `/profile/*` | Profile, receipts, stars, privacy and data, avatar, help and app tour, account paused | [Flow-F06](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F06) · [SH-F06](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F06) · Flow-F10 (10.6–10.8) | SH-21, SH-28–31, ST-08, NF-16 |
| `/q/:qrCode` | Loading after QR, store switched off, payments unavailable, first-visit intro, returning welcome, camera permission, session timed out, something went wrong | [Flow-F01](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F01) · [SH-F01](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F01) | SH-01–04, NF-05, ER-07/08 |
| `/s/:sessionId/register`, `/sign-in` | Guest or register, details, code, consent (+ "Email my receipts"), registered, I've used Skipa before | [Flow-F02](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F02) · [SH-F02](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F02) | SH-05–08 |
| `/s/:sessionId/scan` | Scanner ready/reading/added/offline/torch, not included, not found, price updating | [Flow-F03](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F03) · [SH-F03](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F03) | SH-09–13 |
| `/s/:sessionId/cart` | Cart, empty, limit, price changed, switched off mid-session | Flow-F03 (03.6–03.10) | SH-14–16, 5.8 |
| `/s/:sessionId/pay`, `/orders/:orderId/confirming`, `/orders/:orderId/failed` | Choose method, opening Paystack, confirming (two states), confirmed, failed, pay at till | [Flow-F04](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F04) · [SH-F04](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F04) · [P3 prototype](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Proto-P3) | SH-17–19 |
| `/receipts/:receiptId` | Receipt with exit QR, expiring, send by email, not valid (expired/used), stars earned, rate visit | [Flow-F05](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F05) · [SH-F05](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F05) | SH-20–24 |
| `/receipts/:receiptId/refund`, `/refunds/:refundId` | Request refund (whole order), sent, status (Requested / Waiting for head office / Approved / Declined / Paid) | [Flow-F07](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F07) · [SH-F07](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F07) · [P4](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Proto-P4) | SH-22, SH-32 |
| Overlay (every screen) | Need help: chat, answer, not sure, payment status, message store (guest optional email), sent | Flow-F08 · [SH-F08](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F08) · [P5](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Proto-P5) | NT-01, HP-01–09 |
| Overlay | Install prompt (Android, iPhone steps), installed Skipa icon | [Flow-F09](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F09) · [SH-F09](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F09) | SH-04 |
| Overlay | Tours: Skipa home (welcome + 4), first store visit (4) | [Flow-F11](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Flow-F11) · [SH-F11](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-F11) | SH-31 |
| `/open-in-chrome` | New page: "Skipa needs Chrome to scan and pay. Open this page in Chrome." + copy link button | — (new, AD-11) | NF-21 |

Journeys to reproduce exactly: [P1 guest first visit to exit](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Proto-P1), [P2 returning shopper](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Proto-P2). Brand proof: [Journey-Brands](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Journey-Brands), [Key-390](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Key-390). Coverage table: [SH-Coverage](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SH-Coverage).

### 6.2 Exit mode (`apps/exit`)

| Route | Screens / states | Design | PRD |
|---|---|---|---|
| `/sign-in`, `/invite/:token` | Start your shift (**email** + code), wrong code, session expired | [Exit-F01](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Exit-F01) · [EX-App](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-EX-App) | RB-02, RB-06 |
| `/` | Ready to scan, checking, type receipt number, last result strip | [Exit-F02](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Exit-F02) | EX-01 |
| `/result/:checkId` | Clear, flagged, large basket, random, mismatch, invalid (used, expired, unpaid, other branch) | Exit-F02 · [ExitResult](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-ExitResult) | EX-02, EX-03, 6.2 |
| `/check/:checkId/*` | Checklist, done, weigh (keypad), out of tolerance, random full check, mismatch form | [Exit-F03](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Exit-F03) · [ExitTools](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-ExitTools) | EX-04–06, 6.5 |
| state | No connection · checks paused; reconnecting | [Exit-F04](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Exit-F04) | EX-10 |
| `/shift` | Shift summary, hand over | Exit-F01 | EX-06, RB-06 |
| layout | Tablet (834 × 1194) versions of all screens | [Exit-TAB](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Exit-TAB) | — |
| overlay | First-shift tour (4 steps) | [Exit-TOUR](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Exit-TOUR) | EX-12 |

Journey: [P6 every exit result](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Proto-P6).

### 6.3 Store dashboard (`apps/store`)

| Route | Design (all states · source) | PRD |
|---|---|---|
| `/sign-in`, `/invite/:token` | [Store-B01](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B01) · [SD-Signin](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Signin) | RB-02, RB-03 |
| `/live` | [Store-B02](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B02) · [SD-Live](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Live) | SD-01, SD-04 |
| `/receipts`, `/receipts/:id` | [Store-B03](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B03) · [SD-Receipts](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Receipts) | SD-02, SD-05 |
| `/exit-checks` | [Store-B04](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B04) · [SD-Exit](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Exit) | EX-06, EX-08 |
| `/refunds` (to decide · waiting for head office · **to record** · chargebacks) | [Store-B05](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B05) · [SD-Refunds](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Refunds) · [P7](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Proto-P7) + new "Record refund payment" panel | PY-07–09 |
| `/support`, `/support/:ticketId` | [Store-B06](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B06) · [SD-Support](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Support) | HP-10–13 |
| `/analytics/:report`, `/loss-report` | [Store-B07](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B07) · [SD-Analytics](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Analytics) | 13.3, SD-07 |
| `/reconciliation/*` | [Store-B08](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B08) · [SD-Recon](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Recon) | PO-06–09 |
| `/catalogue/*` | [Store-B09](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B09) · [SD-Catalogue](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Catalogue) | CT-01–09 |
| `/branding` | [Store-B10](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B10) · [SD-Branding](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Branding) · [P8](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Proto-P8) | BR-01–05 |
| `/faqs`, `/shoppers` | [Store-B11](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B11) · [SD-FAQs](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-FAQs) · [SD-Shoppers](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Shoppers) | HP-02, ST-09 |
| `/staff` | [Store-B12](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B12) · [SD-Staff](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Staff) | RB-03 |
| `/settings/:tab` | [Store-B13](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B13) · [SD-Settings](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Settings) (no SMS column) | SD-03, SD-08, SD-23, NT-04 |
| `/privacy` | [Store-B14](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B14) · [SD-Privacy](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Privacy) | RB-07, SD-20, NF-16 |
| emails (built and sent by the backend from these designs; you review the rendered output) | [Store-B15](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B15) · [SD-Email](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Email) | SD-06, SD-07 |
| overlay: tour; name menu | [Store-B16](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Store-B16) · [SD-Tour](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SD-Tour); name menu (SD-22) not designed — build from DashNav + Overlay and get the lead's sign-off | SD-21, SD-22 |

### 6.4 Super admin (`apps/admin`)

| Route | Design (all states · source) | PRD |
|---|---|---|
| `/sign-in` | [Admin-A01](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A01) · [SA-Signin](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Signin) | SA-01 |
| `/` | [Admin-A02](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A02) · [SA-Overview](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Overview) | SA-02, SA-06 |
| `/stores/*`, `/view-as/:orgId` | [Admin-A03](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A03) · [SA-Stores](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Stores) · [SA-ViewAs](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-ViewAs) | 11.1, SA-03 |
| `/stores/:id/onboarding` | [Admin-A04](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A04) · [SA-Onboarding](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Onboarding) | 11.1 |
| `/shoppers` | [Admin-A05](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A05) · [SA-Shoppers](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Shoppers) (reason gate) | RB-05 |
| `/transactions`, `/orders/:id` | [Admin-A06](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A06) · [SA-Transactions](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Transactions) | 11.3 |
| `/disputes`, `/reconciliation`, `/billing` | [Admin-A07](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A07) · [SA-Refunds](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Refunds) · [SA-Recon](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Recon) · [SA-Billing](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Billing) + new small panels: chargeback reserve, receivables | PY-09, SA-08 |
| `/loss`, `/analytics/:report` | [Admin-A08](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A08) · [SA-Loss](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Loss) · [SA-Analytics](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Analytics) | 13.4 |
| `/errors/*`, `/support` | [Admin-A09](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A09) · [SA-Errors](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Errors) · [SA-Support](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Support) | ER-11, HP-13 |
| `/config/*`, `/users`, `/audit`, `/branding`, `/loyalty` | [Admin-A10](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Admin-A10) · [SA-Config](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Config) · [SA-Users](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Users) · [SA-Audit](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Audit) · [SA-Branding](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Branding) · [SA-Loyalty](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-SA-Loyalty) | SA-04, SA-05, RB-04, BR-09, ST-02 |
| `/alerts` | Alert centre (new; table + StatusChip + Feed components) mirroring Telegram | 14.4 |

Reference pages: [Read me](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-ReadMe), [Screen inventory](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Inventory) (partly stale — the boards above win), [Decisions log](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Questions), [Engineering notes](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Eng-Notes), [Design review](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Review), [Handoff](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Handoff).

---

## 7. Milestones (build order) and acceptance criteria

You never wait for the backend: build on mocks, then switch each area to staging in the sprint after its backend milestone lands.

| Milestone | Build | Acceptance criteria |
|---|---|---|
| **F0 Foundations** (wk 1–2) | Tokens pipeline, `packages/ui` core (Button, Field, Control, BrandInput, StatusChip, Sheet, Overlay, Icon, Loading, State, Feedback, SkipaHeader, StoreHeader, TabBar, DashNav, Table, KPI), component gallery with Playwright screenshots, `packages/api-client` generation, `packages/mocks` with fixtures and scenarios, four app shells with routing, session handling, error mapping, Sentry tunnel, `size-limit` + Lighthouse CI | Gallery matches canvas components in all three brand modes; no raw hex in `packages/ui`; mocks validate against the contract; shopper shell < 120 KB gz |
| **F1 Skipa home and entry** (wk 3–4) | Skipa home 4 tabs, store search (distance on phone), check-in states, registration/sign-in, consents, tours, install prompt, Opera Mini page | SH-01, SH-02, SH-04–08, SH-25–31, NF-05 (pay-at-till screen), NF-21, NF-29 (no coordinates leave the phone — test asserts no lat/lng in any request) |
| **F2 Scan and cart** (wk 5–6) | Camera + scanner pipeline, Dexie catalogue, cart, outbox, not-included/not-found sheets, limits, price change, switched-off banner, session timeout + saved cart | SH-09–16 and 5.9 AC: scanning continues with data off; scan → cart < 1 s on the reference phone; till-only / category-off never added |
| **F3 Pay, receipt, refund, help** (wk 7–8) | Pay method, Paystack inline (`resumeTransaction(accessCode)`) with redirect fallback, confirming with SSE + 3 s polling, pending-long copy, failed, receipt + exit QR (`qrcode`, high contrast, brightness hint), email receipt, rating, stars, refund request and status, help chat, store support, Support tab | SH-17–24, SH-32, HP-01–09, 8.5 AC from the UI side: never shows success before Paid; double tap on Pay sends one request with one idempotency key |
| **F4 Exit mode** (wk 9–10) | Email sign-in, scanner, results (fixed colours, no animation), checklist, weigh keypad, mismatch, no-connection controller, shift summary, hand over, tablet layout, tour | 6.6 AC: non-flagged clears in one scan; cannot clear flagged until all ticked; no connection → paused within 20 s and returns by itself; EX-01–12 |
| **F5 Store dashboard** (wk 11–13) | All SD routes incl. record refund payment, payout tie-out, live SSE, filters + exports, branding editor with live preview and contrast warnings, settings with press-and-hold switch-off, staff invites by email | 10.4 AC: receipt appears ≤ 5 s; branch isolation visible (no other-branch data); low-contrast colour cannot be published; paid-plan store sees no baseline prompt or loss report; every export goes through the API (logged) |
| **F6 Super admin** (wk 13–14) | All SA routes, reason gate, view-as banner (read-only), emergency switch with typed confirmation, alert centre, billing + reserve + receivables | 11.3 AC: trace any receipt check-in → payout on one screen; personal data not visible without a reason |
| **H1 Hardening** (wk 15–16) | Device-lab runs, accessibility fixes, performance fixes, E2E for all PRD 17.1 shopper/exit/dashboard scenarios on staging | All budgets met; axe clean; P1–P8 journeys automated and green |

---

## 8. Shared UI package and token pipeline

1. **Tokens:** copy `design/tokens.css` (canvas `tokens.css v1.1`) to `packages/tokens/src/tokens.css` unchanged. `pnpm tokens:build` (PostCSS script) emits `dist/tokens.css` (variables incl. `[data-brand]` blocks and the reduced-motion media query), `dist/tailwind-theme.css` (Tailwind 4 `@theme` mapping colours, spacing, radii, shadows, fonts, durations, easings) and `dist/tokens.ts`. A design update = replace one file + rebuild + review the screenshot diff.
2. **Semantic names only:** components use `bg-[--color-bg-surface]`-style utilities generated from the theme (e.g. `bg-surface`, `text-primary`, `bg-brand-primary`, `bg-status-success`, `bg-exit-clear`). Stylelint `color-no-hex` and an ESLint rule block raw colours in `packages/ui` and the apps (exceptions listed in the canvas review: Paystack-imitating greys are not needed because the real Paystack popup is used; avatars/logos/chart series are SVG assets).
3. **Components** (one file per canvas component source, props = the canvas Tweaks): Button, Field, BrandInput, Control, StatusChip, Feedback, Loading, State, Sheet, Overlay, Tour, Icon (61 icons, inline SVG), SkipaHeader, StoreHeader, TabBar, NavBits, DashNav, Table, KPI, Chart, Feed, Help, CartBar, ProductRow, PayMethod, PayStatus, Receipt, Scanner (frame), ExitResult, ExitTools, Stars, Avatar (Tomi, Mimi, Ata, Lubo, Sardi), Wordmark, Mark, QR. Sources: [C-Actions](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-C-Actions), [C-Inputs](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-C-Inputs), [C-Feedback](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-C-Feedback), [C-Shopper](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-C-Shopper), [C-Pay](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-C-Pay), [C-Exit](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-C-Exit), [C-Dashboard](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-C-Dashboard), [C-Rules](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-C-Rules); foundations [F-Colour](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-F-Colour), [F-Type](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-F-Type), [F-Layout](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-F-Layout), [F-Icons](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-F-Icons), [F-Content](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-F-Content); brand [Brand-Logo](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Brand-Logo), [Brand-Guide](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Brand-Guide), [Brand-Colour](https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH#artboard-Brand-Colour). Use the logo files from the canvas logo kit, never live type for the wordmark.
4. **Headless behaviour** from Radix Primitives (Dialog for Sheet/Overlay, Popover, Tabs, Switch, Tooltip, DropdownMenu for the name menu); never re-implement focus traps.
5. **Fonts:** self-hosted Inter variable (Latin subset, 400–700) and Bricolage Grotesque (700/800 subset, display only), `font-display: swap`, preload Inter only.

## 9. Store theming at runtime

- Check-in returns `branch.brand` (`BrandTokens`). Apply brand slots only on the store route container: `<div data-brand="store" style={{'--color-brand-primary': brand.primary, '--color-brand-primary-hover': brand.primaryHover, '--color-brand-primary-pressed': brand.primaryPressed, '--color-brand-on-primary': brand.onPrimary, '--color-brand-primary-text': brand.primaryText, '--color-brand-primary-subtle': brand.primarySubtle, '--color-brand-accent': brand.accent, '--color-brand-on-accent': brand.onAccent, '--color-brand-accent-subtle': brand.accentSubtle}}>`.
- Skipa-wide screens (home, Stores, Support, Profile, account screens) use `data-brand="skipa"` (BR-11, SH-28). Receipt detail, refunds and store help stay in the store brand (D-13).
- **Never branded** (BR-06): Pay body (`--color-skipa-*`), status colours (`--color-status-*`), exit QR, all of exit mode (`--color-exit-*`). The store logo and name stay in the pay header (Q05). "Powered by Skipa" in every store footer (BR-08). No branding → Skipa default (BR-07).
- Brand images come from R2 URLs with hashed names; cache 7 days (stale-while-revalidate); total ≤ 200 KB per store.
- Branding editor: live phone preview renders the real shopper components with draft tokens; contrast warnings from `packages/domain/contrast.ts` with the suggested shade; Publish disabled until the server's contrast report passes (BR-02–04).

## 10. PWA and offline plan (shopper)

| Resource | Strategy |
|---|---|
| App shell | Workbox precache (`injectManifest`), versioned; new version applies on next launch ("Updated" toast) |
| Catalogue | At check-in `GET /v1/branches/:id/catalogue` (ETag/`sinceVersion`) → Dexie `products` (index `barcode`), `categories`; refresh on `catalogue.updated` SSE and every app open while online |
| Branch/brand JSON, brand images | Stale-while-revalidate, 7 days |
| Receipts, tickets, stars, profile | Network-first, Dexie fallback with "Last updated 14:36" |
| Mutations | Never cached; offline-capable ones (unknown barcodes, refund requests, support messages, ratings, analytics events) go to the Dexie `outbox` with a client UUID; flushed by Background Sync (Chrome) or on `online`/app open (iOS) |
| Not offline | Pay, registration codes, store search, sending email receipts — show "You're offline" in place |
| Never intercepted | Paystack scripts and checkout, `/v1/stream` |

Manifest: `name` and `short_name` "Skipa", Skipa icons only (maskable 192/512), `start_url: "/"`, `display: "standalone"`, `theme_color #23336B`, `background_color #FBF5EA` (D-15, SH-04). Saved cart: Dexie, 24 h per branch, prices re-checked on resume (SH-03).

Exit mode has **no offline queue**: a connectivity controller (navigator.onLine + 15 s heartbeat `POST /v1/exit/heartbeat` + request failures) switches to "No connection · checks paused" after two failed requests or 20 s without a heartbeat acknowledgement, disables the scanner, and returns automatically after one successful heartbeat (EX-10).

## 11. Scanner implementation and fallback

1. Camera: `getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}})`; torch toggle when `track.getCapabilities().torch`; explain permission first (01.6); on deny or no camera → manual entry (SCAN-001 message).
2. Detector: native `BarcodeDetector` when `getSupportedFormats()` includes `ean_13`; else `await import('barcode-detector/ponyfill')` (zxing-wasm, lazy, cached by the service worker, loaded after check-in so it is outside the first-load budget).
3. Formats `ean_13`, `ean_8`, `upc_a`, `upc_e` (SH-09); expand UPC-E to UPC-A; validate check digits.
4. Loop: `requestVideoFrameCallback` (fallback `requestAnimationFrame`), centre crop, ≤ 15 detections/s; accept after 2 identical reads within 500 ms; ignore the same code for 1.5 s.
5. Lookup Dexie by barcode → add (haptic `navigator.vibrate(30)`, toast with Undo 5 s) → `product_scanned`, `cart_item_added`. Status `till_only`/`category_off` → not-included sheet; `price_updating` → price-being-updated sheet; not found → type-the-number sheet, then pay at till; queue unknown barcodes.
6. Exit app uses the same pipeline with `qr_code` format for receipt QRs, plus "Type the receipt number".
7. Switch trigger: if first-try scan success on reference devices is below 95%, report it with numbers — the lead decides on a commercial SDK.

## 12. Performance budget and low-end Android testing

| Budget (shopper) | Limit | Check |
|---|---|---|
| First load (HTML+JS+CSS+fonts, gzip), excluding catalogue | < 500 KB; entry JS ≤ 170 KB | `size-limit` in CI (fails PR) |
| First load on 3G (1.6 Mbps, 150 ms RTT, 4× CPU) | < 4 s; cached < 1.5 s | Lighthouse CI on every PR |
| Scan → item in cart | < 1 s | Playwright timing (throttled) + device lab |
| Store branding | < 200 KB | asset check in mocks and staging |
| Dashboards | route chunks < 250 KB gz each; charts lazy | `size-limit` |

If the entry JS budget is exceeded and cannot be fixed by splitting, alias React to `preact/compat` for `apps/shopper` only and report it (switch trigger in AD §4).

Device lab (weekly and before every release): an Android Go / 2 GB RAM phone (Tecno or Itel entry model, current Chrome), a Samsung A-series, and an iPhone on iOS 15–16 (Safari). Script: install from `shop.staging.skipa.ng`, check in with a printed test QR, turn data off, scan 20 products, turn data on, pay with a Paystack test card, show receipt QR, scan it with the exit app on a second phone. Record timings in `docs/perf-log.md`; debug with `chrome://inspect`.

## 13. Accessibility checklist (WCAG 2.2 AA)

- [ ] Text contrast ≥ 4.5:1 (large ≥ 3:1) in Skipa, Adunni and Harbour modes; store brand slots always come from the server's contrast-checked tokens.
- [ ] Tap targets ≥ 48 px (exit 56 px; keypad 56/72 px); dashboards ≥ 40 px.
- [ ] Every interactive element is a real `<button>`, `<a href>` or form control; icon-only buttons have `aria-label`.
- [ ] Dialogs, sheets and tours move focus in and return it on close; Escape closes (NF-30).
- [ ] `prefers-reduced-motion` stops animations; exit results never animate.
- [ ] Colour is never the only signal: results have icon + large word + reason (6.2).
- [ ] Form errors announced (`aria-live="polite"`), linked with `aria-describedby`; code inputs use `inputmode="numeric"` and `autocomplete="one-time-code"`.
- [ ] Live regions for "Confirming payment" state changes and scan toasts.
- [ ] Language `en-NG`; plain English from the content guide; ₦ with commas; WAT times; sentence case.
- [ ] `@axe-core/playwright` on every screen in CI with zero serious/critical issues.
- [ ] Readable in bright store light: no text on images without a scrim; minimum 16 px body text on shopper screens.

Browser support (NF-21): Chrome Android last 3 versions; Safari iOS 15+; Samsung Internet current; Opera Mini → `/open-in-chrome` (detect `Opera Mini`/`OPiM` in the user agent before loading the app bundle).

## 14. Analytics events you own (client-side)

Use `track()` from `packages/analytics` (names typed from `packages/contracts/events.ts`); standard properties are added by the API, but you send `screen`, `networkType`, `sessionId`, `branchId` and `clientEventId`.

`qr_code_scanned`, `skipa_home_viewed`, `store_search_performed` (never coordinates), `store_switched`, `web_app_loaded`, `registration_started`, `continued_as_guest`, `avatar_changed`, `product_scanned`, `product_not_included`, `product_not_found`, `cart_item_added`, `cart_item_removed`, `cart_quantity_changed`, `checkout_started`, `rating_submitted`, `help_opened`, `help_chat_question_asked`, `help_chat_resolved`, `dashboard_viewed`, `tour_started`, `tour_skipped`, `tour_completed`. Property lists: AD §9.1. Never send names, phone numbers, emails, card data or locations (AN-06). An automated test fires each event and checks its properties.

## 15. Error codes you handle

`src/errors.tsx` maps **every** code in `packages/contracts/errors.ts` to its plain message and next step (ER-07) and shows the short request ID on error screens (ER-08). You raise client-side **SCAN-001** (camera unavailable) and the offline states; everything else comes from the API. Key UI placements: AUTH-002/003/004 (code fields), SCAN-002/003/004 (scan sheets), CART-002/004/006 (cart), PAY-001 (pay at till), PAY-005/006 (failed), PAY-007 (pending long), RCPT-002…006 (receipt and exit invalid screens), EXIT-004 (no connection), EXIT-007 (tick all items), NOTIF-005 ("We couldn't email your receipt. It's still here."), SYS-* (generic screen with reference).

## 16. Coding standards, testing, definition of done

- TypeScript `strict`; ESLint (typescript-eslint strict, react-hooks, jsx-a11y) + Prettier; Conventional Commits; no `any` in shared packages; copy only in `src/i18n/en.ts`; money via `formatNaira`; time via WAT helpers; data only through the generated client and TanStack Query; mutations carry idempotency keys.
- **Tests:** Vitest + Testing Library for components and hooks (cart maths, outbox, connectivity controller, scanner debounce, theming); Playwright for journeys on mocks (every PR) and on staging (nightly); axe on every screen; Lighthouse CI and `size-limit` on every PR; visual screenshots of the gallery in three brand modes.
- **Done** when: the screen matches its canvas artboard in every listed state (incl. loading, empty, error, offline where applicable) and brand mode; copy follows the content guide; analytics events fire with properties; error codes map to messages with the reference; accessibility checks pass; budgets pass; it works on mocks and, once the endpoint is live, on staging; PR lists PRD IDs and the artboard link.

## 17. Environment variables (`apps/*/.env.example`)

| Variable | Example / note |
|---|---|
| `VITE_APP` | `shopper` \| `exit` \| `store` \| `admin` |
| `VITE_API_URL` | `http://localhost:4000` (staging `https://api.staging.skipa.ng`) |
| `VITE_USE_MOCKS` | `true` locally until endpoints land |
| `VITE_RELEASE` | `shopper@1.0.0+<sha>` (set in CI) |
| `VITE_SENTRY_DSN` | GlitchTip DSN (events go through `/v1/monitoring/tunnel`) |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile (shopper code request) |
| `VITE_CANVAS_URL` | `https://claude.ai/artifact/YQNrXAXnjqDJ521Ji6zHJH` (dev toolbar link only) |

No secrets in frontend env. The Paystack public key arrives in the payment-attempt response.

## 18. Local setup and tests

```bash
corepack enable && corepack prepare pnpm@12.23.0 --activate
```
```bash
pnpm install
```
```bash
pnpm tokens:build && pnpm api-client:gen
```
```bash
pnpm dev:mocks
```

`pnpm dev:mocks` runs the four apps against MSW (`:5173` shopper, `:5174` exit, `:5175` store, `:5176` admin); `pnpm dev` runs them against the local API once the backend is set up (see the backend brief). Phone testing on your LAN: `pnpm dev:mocks --host` and open `http://<laptop-ip>:5173` (camera needs HTTPS on phones: use `pnpm dev:https`, which serves with a local certificate).

| Command | Runs |
|---|---|
| `pnpm lint` / `pnpm typecheck` | ESLint, tsc |
| `pnpm test` | Vitest unit/component tests |
| `pnpm test:e2e` | Playwright journeys on mocks |
| `pnpm test:e2e:staging` | Playwright on staging |
| `pnpm test:a11y` | axe on every route |
| `pnpm size` / `pnpm lhci` | Bundle budgets / Lighthouse CI |
| `pnpm mocks:validate` | Fixtures and handlers against the contract |
| `pnpm gallery` | Component gallery with brand-mode switch |

## 19. Ask before deciding

Stop and ask the lead (do not guess) when a choice touches:
- **Money flows:** anything that shows or implies payment success, amounts, fees, refunds, payouts or chargebacks differently from this brief.
- **Data protection:** collecting any new personal data, showing personal data to a new role, sending anything to a third party, storing location.
- **The API contract:** any field or endpoint not in `api/openapi.v1.yaml`.
- **Design changes** beyond §2 (e.g. the undesigned name menu SD-22, new screens), new dependencies, or budget exceptions.

## 20. Reporting progress and blockers

- One PR per screen/flow, linked to its milestone, PRD IDs and canvas artboard; draft PRs early with screenshots in the three brand modes.
- Daily update in `docs/progress/frontend.md`: done, next, blocked (exact question + the default you will take if unanswered by a stated date).
- Contract gaps raised immediately as `contract-change` PRs and noted under "Contract" in the progress file.
- Milestone end: demo on staging (or mocks if the backend milestone is pending), budget numbers, device-lab results, open risks.
