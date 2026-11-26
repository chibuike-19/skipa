# Backend progress

Updated at the end of every working session: done, next, blocked. Times are WAT.

## 2026-11-26

### Done

- Read the backend brief in full and AD §1, §5, §6, §7, §10, §12.3–12.5 and §17. Posted the plan for
  the repository setup and M0. The lead answered the questions:
  - Pack placement: use the lead's table. I moved only the backend's files.
  - GitHub: hand over a local branch for the lead to push.
  - Generated contract matches the agreed file in meaning, not byte for byte.
  - M0 seed leaves out the 30 days of activity; each milestone seeds its own area.
  - Staging: I write the playbook and the compose file; provisioning waits for access.
- PR 1, repository setup (`chore/SKP-0-bootstrap`): monorepo root (pnpm 12.23.0 workspaces,
  Turborepo 2.11.13, Node 24), `packages/config` (ESLint typescript-eslint strict type-checked,
  Prettier, TypeScript base config with `strict` and `noUncheckedIndexedAccess`, Vitest, commitlint),
  skeleton folders for both agents, CODEOWNERS, PR template, `ci.yml`, pack files placed.
  `format:check`, `lint`, `typecheck` and `test` pass locally on Node 24.22.3. CI has not run on
  GitHub yet because there is no remote.
- ADR-32: TypeScript 7.0.2 for type-checking, 6.0.3 only as the typescript-eslint parser.

### Next (M0, one PR each)

1. Database: dev compose (Postgres 18.7), migration `0000_init` from `db/schema.sql`, Drizzle
   schema, invariant tests (append-only, partial unique indexes, RLS isolation DM-04).
2. Platform plumbing: config, logger with redaction, request IDs, errors, idempotency, RLS
   transaction helper, Postgres-backed rate limits, SSE hub, queue, health endpoints.
3. `packages/domain`: `money.ts`, `time.ts`.
4. `packages/contracts`: Zod schemas for 177 operations and 148 schemas, `errors.ts`, `events.ts`,
   `contract:build` / `contract:check`.
5. Full CI: integration tests, contract check, Gitleaks, Semgrep, `pnpm audit`, Trivy;
   `.env.example`; SOPS layout.
6. Seed (without the 30 days of activity).
7. Staging playbook and compose file.

### M0 status (26 Nov 2026, second session)

Local branches, stacked, merge in this order: `chore/SKP-0-bootstrap` → `feat/SKP-1-db` →
`feat/SKP-2-domain-money-time` → `feat/SKP-3-platform`.

- PR 2 (db): done. PR 3 (domain): done.
- PR 4 (platform): done. Config, logger with redaction, request IDs, error catalogue and
  envelope, RLS transaction helper, idempotency, Postgres rate limits (migration 0002, ADR-34),
  SSE hub, CORS/security headers, Sentry, health routes. 22 unit tests plus 40 new integration
  tests (73 integration in total) pass. The real server was started locally and checked with curl.
- PR 5 (contracts, `feat/SKP-4-contracts`): done. Zod source for all 177 operations and 148
  schemas; `contract:build`/`contract:check`; the generated YAML has no semantic differences
  from the agreed file; all 9 pack fixtures validate against the YAML and against the Zod schemas
  at runtime; CI contract job with the `contract-change` label rule (ADR-35). The YAML layout
  changed once with the same meaning: label this PR contract-change (formatting only) for the
  frontend agent.
- Next: CI security scans + SOPS layout; seed; staging playbook.
- Decision: pg-boss is deferred to M1, where the first jobs arrive. `/health/ready` reports the
  queue as `not_installed`.

### Questions for the lead (default if no answer by 30 Nov 2026)

- RLS covers only the 46 tables `schema.sql` lists. These tables also hold tenant data but have no
  RLS: `users`, `staff_invites`, `faqs`, `notifications`, `alerts`, `exports`, `error_events`,
  `pii.visited_stores`, `pii.consents`, `pii.data_requests`, `audit.*`, `analytics.events`.
  Default: keep the agreed list; repositories enforce scope. In M1 I propose policies that allow
  NULL organisation_id where it is needed.
- `/docs` OpenAPI UI needs `@fastify/swagger-ui`, which is not in the approved stack. Default: no
  UI; serve the YAML file.
- Draft user copy for SYS-409/410/426/429/003 (in errors.ts) needs the frontend's review.

### Blocked

- **CODEOWNERS handles.** Question: which GitHub users or teams are the lead, the backend agent and
  the frontend agent? Default if unanswered by 30 Nov 2026: the placeholders stay, and "Require
  review from Code Owners" stays off until they're replaced.
- **Staging provisioning** needs Hetzner access, the domain, the lead's age public key and
  Cloudflare access. Default (agreed): write and check the playbook locally; M0 reports staging as
  not provisioned.

### Contract

- No change. `api/openapi.v1.yaml` is the agreed file, byte-for-byte.
