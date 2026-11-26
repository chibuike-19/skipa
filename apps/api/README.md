# apps/api

**Owner:** backend agent. Fastify API (`src/server.ts`); the pg-boss worker (`src/worker.ts`)
arrives in M1 with the first jobs.

```bash
pnpm local:setup          # from the repo root: env files, Postgres, migrations
pnpm --filter @skipa/api dev   # API on :4000 with --watch
pnpm --filter @skipa/api test        # unit tests
pnpm --filter @skipa/api test:int    # integration tests (needs the dev Postgres)
```

| Path                                  | What                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/app.ts`                          | Builds the app: request IDs, error envelope, CORS/security headers, rate limits, idempotency, routes    |
| `src/platform/config.ts`              | Zod-validated environment; refuses to start on anything missing or inconsistent                         |
| `src/platform/logger.ts`, `redact.ts` | JSON logs with request context; personal data and secrets scrubbed from every line                      |
| `src/platform/db.ts`                  | `withScopedTx` (skipa_app, RLS scope via `SET LOCAL app.org_ids`) and `withPlatformTx` (skipa_platform) |
| `src/platform/errors.ts`              | `AppError(code)` and the contract's error envelope; codes in `@skipa/contracts/errors`                  |
| `src/platform/idempotency.ts`         | `Idempotency-Key` handling for routes with `config.idempotency`                                         |
| `src/platform/rate-limit.ts`          | Postgres-backed store for `@fastify/rate-limit` (ADR-34)                                                |
| `src/platform/realtime.ts`            | `publish()` inside a transaction, LISTEN/NOTIFY hub, SSE writer                                         |
| `src/platform/sentry.ts`              | Errors to GlitchTip, scrubbed, tagged with the request ID                                               |
| `src/db/`                             | Drizzle schema, migration runner                                                                        |
| `src/modules/monitoring/`             | `/health/live`, `/health/ready`                                                                         |

Not built yet: the `/v1/stream` route (needs M1 auth to check channel access), the worker and queue
(M1), the Paystack breaker in `/health/ready` (M2).
