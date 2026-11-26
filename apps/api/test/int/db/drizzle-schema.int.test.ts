// The Drizzle schema (src/db/schema.ts) must match the migrated database table for table.
import { is } from 'drizzle-orm';
import { getTableConfig, PgTable } from 'drizzle-orm/pg-core';
import type pg from 'pg';
import { beforeAll, expect, it } from 'vitest';

import * as schema from '../../../src/db/schema.ts';
import { connectAs } from './helpers.ts';

let owner: pg.Client;
beforeAll(async () => {
  owner = await connectAs('owner');
});

type Columns = Record<string, Record<string, { notNull: boolean }>>;

it('has every table and column of the database, with the same nullability', async () => {
  const { rows } = await owner.query<{ t: string; c: string; nullable: 'YES' | 'NO' }>(`
    SELECT CASE WHEN c.table_schema = 'public' THEN c.table_name
                ELSE c.table_schema || '.' || c.table_name END AS t,
           c.column_name AS c, c.is_nullable AS nullable
    FROM information_schema.columns c
    JOIN pg_class pc ON pc.relname = c.table_name
    JOIN pg_namespace pn ON pn.oid = pc.relnamespace AND pn.nspname = c.table_schema
    WHERE c.table_schema IN ('public', 'pii', 'audit', 'analytics')
      AND pc.relkind IN ('r', 'p') AND NOT pc.relispartition`);
  const database: Columns = {};
  for (const r of rows) (database[r.t] ??= {})[r.c] = { notNull: r.nullable === 'NO' };

  const drizzle: Columns = {};
  for (const value of Object.values(schema)) {
    if (!is(value, PgTable)) continue;
    const config = getTableConfig(value);
    const name = config.schema ? `${config.schema}.${config.name}` : config.name;
    drizzle[name] = Object.fromEntries(
      config.columns.map((col) => [col.name, { notNull: col.notNull }]),
    );
  }

  expect(Object.keys(drizzle).sort()).toEqual(Object.keys(database).sort());
  expect(drizzle).toEqual(database);
});
