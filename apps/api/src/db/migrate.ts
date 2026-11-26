import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

import { ensureRuntimeRoles, type RolePasswords } from './roles.ts';

export const MIGRATIONS_FOLDER = fileURLToPath(
  new URL('../../../../db/migrations', import.meta.url),
);

interface JournalEntry {
  idx: number;
  when: number;
  tag: string;
}

/** Same hash Drizzle stores: sha256 of the migration file. */
function fileHash(tag: string): string {
  const sql = readFileSync(`${MIGRATIONS_FOLDER}/${tag}.sql`, 'utf8');
  return createHash('sha256').update(sql).digest('hex');
}

function journal(): JournalEntry[] {
  const raw = readFileSync(`${MIGRATIONS_FOLDER}/meta/_journal.json`, 'utf8');
  return (JSON.parse(raw) as { entries: JournalEntry[] }).entries;
}

/**
 * Drizzle only compares timestamps, so it would not notice an edited migration that has already
 * run. Refuse to continue if any applied migration no longer matches its file.
 */
async function assertAppliedMigrationsUnchanged(client: pg.ClientBase) {
  const table = await client.query(`SELECT to_regclass('drizzle.__drizzle_migrations') AS t`);
  const exists = (table.rows[0] as { t: string | null } | undefined)?.t;
  if (exists === null || exists === undefined) return;
  const applied = await client.query<{ hash: string; created_at: string }>(
    'SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at',
  );
  const byWhen = new Map(journal().map((e) => [e.when, e]));
  for (const row of applied.rows) {
    const entry = byWhen.get(Number(row.created_at));
    if (!entry)
      throw new Error(`applied migration at ${row.created_at} is missing from the journal`);
    if (fileHash(entry.tag) !== row.hash) {
      throw new Error(
        `migration ${entry.tag} was edited after it ran; add a new migration instead`,
      );
    }
  }
}

export interface MigrateOptions {
  migrationUrl: string;
  /** Local development and tests only: create or update skipa_app and skipa_platform. */
  rolePasswords?: RolePasswords;
}

export async function runMigrations({ migrationUrl, rolePasswords }: MigrateOptions) {
  const client = new pg.Client({ connectionString: migrationUrl });
  await client.connect();
  try {
    if (rolePasswords) await ensureRuntimeRoles(client, rolePasswords);
    await assertAppliedMigrationsUnchanged(client);
    await migrate(drizzle({ client }), { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await client.end();
  }
}
