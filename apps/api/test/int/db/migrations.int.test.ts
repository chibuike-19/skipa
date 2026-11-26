import { readFileSync } from 'node:fs';

import type pg from 'pg';
import { beforeAll, describe, expect, inject, it } from 'vitest';

import { MIGRATIONS_FOLDER, runMigrations } from '../../../src/db/migrate.ts';
import { connectAs } from './helpers.ts';

const journal = JSON.parse(readFileSync(`${MIGRATIONS_FOLDER}/meta/_journal.json`, 'utf8')) as {
  entries: { tag: string }[];
};

let owner: pg.Client;
beforeAll(async () => {
  owner = await connectAs('owner');
});

const applied = async () =>
  (await owner.query<{ n: number }>('SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations'))
    .rows[0]?.n;

describe('migrations', () => {
  it('applied every journal entry to the empty database', async () => {
    expect(await applied()).toBe(journal.entries.length);
  });

  it('0000_init is db/schema.sql unchanged', () => {
    const init = readFileSync(`${MIGRATIONS_FOLDER}/0000_init.sql`, 'utf8');
    const schema = readFileSync(`${MIGRATIONS_FOLDER}/../schema.sql`, 'utf8');
    expect(init).toBe(schema);
  });

  it('running again is a no-op', async () => {
    await runMigrations({ migrationUrl: inject('db').ownerUrl });
    expect(await applied()).toBe(journal.entries.length);
  });

  it('refuses to run when a migration that already ran was edited', async () => {
    const { rows } = await owner.query<{ id: number; hash: string }>(
      'SELECT id, hash FROM drizzle.__drizzle_migrations ORDER BY created_at LIMIT 1',
    );
    const first = rows[0];
    if (!first) throw new Error('no applied migration');
    await owner.query('UPDATE drizzle.__drizzle_migrations SET hash = $1 WHERE id = $2', [
      'edited',
      first.id,
    ]);
    try {
      await expect(runMigrations({ migrationUrl: inject('db').ownerUrl })).rejects.toThrow(
        /was edited after it ran/,
      );
    } finally {
      await owner.query('UPDATE drizzle.__drizzle_migrations SET hash = $1 WHERE id = $2', [
        first.hash,
        first.id,
      ]);
    }
  });
});
