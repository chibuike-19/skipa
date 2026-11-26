# ADR-34: Rate-limit counters in an UNLOGGED Postgres table

|           |                                       |
| --------- | ------------------------------------- |
| Status    | Accepted (backend agent, 26 Nov 2026) |
| Milestone | M0                                    |

**Context.** AD §6.2 sets per-route rate limits through `@fastify/rate-limit` "with a Postgres-backed
store (no Redis)". `db/schema.sql` has no table for it, and the default in-memory store would give
each API replica its own counters (two replicas in production, AD §12.3).

**Options.** 1. In-memory store (per process; limits double with two replicas). 2. Redis (not in the
approved stack; adds cost). 3. A Postgres table.

**Decision.** Option 3: migration `0002_rate_limit_counters.sql` adds an `UNLOGGED` table
`rate_limit_counters (key, count, reset_at)`, with fixed windows updated in a single upsert.
Keys are HMAC-SHA256 digests (`PII_HMAC_KEY`), so no IP addresses or phone numbers are stored.
If the store fails, the request fails (fail closed).

**Consequences.** Shared limits across replicas with no new service. UNLOGGED means no WAL and an
empty table after a crash; a crash only resets windows early. One write per limited request; at
pilot volumes this is negligible. Expired rows are deleted opportunistically (about 1 call in 100);
a cleanup job can be added if the table grows.

**Revisit when.** Rate-limit writes show up in the slow-query or lock panels, or limits need
sliding windows.
