# Skipa — Backend Agent Brief

| | |
|---|---|
| Version | 1.0, 25 November 2026 |
| You receive | This brief, `SKIPA_SYSTEM_ARCHITECTURE.md` (the architecture document, "AD"), the PRD (v2.0, with v1.0 for unchanged sections), `api/openapi.v1.yaml` (the contract), `db/schema.sql` (the first migration) |
| You report to | The Skipa lead engineer (human) — the only person who can approve changes to money flows, data protection or the contract |

Read this brief fully, then AD §1 (summary and decisions AD-01…AD-15), §6 (backend design), §7 (data) and §10 (observability) before writing code. Where this brief and the PRD disagree, this brief and the AD win: they record later owner decisions. Where the PRD and the design canvas disagree, the design canvas wins.

---

## 1. Your role and scope

You are the **backend agent**. You build and own:

- `apps/api` — the Fastify HTTP API (`src/server.ts`) and the pg-boss worker (`src/worker.ts`), all modules in `src/modules/*`, platform plumbing in `src/platform/*`, integrations in `src/integrations/*` (Paystack, POS, SMS, email, Telegram, PostHog, storage).
- `packages/contracts` — Zod schemas that generate `api/openapi.v1.yaml`, plus the error-code catalogue (`errors.ts`) and the event-name list.
- `packages/domain` — pure TypeScript shared by API and apps: money (kobo), fee maths, flagging rules, random-check blocks, state machines, RBAC map, contrast checker, WAT time helpers.
- `db/` — Drizzle schema, migrations, seed data.
- `infra/` — Docker Compose, Caddy, Ansible, pgBackRest, Grafana/Loki/Alloy/Prometheus config, Uptime Kuma checks, SOPS files layout.
- `.github/workflows` — CI, deploy, nightly suites.
- Repository bootstrap (monorepo root, tooling, lint/format config).

**Out of scope (owned by the frontend agent):** the four web apps (`apps/shopper`, `apps/exit`, `apps/store`, `apps/admin`), `packages/ui`, `packages/tokens`, `packages/api-client` generation config, `packages/mocks` (MSW handlers and fixtures), `packages/analytics` client batching, all screens, styling, service worker and scanner. You review frontend PRs that touch `packages/contracts` or `packages/domain`; they review yours that touch the contract.

**Not in the MVP:** referrals (RF-*), promotions, star tiers, the wallet (WL-*), native apps, connected scales, support agent role. Do not build them; keep the extension points named in AD §15.

---

## 2. Decisions you must respect (do not re-open)

| Topic | Decision |
|---|---|
| Money | Integer kobo everywhere (`bigint` in DB, `number` in TS via the branded `Kobo` type). Fees rounded half-up to the kobo. |
| Payments | Paystack only. Each store organisation has a **subaccount**; every transaction is initialised with `subaccount`, `transaction_charge` = Skipa fee in kobo (0 for pilot stores) and **`bearer: "subaccount"`** — the store pays Paystack's fee. Skipa never holds sale money. |
| Receipt rule | A receipt is issued **only** after server-side `GET /transaction/verify/:reference` returns success with matching amount, currency (NGN), reference and subaccount. Never from a client signal. |
| Refunds | **Never call Paystack's refund API.** Refunds are requested in Skipa, approved/declined in Skipa (head office above ₦20,000), **paid by the store outside Skipa**, then a manager **records** the payment (method, date, reference). Skipa's fee is **not** reversed on refunds. |
| Chargebacks | Respond automatically with evidence within Paystack's 16-hour window. Lost chargebacks: record a store receivable and a debit on Skipa's chargeback reserve ledger. |
| Exit | Online only. QR carries a signed token only. Server decides flags and random checks at Paid time. Single use, 30 minutes from Paid, branch-bound. |
| SMS | Only for shopper sign-in/registration codes. |
| Email | Staff, exit checker and super admin codes; invites; receipts (auto only if the shopper opted in, else on request); store alerts; summaries. Resend **Free** plan with a daily budget guard. |
| Alerts | Platform alerts → super admin in-app alert centre + Telegram; email only if Telegram fails. Store alerts → dashboard + email. Never SMS. |
| Stack | Exactly the versions in §3. No new services (no Redis, no Kafka, no extra SaaS) without approval. |

---

## 3. Approved stack (pin these)

| Area | Package / image | Version |
|---|---|---|
| Runtime | Node.js | 24 LTS (`.nvmrc` `24`) |
| Language | TypeScript | 7.0.2 (if a tool in the chain fails on 7.x, pin that package's toolchain to 6.x and note it in the PR) |
| Package manager / build | pnpm / Turborepo | 12.23.0 / 2.11.13 |
| HTTP | fastify | 5.12.8 |
| Validation | zod, fastify-type-provider-zod | 4.6.7, 7.0.0 |
| OpenAPI | @fastify/swagger | 9.9.5 |
| DB driver / ORM | pg, drizzle-orm, drizzle-kit | 8.23.1, 0.45.4, 0.31.11 |
| Jobs | pg-boss | 12.39.0 |
| Logging | pino | 10.4.0 |
| Errors | @sentry/node | 11.17.0 (DSN points at self-hosted GlitchTip 7.0) |
| Crypto | @oslojs/crypto, otplib, argon2 (only if ever needed) | 1.0.1, 13.6.0, 0.45.2 |
| PDFs, spreadsheets, QR | pdfkit, exceljs, qrcode | 0.21.0, 4.4.0, 1.5.4 |
| Images | sharp | latest 0.34.x at bootstrap (pin) |
| Tests | vitest, @playwright/test (owned with frontend), k6 | 5.1.1, 1.65.1, latest |
| Database | postgres (Docker) | 18.7 |
| Proxy | caddy | 2.11.9 |
| Observability | glitchtip/glitchtip 7.0.0, grafana/loki 3.7.10, grafana/alloy v1.22.0, prom/prometheus v3.16.0, grafana/grafana 13.2.7, louislam/uptime-kuma 2.5.12 | as listed |

Hosting: Hetzner Cloud CPX32 (Helsinki) for production, CPX22 for staging; Cloudflare Free in front; Cloudflare R2 for backups and brand images; Uptime Kuma on a Melbicom Lagos VDS-1. Secrets with SOPS + age.

---

## 4. Repository layout you create (M0)

```
skipa/
├─ apps/api/
│  ├─ src/server.ts                 Fastify bootstrap (plugins, routes, swagger, SSE)
│  ├─ src/worker.ts                 pg-boss bootstrap, job registration, cron, in-process ticks
│  ├─ src/platform/                 config.ts (Zod-validated env) · db.ts (pools, tx helper, RLS SET LOCAL)
│  │                                auth.ts · rbac.ts · idempotency.ts · errors.ts · logger.ts · request-id.ts
│  │                                realtime.ts (NOTIFY + SSE hub) · queue.ts · rate-limit.ts · crypto.ts
│  ├─ src/modules/<module>/         routes.ts · service.ts · repo.ts · jobs.ts · events.ts · *.test.ts
│  └─ src/integrations/             paystack/ · pos/{connector.ts,registry.ts,generic_csv,mock_pos} · sms/{africastalking,termii}
│                                   email/resend.ts · telegram/ · posthog/ · storage/r2.ts
├─ packages/contracts/              src/schemas/*.ts · src/errors.ts · src/events.ts · scripts/build-openapi.ts
├─ packages/domain/                 money.ts · fees.ts · flagging.ts · random-blocks.ts · state-machines.ts · rbac.ts · contrast.ts · time.ts · pos.ts
├─ api/openapi.v1.yaml              GENERATED from packages/contracts (committed)
├─ db/migrations/ · db/seed/ · db/schema.sql
├─ infra/{compose,caddy,ansible,pgbackrest,grafana,alloy,prometheus,kuma,secrets}/
├─ e2e/ (shared with frontend) · docs/ (runbooks, ADRs, metrics.md, tracking-plan.md, pos/generic_csv.md)
└─ .github/workflows/{ci.yml,deploy-staging.yml,deploy-prod.yml,nightly.yml}
```

Modules (AD §6.1): `identity`, `tenancy`, `catalogue`, `shopping`, `payments`, `receipts`, `exit`, `refunds`, `disputes`, `pos`, `recon`, `notifications`, `support`, `stars`, `branding`, `analytics`, `audit`, `privacy`, `exports`, `monitoring`, `tours`.

**Module rules (enforced by ESLint `no-restricted-imports`):** `routes.ts` validates and calls the service, nothing else; `service.ts` has no Fastify imports and receives a transaction (`Tx`) and repositories; only `repo.ts` touches tables; only `modules/identity` and `modules/privacy` may import `pii.*` tables; nothing imports a Paystack refund helper (none exists).

---

## 5. The API contract is the agreement

- `api/openapi.v1.yaml` (OpenAPI 3.1, 177 operations, 148 schemas) is the contract between you and the frontend agent. **You implement it exactly.** The frontend builds against it with MSW mocks until your endpoints are live.
- From M0 onward the source of truth becomes `packages/contracts` (Zod). `pnpm contract:build` regenerates the YAML; CI (`pnpm contract:check`) fails if the committed YAML differs from the generated one, or if the generated YAML differs semantically from the agreed file without a `contract-change` label.
- **Changing the contract:** open a PR labelled `contract-change` that edits Zod + regenerated YAML, list what changed and why, and get the frontend agent's approval. Additive and optional changes are fine; anything breaking needs the lead's approval and goes under `/v2` after launch. Never change behaviour silently.
- Conventions (AD §6.2): camelCase JSON; money as integer `*Kobo`; ISO-8601 UTC times; cursor pagination `{data, nextCursor}`; errors `{error:{code,message,userMessage,requestId,details}}`; `X-Request-Id` on every response; `Idempotency-Key` required where the contract lists it.
- Fixtures in `mocks/fixtures/*.json` show valid example payloads (validated against the contract); keep your responses compatible with them.

---

## 6. Module build order and milestones

Work in this order. Each milestone ends with the acceptance criteria (AC) passing in CI and on staging. PRD IDs in brackets.

### M0 — Foundations (weeks 1–2)

Build: monorepo, lint/format/typecheck, CI (`ci.yml`), Docker dev compose (Postgres 18.7), `db/schema.sql` → Drizzle schema + migration `0000_init`, seed (§9), `platform/*` plumbing (config, logger with redaction, request IDs, errors with codes, idempotency, RLS transaction helper, rate limiting with Postgres store, SSE hub), `/health/live`, `/health/ready`, contract generation pipeline, staging server provisioned with Ansible, GlitchTip + Loki + Grafana on staging.

AC: CI green on an empty feature; `pnpm db:migrate && pnpm db:seed` on a clean DB; every response has `X-Request-Id`; idempotency replay test passes; an RLS test proves organisation A cannot read organisation B even if a query omits the filter (DM-04); generated OpenAPI equals the committed file.

### M1 — Identity, tenancy, catalogue, check-in (weeks 3–4)

Build: devices; OTP request/verify (SMS shoppers via Africa's Talking + Termii failover; email staff via Resend); registration with consents; sessions (cookie + bearer, per-surface timeouts); staff invites (email for every role incl. exit checkers); RBAC; tenancy (organisations, branches, settings, QR codes, feature flags); catalogue (generic_csv product import, mapping, readiness, catalogue snapshot with ETag); store search; check-in; cart sync quotes; unknown barcodes; session timeout job; tour progress.

AC: SH-01, SH-02, SH-05–08 (incl. "I've used Skipa before"), SH-11 (snapshot ETag/304), SH-12, SH-13 (unknown barcodes stored), SH-16 (price change detected), SH-25–27, RB-01–03, NF-11 (5 wrong codes → 15-min lock; 5 sends/15 min/destination), NF-28 (invite 7 days, single use), CT-01–09 (custom category with an alcoholic drink is extra checks and cannot be lowered; missing weight never sellable; till-only never sellable), CS-06.

### M2 — Orders, Paystack, receipts (weeks 5–7)

Build: orders (prices re-checked, limits CART-004, idempotency), payment attempts (initialise on subaccount with `transaction_charge` and `bearer:"subaccount"`, attempt re-use), webhook endpoint (raw-body HMAC-SHA512), `payments.process_webhook`, `payments.verify` (+10 s, +30 s, +2 min, +10 min), `payments.sweep_pending`, verify rules, Failed→Paid late success, stray charges, availability circuit breaker (NF-05), receipts with Ed25519 exit tokens, exit plans decided at Paid (flag rules + random blocks), POS sale posting outbox row, receipt email (opt-in), order SSE, rating, `/v1/me/receipts`.

AC (PRD 8.5 + 5.9): replaying the same webhook 10 times creates one Paid order; a payment confirmed 15 minutes late still produces a receipt and a POS posting; an unconfirmed payment never produces a receipt; amount mismatch → no receipt + PAY-010 alert; double tap on Pay → one attempt; payment pending > 2 min sets `pendingTooLong` and logs PAY-007; card/transfer/USSD can be switched off per branch (PY-11); receipt issued < 5 s after verify succeeds (SSE); PY-01–06, SH-17–24, CS-01–03.

### M3 — Exit checks (weeks 8–9)

Build: exit lookup (token or receipt number; invalid reasons), clear-in-one-step, flagged checks with items, weight entry and tolerance, complete with "all flagged ticked" guard, open-check resume, abandon job, heartbeat endpoint + 15-second monitor + EXIT-004 store alert at 60 s, shift summary, hand-over, checker signals job, random-check blocks, settings change for random rate (1/2/5/10/15/20 only, logged).

AC (PRD 6.6): a non-flagged receipt clears in one scan; a receipt cannot be used twice (concurrent lookups from two devices → one clear, one "already used"); across 1,000 receipts the random rate is within 1 pp of each allowed rate (property test); every check appears on the store dashboard stream within 5 s; no clearance possible without a connection (server never accepts queued checks — there is no endpoint for them); manager alert within 60 s of the last heartbeat; a rate below 1% cannot be saved; EX-01–12, NF-26, RB-06.

### M4 — Refunds (recorded), disputes, support, stars (weeks 10–11)

Build: refund requests (shopper) and store-initiated refunds; approve/decline; head-office threshold; **record payment** (cash, bank transfer with reference, card reversal, other); POS refund posting; stars reversal; reminders at 24 h/48 h; disputes from webhooks, evidence PDF and Paystack evidence submission, deadline watch (Telegram at 2 h, critical at 8 h); lost chargeback → receivable + reserve debit + POS chargeback posting; support tickets, messages, statuses, SLA watch, escalation, rating; FAQ CRUD and matching (Postgres full-text search + trigram + synonyms); stars award/cap/claim.

AC: shopper cannot choose an item or amount (whole order only); refund above ₦20,000 waits for head office; a refund cannot reach `paid` without method and date (and reference for transfers); every test chargeback gets an evidence response without manual action; a support message reaches the branch inbox within 10 s with order details attached (9.3); a store reply reaches the shopper's Support tab (and email if given); the chatbot answers payment questions from the real order state and offers support when unsure; ST-01–10, HP-01–15, SH-22, SH-32, PY-07–10.

### M5 — POS framework and reconciliation (weeks 10–12, parallel with M4)

Build: `PosConnector` interface and registry, `generic_csv`, `mock_pos` (with outage simulation), POS postings worker with backoff and alerts, daily sales/refunds file and shift-close (23:30 WAT), POS health, settlements fetch, `recon.daily` (02:00 WAT + on settlement), reconciliation items with causes, manual resolve with reason, payout reports, monthly billing statements, chargeback reserve endpoints, receivables. Build the vendor API connector as soon as the pilot store's POS is known.

AC (PRD 12.5): a 500-order test day matches every order across receipt, POS and Paystack or lists it with a cause; a POS price change shows within 5 minutes (API mode); after a 2-hour POS outage all sales post once with no duplicates; the payout report's Skipa fee line equals the fee split by Paystack; PO-01–10, PY-13, SA-08.

### M6 — Notifications, analytics, admin, privacy (weeks 12–13)

Build: notification templates (versioned), email budget guard, Telegram alerts with email fallback, alert centre APIs, daily summary (21:30) and weekly loss report (Mon 08:00, pilot only); analytics ingest, standard properties, store and platform reports (SQL), PostHog forwarder with cap; admin APIs (organisations, onboarding checklist, plan change, subaccount creation, shoppers with reason gate, transactions and order trace, billing, flags, settings, templates, loyalty, users, audit, exports, view-as, branch and platform switch); privacy jobs (data requests, retention purge, store offboarding); error index for the Errors screen.

AC: SA-01–09 (incl. second-step flag blocks inviting a second super admin while off), RB-04, RB-05, RB-07, SD-05 (every export logged), SD-06, SD-07, NT-01–06, AN-01–11 (automated test fires every plan event with standard properties; no personal data in PostHog payloads), ER-01–12 (front-end error request ID found in backend log and Paystack call log), NF-16, NF-17.

### H1 — Hardening (weeks 14–16)

All PRD 17.1 scenarios green on staging with the pilot store's POS test data; k6 load tests (AD §13.6); restore drill timed (< 1 h); external penetration test findings fixed; runbooks for every critical alert. Only then is a pilot date proposed.

---

## 7. Database and migrations

- `db/schema.sql` is the agreed starting schema (PostgreSQL 18; uses built-in `uuidv7()`). Translate it into `apps/api/src/db/schema.ts` (Drizzle) table for table, and make migration `0000_init` from the SQL file directly (Drizzle cannot express triggers, RLS policies, partial unique indexes or generated tsvector columns — keep those as hand-written SQL in the migration).
- Keep these invariants (tests must prove each): append-only triggers on `order_items`, `order_status_history`, `refund_status_history`, `exit_plans`, `financial_adjustments`, `chargeback_reserve_ledger`, `star_ledger`, `product_price_history`, `pii.consents`, `audit.*`; `one_successful_attempt_per_order`; `one_open_check_per_order`; `one_live_refund_per_order`; `line_total = unit × qty`; random rate CHECK; RLS `tenant_isolation` on every tenant table.
- Roles: `skipa_app` (RLS enforced; request traffic for shopper, exit and store surfaces), `skipa_platform` (BYPASSRLS; worker and super admin routes), migration owner. Each request transaction runs `SET LOCAL app.org_ids = '<comma-separated org ids>'`.
- Migration policy: expand → migrate → contract; never drop or rename in the same release that stops using it; `CREATE INDEX CONCURRENTLY` in its own migration; CI applies all migrations to an empty DB and to the previous release's schema.
- Partitions: `analytics.events` monthly; `analytics.partitions_maintain` creates three months ahead and drops partitions older than 24 months.

---

## 8. Background jobs

pg-boss queues; cron in WAT (`tz: 'Africa/Lagos'`); job payloads carry `requestId`. Sub-minute ticks (`exit.heartbeat_monitor` every 15 s, `payments.availability` every 30 s) run in the worker process guarded by `pg_try_advisory_lock`.

| Job | Trigger | Retries · expire | Notes |
|---|---|---|---|
| `payments.verify` | delayed +10 s/+30 s/+2 min/+10 min | 3 · 15 s | singletonKey = attempt id |
| `payments.process_webhook` | each stored webhook | 5 · 30 s | idempotent state checks |
| `payments.sweep_pending` | `*/5 * * * *` | 3 · 120 s | attempts 10 min–24 h; expire > 24 h |
| `payments.availability` | tick 30 s | — | breaker → `payments_available` |
| `receipts.email` | on Paid (opt-in) / request | 5 · 30 s | bulk priority |
| `exit.heartbeat_monitor` | tick 15 s | — | offline at 45 s, alert at 60 s |
| `exit.abandon_open_checks` | `*/5 * * * *` | 3 · 60 s | open > 30 min |
| `exit.checker_signals` | `0 6 * * *` | 3 · 10 min | EX-08 rules |
| `sessions.timeout` | `* * * * *` | 3 · 60 s | `session_abandoned` |
| `catalogue.rebuild_snapshot` | on change (debounce 30 s, singleton per branch) | 5 · 60 s | |
| `catalogue.stale_price_check` | `*/15 * * * *` | 3 · 60 s | 24 h stale → paused |
| `pos.pull_catalogue` | `*/5 * * * *` per API org | 3 · 4 min | singleton per org |
| `pos.import_file` | on upload | 3 · 10 min | row errors returned |
| `pos.post` | outbox; backoff 1, 2, 5, 10 min then 10 min for 24 h | per schedule · 30 s | alerts after 5 failures |
| `pos.build_daily_files` | `30 23 * * *` | 5 · 10 min | sales/refunds + shift-close |
| `recon.fetch_settlements` | `0 7-21 * * *` | 5 · 5 min | Paystack settlements API |
| `recon.daily` | `0 2 * * *` + on settlement | 3 · 30 min | three-way match |
| `recon.billing_monthly` | `0 3 1 * *` | 3 · 30 min | fee vs split |
| `disputes.respond` | on dispute webhook | 5 · 2 min | evidence PDF + submit |
| `disputes.deadline_watch` | `*/15 * * * *` | 3 · 60 s | 2 h / 8 h alerts |
| `refunds.record_reminder` | `0 * * * *` | 3 · 60 s | 24 h manager, 48 h head office |
| `support.sla_watch` | `*/5 * * * *` in opening hours | 3 · 60 s | HP-12 |
| `notifications.send_email` / `send_sms` / `send_telegram` | queue | 5 / 3 / 3 · 20 s | budget guard; SMS failover; Telegram → email fallback |
| `notifications.email_budget_release` | `0 6 * * *` | 3 · 120 s | releases held receipts |
| `reports.daily_summary` | `30 21 * * *` | 3 · 10 min | |
| `reports.weekly_loss` | `0 8 * * 1` | 3 · 10 min | pilot organisations only |
| `stars.award` / `stars.reverse` | events | 5 · 30 s | |
| `analytics.forward_posthog` | `*/5 * * * *` | 3 · 2 min | cap 900k/month |
| `analytics.partitions_maintain` | `0 1 * * *` | 3 · 60 s | |
| `privacy.process_requests` | `0 * * * *` | 3 · 30 min | 30-day deadline |
| `privacy.retention_purge` | `30 3 * * *` | 3 · 60 min | AD §7.6 |
| `privacy.store_offboarding` | on organisation ended + daily | 3 · 60 min | 30 days |
| `exports.build` | on request | 2 · 15 min | CSV/XLSX, link 24 h |
| `invites.expire` | `0 * * * *` | 3 · 60 s | |
| `alerts.digest` | `0 8 * * *` | 3 · 60 s | medium alerts to Telegram |
| `branding.process_asset` | on upload | 3 · 60 s | WebP; logo ≤ 50 KB, cover ≤ 150 KB |

Every job failure is logged with its error code; alerting per AD §10.5.

---

## 9. Seed data (`pnpm db:seed`, never in production)

Standard categories (10) and default check levels; platform settings; feature flags (`superadmin_second_step` off); star rules v1; templates v1; 30 platform FAQs and synonyms. Organisations: **Adunni Mart** (pilot until 2027-01-15, 0% fee, branches `LK` Lekki Phase 1 and `IK` Ikeja GRA, API mode via `mock_pos`, brand primary `#7A1F4A`, accent `#F2B705`) and **Harbour Grocers** (paid, 2%, branch `VI` Victoria Island, file mode via `generic_csv`, primary `#B3400F`, accent `#1D6F8A`). One staff user per role per organisation (`manager.lk@adunni.test`, `ho@adunni.test`, `checker.lk@adunni.test`, …) and super admin `tolu@skipa.test`; local code `000000` via `OTP_DEV_FIXED_CODE` (rejected unless `APP_ENV=local`). About 1,300 products per branch (valid EAN-13 check digits, weights, prices ₦200–₦60,000) including till-only, missing-weight, variable-price, extra-checks and stale-price cases. Thirty days of activity (~200 orders/day/branch) with exits, flags, random checks, mismatches, refunds and disputes in every state, tickets, unknown barcodes, a POS outage window and one settlement fee mismatch. Fifty registered shoppers with consents, stars and all five avatars. Seed IDs and values must match `mocks/fixtures` where they overlap (e.g. order `SKP-LK-04815`, receipt `LK-04822`).

---

## 10. Webhook handling

| Webhook | Route | Rules |
|---|---|---|
| Paystack | `POST /v1/webhooks/paystack` | Capture raw body (`addContentTypeParser`); `x-paystack-signature` must equal HMAC-SHA512(raw body, `PAYSTACK_SECRET_KEY`) — timing-safe compare; invalid → 401, log PAY-009, nothing else; valid → insert `paystack_events` with `dedupe_key` (unique; duplicates return 200 and stop), respond 200 within 1 s, enqueue `payments.process_webhook`. Handle `charge.success`, `charge.dispute.create`, `charge.dispute.remind`, `charge.dispute.resolve`; ignore and log others. Processing always re-verifies with Paystack; it never trusts the webhook body alone. |
| Resend | `POST /v1/webhooks/resend` | Svix signature (`svix-id`, `svix-timestamp`, `svix-signature`, `RESEND_WEBHOOK_SECRET`, 5-min tolerance); update `notifications` (delivered, bounced → NOTIF-005, complained → suppress address). |
| SMS DLR | `POST /v1/webhooks/sms/{provider}` | Shared secret in path/query per provider; update delivery status; failure → NOTIF-002 and Termii failover for codes not delivered in 60 s. |
| POS push | `POST /v1/webhooks/pos/{connectorKey}/{organisationId}` | `connector.verifyPush()` (HMAC or key); upsert prices/stock; 202. |

---

## 11. Paystack sandbox test plan (`pnpm test:paystack`, nightly on staging with test keys)

| # | Case | Expected |
|---|---|---|
| P1 | Card success (Paystack test card) via inline flow | Paid ≤ 5 s after webhook; receipt; exit plan; POS posting queued |
| P2 | Card declined | Attempt failed; order failed; retry on same order works |
| P3 | Bank transfer pending then paid | Pending screen state; Paid on webhook/poll |
| P4 | USSD (if supported by sandbox) | As P3 |
| P5 | Popup closed, webhook later | Paid via webhook; client sees SSE |
| P6 | Redirect fallback | `/v1/payments/return` redirects to confirming route; no success from redirect |
| P7 | Late webhook (hold processing 15 min) | Receipt issued late; POS posting created |
| P8 | Same webhook ×10 | One Paid order; 9 duplicates ignored |
| P9 | Invalid signature | 401; no state change; PAY-009 logged |
| P10 | Amount mismatch (tampered test) | No receipt; PAY-010 critical alert; stray charge |
| P11 | Double tap on Pay (same idempotency key) | One attempt; same access code |
| P12 | Superseded attempt also paid | Stray charge PAY-011; store refund task with `liability = skipa` |
| P13 | `transaction_charge` = 0 with `bearer: "subaccount"` (pilot) | Accepted; settlement shows 0 Skipa share, fee on subaccount — **record the real behaviour; if rejected, omit `transaction_charge` and rely on subaccount `percentage_charge: 0`** |
| P14 | `transaction_charge` > 0 (paid store, 2%) | Settlement shows Skipa share = fee and Paystack fee borne by subaccount |
| P15 | Dispute created | Evidence PDF uploaded and submitted automatically; dispute `evidence_submitted` |
| P16 | Settlement fetch | Lines stored; recon ties; payout report correct |
| P17 | Paystack unreachable (DNS block in test) | Breaker opens ≤ 2 min; `payments_available=false`; critical alert |

Write down every behaviour that differs from the AD in `docs/paystack-sandbox-findings.md` and tell the lead before relying on it.

---

## 12. Security checklist (must be true before go-live)

- [ ] No secret in code, images, logs or CI output; SOPS files only; Gitleaks in CI.
- [ ] Live Paystack keys refused outside production; test keys refused in production.
- [ ] Webhook signatures verified (Paystack, Resend, SMS, POS) with timing-safe compares.
- [ ] Receipts only from server verify; no route lets a client set payment status.
- [ ] Idempotency on every listed endpoint; replay and concurrency tests pass.
- [ ] Rate limits as AD §6.2; OTP lock after 5 wrong codes; SMS only to `+234`; Turnstile check on shopper code requests after 2 per device.
- [ ] Sessions: 32-byte random tokens, SHA-256 at rest, per-surface httpOnly `__Host-` cookies, `SameSite=Lax`, `X-Skipa-Client` required on mutations, CORS allow-list of the four app origins.
- [ ] RBAC on every route (`requirePermission`), scope-required repositories, RLS enabled; isolation suite (every role × other org/branch) passes.
- [ ] Personal data: AES-256-GCM for phone/email/guest emails; HMAC lookups; masked in admin lists; reason gate; every view/export audited.
- [ ] Logs and errors redact authorization, cookies, signatures, phone, email, names, account numbers, coordinates, OTPs, tokens.
- [ ] Exit tokens Ed25519 with `kid`; single use enforced under row lock.
- [ ] Outbound POS requests restricted to allow-listed hosts; private IP ranges blocked (SSRF).
- [ ] Dependencies: `pnpm audit --prod` clean of high/critical, Renovate on, Semgrep CE and Trivy in CI.
- [ ] Backups encrypted; restore drill done and timed; WAL archive age alert active.
- [ ] Super admin: new-device notice, sign-in log, second-step flag ready; inviting a second super admin blocked while the flag is off.
- [ ] Penetration test done; criticals and highs fixed.

---

## 13. Coding standards

TypeScript `strict`, `noUncheckedIndexedAccess`; no `any` in `packages/domain`; ESLint (typescript-eslint strict) + Prettier; Conventional Commits; money only via `packages/domain/money.ts`; time only via `packages/domain/time.ts` (store UTC, compute business days in WAT); every thrown business error uses a catalogue code (`AppError('PAY-007', …)`); every privileged action writes `audit.audit_log` with before/after/reason; every state change writes its history table; every enqueue inside the same transaction as the state change; no `SELECT *` in repositories; SQL parameters only.

## 14. Testing requirements and definition of done

A task is **done** when: the code follows the module template; unit tests (Vitest) cover the domain logic (≥ 90% lines in `packages/domain` and money-path services); integration tests (real Postgres 18 in CI, Fastify `inject()`) cover every route you added — happy path, validation, permission/scope, idempotency, state guards; the relevant PRD acceptance criteria have named tests (`ac-<section>-<n>`); the OpenAPI contract is unchanged or changed through a `contract-change` PR; analytics events and error codes for the feature are emitted and tested; logs carry request IDs with no personal data; CI is green; it is deployed to staging and the smoke test passes; the PR description lists PRD IDs and any open questions.

## 15. Environment variables (`apps/api/.env.example`)

| Variable | Example / note |
|---|---|
| `APP_ENV` | `local` \| `staging` \| `production` |
| `NODE_ENV` | `development` \| `production` |
| `PORT` | `4000` |
| `PUBLIC_API_URL` | `http://localhost:4000` |
| `APP_ORIGINS` | `http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176` |
| `DATABASE_URL` | `postgres://skipa_app:…@localhost:5432/skipa` (RLS role) |
| `DATABASE_PLATFORM_URL` | `postgres://skipa_platform:…@localhost:5432/skipa` |
| `DATABASE_MIGRATION_URL` | owner role |
| `PG_POOL_MAX` | `20` |
| `OTP_PEPPER`, `DEVICE_TOKEN_SECRET`, `REGISTRATION_TOKEN_SECRET` | 32-byte random, base64 |
| `OTP_DEV_FIXED_CODE` | `000000` (local only; refused otherwise) |
| `PII_ENCRYPTION_KEY`, `PII_HMAC_KEY`, `CONFIG_ENCRYPTION_KEY`, `TOTP_ENCRYPTION_KEY` | 32-byte keys, base64 |
| `EXIT_TOKEN_SIGNING_KEYS` | JSON `[{"kid":"k1","privateKeyPem":"…"}]` (Ed25519) |
| `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` | `sk_test_…`, `pk_test_…` |
| `PAYSTACK_BASE_URL` | `https://api.paystack.co` |
| `PAYSTACK_CALLBACK_URL` | `https://api.staging.skipa.ng/v1/payments/return` |
| `PAYMENT_EMAIL_DOMAIN` | `pay.skipa.ng` (pseudonymous customer emails) |
| `AT_USERNAME`, `AT_API_KEY`, `AT_SENDER_ID` | Africa's Talking |
| `TERMII_API_KEY`, `TERMII_SENDER_ID` | Termii (failover) |
| `SMS_WEBHOOK_SECRET` | shared secret for delivery reports |
| `SMS_ALLOWLIST` | staging only: comma list of team numbers |
| `SMS_TRANSPORT`, `EMAIL_TRANSPORT` | `console` locally, provider otherwise |
| `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `EMAIL_FROM` | `Skipa <no-reply@skipa.ng>` |
| `EMAIL_DAILY_LIMIT`, `EMAIL_MONTHLY_LIMIT`, `EMAIL_DAILY_RESERVE` | `100`, `3000`, `40` |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALERT_CHAT_ID`, `PLATFORM_ALERT_EMAIL` | platform alerts |
| `POSTHOG_API_KEY`, `POSTHOG_HOST`, `POSTHOG_MONTHLY_CAP` | `https://eu.i.posthog.com`, `900000` |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `RELEASE` | GlitchTip DSN; `api@1.0.0+<sha>` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_ASSETS`, `R2_PUBLIC_BASE_URL` | brand images |
| `FILES_DIR` | `/srv/skipa/files` (exports, POS files, evidence) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile |
| `BUSINESS_TZ` | `Africa/Lagos` (process `TZ` stays `UTC`) |
| `LOG_LEVEL` | `info` |

`platform/config.ts` validates all variables with Zod at start-up and refuses to boot on anything missing or inconsistent.

## 16. Local setup and running tests

```bash
corepack enable && corepack prepare pnpm@12.23.0 --activate
```
```bash
pnpm install
```
```bash
cp apps/api/.env.example apps/api/.env
```
```bash
docker compose -f infra/compose/dev.yaml up -d postgres
```
```bash
pnpm db:migrate && pnpm db:seed
```
```bash
pnpm dev
```

`pnpm dev` runs the API on `:4000`, the worker, and the four apps (`:5173` shopper, `:5174` exit, `:5175` store, `:5176` admin). OpenAPI UI at `http://localhost:4000/docs`. Sign in with seeded emails/phones and code `000000`.

| Command | Runs |
|---|---|
| `pnpm lint` / `pnpm typecheck` | ESLint, tsc |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:int` | Integration tests (needs the dev Postgres) |
| `pnpm test:ac` | Acceptance-criteria suite |
| `pnpm test:pos-conformance mock_pos` | POS connector conformance suite |
| `pnpm test:paystack` | Sandbox suite (staging keys) |
| `pnpm contract:build` / `pnpm contract:check` | Regenerate / verify `api/openapi.v1.yaml` |
| `pnpm k6:pilot` / `pnpm k6:branch-peak` | Load tests |

## 17. Analytics events you own (server-side)

`session_started`, `registration_completed`, `returning_sign_in_completed`, `price_changed_at_checkout`, `payment_started`, `payment_succeeded`, `payment_failed`, `receipt_issued`, `exit_check_completed`, `exit_device_offline`, `exit_device_online`, `refund_requested`, `refund_resolved`, `session_abandoned`, `support_ticket_created`, `support_ticket_resolved`, `stars_awarded`, `stars_removed`, `branch_switched_off`, `branch_switched_on`, `branding_published`, `random_check_rate_changed`, `staff_invited`, `staff_invite_accepted`. You also own the ingest endpoint, standard-property enrichment, the event-name allow-list in `packages/contracts/events.ts` (shared with the frontend), and the PostHog forwarder. Property lists: AD §9.1.

## 18. Error codes you own

All codes in AD §10.3 are defined in `packages/contracts/errors.ts` by you (with severity and user message). You raise every server-side code: AUTH-001…010, SCAN-002…006 (server checks), CART-001…006, PAY-001…023, RCPT-001…006, EXIT-001…007, POS-001…012, RECON-001…005, NOTIF-002…006, SUPP-001…004, SYS-*. The frontend raises only client-side SCAN-001 (camera) and maps every code to its message.

## 19. Ask before deciding

Stop and ask the lead (do not guess) when a choice touches:
- **Money flows:** fee calculation, Paystack parameters or behaviour that differs from AD §6.6, settlement/recon matching rules, refunds, chargebacks, reserve or receivables.
- **Data protection:** new personal data fields, new places personal data goes (logs, analytics, third parties), retention, cross-border transfers, admin access to personal data.
- **The API contract:** any change to `api/openapi.v1.yaml`.
- **New infrastructure or vendors**, or anything that adds monthly cost.
- **Security controls:** weakening any item in §12.

## 20. Reporting progress and blockers

- One PR per task, linked to its milestone and PRD IDs; draft PRs early.
- Daily (end of working session) post a short update in `docs/progress/backend.md`: done, next, blocked (with the exact question and the default you will take if unanswered by a stated date).
- Blockers that affect the frontend (endpoint delay, contract change) are raised immediately in the PR and in the progress file under "Contract".
- At each milestone end: demo on staging, list of AC tests with results, open risks.
