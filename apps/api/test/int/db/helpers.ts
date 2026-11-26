import pg from 'pg';
import { afterAll, expect, inject } from 'vitest';

/** A connected client for one of the test database roles, closed after the file's tests. */
export async function connectAs(role: 'owner' | 'app' | 'platform'): Promise<pg.Client> {
  const urls = inject('db');
  const url = role === 'owner' ? urls.ownerUrl : role === 'app' ? urls.appUrl : urls.platformUrl;
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  afterAll(() => client.end());
  return client;
}

/** Postgres SQLSTATE codes used in these tests. */
export const PG = {
  restrictViolation: '23001',
  uniqueViolation: '23505',
  checkViolation: '23514',
  insufficientPrivilege: '42501',
} as const;

export async function expectPgError(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ code });
}

/** Run `fn` inside a transaction that is always rolled back. */
export async function rolledBack<T>(client: pg.ClientBase, fn: () => Promise<T>): Promise<T> {
  await client.query('BEGIN');
  try {
    return await fn();
  } finally {
    await client.query('ROLLBACK');
  }
}
