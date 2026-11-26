# Skipa

Self-checkout for supermarkets in Nigeria: shoppers scan products on their phone, pay through
Paystack and leave through an express exit.

## Documents

| Document                                                             | Path                                                                        |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| System Architecture Document (the AD)                                | `docs/SKIPA_SYSTEM_ARCHITECTURE.md`                                         |
| Agent briefs                                                         | `docs/briefs/BACKEND_AGENT_BRIEF.md`, `docs/briefs/FRONTEND_AGENT_BRIEF.md` |
| API contract (OpenAPI 3.1)                                           | `api/openapi.v1.yaml`                                                       |
| Database schema (first migration)                                    | `db/schema.sql`                                                             |
| Rest of the architecture pack (PDFs, files the frontend agent moves) | `docs/architecture-pack/`                                                   |
| Decision records                                                     | `docs/adr/`                                                                 |
| Progress                                                             | `docs/progress/backend.md`, `docs/progress/frontend.md`                     |

## Ownership

See `.github/CODEOWNERS`. Backend agent: `apps/api`, `packages/contracts`, `packages/domain`,
`packages/config`, `db/`, `infra/`, `.github/workflows`. Frontend agent: `apps/shopper`,
`apps/exit`, `apps/store`, `apps/admin`, `packages/ui`, `packages/tokens`, `packages/api-client`,
`packages/mocks`, `packages/analytics`. `e2e/` is shared.

## Setup

Requires Node 24 (`.nvmrc`) and Docker.

```bash
corepack enable && corepack prepare pnpm@12.23.0 --activate
pnpm install
```

| Command                             | Runs                                          |
| ----------------------------------- | --------------------------------------------- |
| `pnpm format:check` / `pnpm format` | Prettier check / write                        |
| `pnpm lint`                         | ESLint (typescript-eslint strict, type-aware) |
| `pnpm typecheck`                    | `tsc` 7.0.2 in every package (see ADR-32)     |
| `pnpm test`                         | Unit tests (Vitest)                           |

The database, API and the rest of the commands in brief §16 arrive during M0.

## Conventions

Trunk-based, short-lived branches (`feat/SKP-<n>-short`, `fix/…`, `chore/…`), Conventional Commits
(the PR title is checked, because PRs are squash-merged), one PR per task linked to its milestone and
PRD IDs. Changes to `api/openapi.v1.yaml` need the `contract-change` label and the other agent's
approval. Details: AD §5.
