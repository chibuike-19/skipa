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

All eight M0 PRs are on GitHub as a stack. Merge in this order; after each squash-merge I
rebase the next branch onto `main` and retarget it:

| Order | PR  | Branch                         | What                                                                     |
| ----- | --- | ------------------------------ | ------------------------------------------------------------------------ |
| 1     | #1  | `chore/SKP-0-bootstrap`        | Monorepo, tooling, CI                                                    |
| 2     | #2  | `feat/SKP-1-db`                | Migration 0000, Drizzle, invariant tests                                 |
| 3     | #3  | `feat/SKP-2-domain-money-time` | `money.ts`, `time.ts`                                                    |
| 4     | #4  | `feat/SKP-3-platform`          | Platform plumbing, health routes                                         |
| 5     | #7  | `feat/SKP-4-contracts`         | Zod contract, `contract:check` (label: contract-change, formatting only) |
| 6     | #5  | `ci/SKP-5-security-scans`      | Gitleaks, Semgrep, Trivy, audit, SOPS                                    |
| 7     | #6  | `feat/SKP-6-seed`              | Seed data, PII crypto                                                    |
| 8     | new | `feat/SKP-7-staging-infra`     | Image, staging stack, Ansible, deploy                                    |

- PRs 1–7: done, CI green on GitHub.
- PR 8: done except what needs real servers. API image 96 MB compressed; staging compose
  (Caddy, API, Postgres, GlitchTip 7, Loki, Alloy, Grafana) deployed end to end on local
  Docker with `deploy.sh` (migrate, seed, health checks through Caddy over TLS); Ansible
  playbook passes syntax check and ansible-lint; `deploy-staging.yml` builds, scans and pushes
  the image on every merge and deploys once `STAGING_HOST` is set.
- Decision: pg-boss is deferred to M1, where the first jobs arrive. `/health/ready` reports the
  queue as `not_installed`.

## 2026-11-26 (third session)

### Done

- Fixed PR #1 CI: `actions/setup-node@v5` turns on its pnpm cache when `package.json` has
  `packageManager` and calls pnpm before corepack installs it. `package-manager-cache: false`
  on every setup-node step (we cache the store ourselves).
- Pushed PRs 2–7 and fixed what CI found on GitHub: `turbo.json` formatting in the db commit;
  the contract job's Python tools (a venv, since `python3 -I` skips user site-packages); PR
  title case for commitlint; the PR-title check now re-runs on title edits; GitGuardian and
  Gitleaks false positives removed at the source (fake keys built at runtime from the first
  commit, so `.gitleaksignore` is gone; `ggignore` on a compose variable reference); and one
  real Semgrep finding: AES-GCM now sets `authTagLength` explicitly.
- PR 8 (staging infra), see table above. Bug found and fixed on the way: `db:seed` refused to
  run whenever `NODE_ENV=production`, which every deployed container uses, so staging could never
  be seeded. It now allows `APP_ENV` local, test or staging only (config already refuses
  `APP_ENV=production` without `NODE_ENV=production`). AD §7.5 says "refuses when
  `NODE_ENV=production`"; the intent (never in production) is unchanged.
- Docker's published ports skip ufw, so Caddy runs on the host network and the API listens on
  127.0.0.1 only; ufw then really limits 80/443 to Cloudflare.

### Next

- M1 (identity, tenancy, catalogue, check-in) once the M0 stack is merged.
- Staging provisioning as soon as access arrives (see Blocked).

### Questions for the lead (default if no answer by 30 Nov 2026)

- RLS covers only the 46 tables `schema.sql` lists. These tables also hold tenant data but have no
  RLS: `users`, `staff_invites`, `faqs`, `notifications`, `alerts`, `exports`, `error_events`,
  `pii.visited_stores`, `pii.consents`, `pii.data_requests`, `audit.*`, `analytics.events`.
  Default: keep the agreed list; repositories enforce scope. In M1 I propose policies that allow
  NULL organisation_id where it is needed.
- `/docs` OpenAPI UI needs `@fastify/swagger-ui`, which is not in the approved stack. Default: no
  UI; serve the YAML file.
- Draft user copy for SYS-409/410/426/429/003 (in errors.ts) needs the frontend's review.

- **Standard categories:** the AD and brief say 10; PRD v2.0 §7.2 lists 9 (v1.0 lists 6).
  Which is the tenth (design canvas?)? Default: seed the 9 from PRD v2.0; the list is super
  admin data, so adding one later is a data change.
- **Fixture barcodes:** all three barcodes in `catalogue.json` have invalid EAN-13 check digits.
  The brief asks for valid ones and for seed values to match fixtures. Default: the seed reuses
  the fixture barcodes for those three products; every generated barcode is valid. The frontend
  agent owns the fixtures; worth fixing there.
- **Templates and FAQs:** the seed should include notification templates v1 and 30 platform FAQs,
  but no document gives their text. Default: templates arrive with the milestone that sends each
  message; FAQs with the support module (M4), from text you or the canvas provide.

### Blocked

- **CODEOWNERS handles.** Question: which GitHub users or teams are the lead, the backend agent and
  the frontend agent? Default if unanswered by 30 Nov 2026: the placeholders stay, and "Require
  review from Code Owners" stays off until they're replaced.
- **SOPS recipients:** question: what are the age public keys (lead, staging server, production
  server)? Default: the layout and guard are in place; no encrypted files until the keys arrive.
- **Staging provisioning** needs: a Hetzner CPX22 (Ubuntu 24.04) with your root SSH key; DNS for
  `api.staging.skipa.ng` on Cloudflare with a Cloudflare origin certificate; your age public key;
  your SSH admin addresses and public key. Steps: `infra/ansible/README.md`. Default (agreed):
  M0 reports staging as not provisioned.
- **How CI reaches SSH for deploys.** The AD allows port 22 from admin addresses only, but GitHub
  runners have no fixed addresses. Options: (a) Hetzner Cloud Firewall API in the workflow opens
  22 to the runner's address for the deploy and closes it after (no new vendor; needs an
  `HCLOUD_TOKEN` secret); (b) Tailscale (new vendor); (c) 22 open to all with keys only and
  fail2ban (weakens §12). Default if unanswered by 30 Nov 2026: (a); the deploy job stays off
  until `STAGING_HOST` is set, so nothing is exposed meanwhile.

### Contract

- PR #7 (`contract-change`, formatting only): `api/openapi.v1.yaml` is now generated from
  `packages/contracts`; same meaning as the agreed file (checked by `scripts/contract_diff.py`),
  different layout. The frontend agent should confirm their client generation still works.
