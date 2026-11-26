# db/

**Owner:** backend agent.

| Path                               | What it is                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `schema.sql`                       | The agreed starting schema from the architecture pack, unchanged.           |
| `migrations/0000_init.sql`         | `schema.sql` byte-for-byte (a test checks this).                            |
| `migrations/0001_roles_grants.sql` | Privileges for `skipa_app` (RLS enforced) and `skipa_platform` (BYPASSRLS). |
| `migrations/meta/_journal.json`    | Drizzle's migration journal.                                                |
| `seed/`                            | `pnpm db:seed` data (added later in M0).                                    |

`pnpm db:migrate` runs `apps/api/scripts/db-migrate.ts`: it applies the migrations as the owner role
and refuses to run if a migration that already ran was edited. In `local` and `test` it also creates
the two runtime roles; on servers infra/ansible creates them.

Rules (brief §7, AD §7.4): new migrations are new files, never edits; expand → migrate → contract;
triggers, RLS policies, partial indexes and generated columns are hand-written SQL. The Drizzle
schema (`apps/api/src/db/schema.ts`) must match the database; `pnpm test:int` checks it.
