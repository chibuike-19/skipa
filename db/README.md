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

## Seed (`pnpm db:seed`)

Repeatable (deterministic IDs, `ON CONFLICT DO NOTHING`). Uses the pack fixtures' IDs and values where
they overlap (Adunni Mart, Lekki branch, Drinks/Alcoholic drinks, three fixture products).

| Seeded now                                                               | Waiting for                                           |
| ------------------------------------------------------------------------ | ----------------------------------------------------- |
| 9 standard categories, platform settings, 5 feature flags, star rules v1 | —                                                     |
| Adunni Mart (LK, IK) and Harbour Grocers (VI), branch settings, QR codes | —                                                     |
| Staff: one per role per organisation, super admin `tolu@skipa.test`      | —                                                     |
| ~1,300 products per organisation, priced per branch, every edge case     | —                                                     |
| 50 shoppers (encrypted phone/email), consents, all five avatars          | —                                                     |
| 30 days of activity                                                      | each milestone seeds its own area (lead, 26 Nov 2026) |
| Branding versions                                                        | contrast checker (branding module)                    |
| Notification templates, 30 platform FAQs                                 | source text (question to the lead)                    |
| Stars, visited stores                                                    | visits (M2/M3)                                        |
