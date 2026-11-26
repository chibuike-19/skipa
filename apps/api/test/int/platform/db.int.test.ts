// The transaction helper the modules use (brief §7: SET LOCAL app.org_ids per transaction).
import { sql } from 'drizzle-orm';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';

import { orders } from '../../../src/db/schema.ts';
import { Database } from '../../../src/platform/db.ts';
import { Fixtures } from '../fixtures.ts';

let db: Database;
let A: string;
let B: string;

beforeAll(async () => {
  const urls = inject('db');
  db = new Database({ appUrl: urls.appUrl, platformUrl: urls.platformUrl, poolMax: 3 });
  const client = new pg.Client({ connectionString: urls.platformUrl });
  await client.connect();
  const f = new Fixtures(client);
  A = await f.organisation();
  B = await f.organisation();
  for (const org of [A, B]) await f.order(org, await f.branch(org), await f.device());
  await client.end();
});
afterAll(() => db.close());

describe('Database.withScopedTx()', () => {
  it('scopes every query to the given organisations through RLS (Drizzle query without a filter)', async () => {
    const seen = await db.withScopedTx({ organisationIds: [A] }, (tx) =>
      tx.select({ org: orders.organisationId }).from(orders),
    );
    expect(seen.length).toBeGreaterThan(0);
    expect(new Set(seen.map((r) => r.org))).toEqual(new Set([A]));
  });

  it('does not leak the scope to the next transaction on the same pooled connection', async () => {
    await db.withScopedTx({ organisationIds: [A] }, () => Promise.resolve());
    const seen = await db.withScopedTx({ organisationIds: [] }, (tx) =>
      tx.select({ org: orders.organisationId }).from(orders),
    );
    expect(seen).toEqual([]);
  });

  it('rolls back everything when the callback throws', async () => {
    await expect(
      db.withScopedTx({ organisationIds: [A] }, async (tx) => {
        await tx.execute(sql`UPDATE orders SET status = 'failed' WHERE organisation_id = ${A}`);
        throw new Error('stop');
      }),
    ).rejects.toThrow('stop');
    const statuses = await db.withPlatformTx((tx) =>
      tx
        .select({ s: orders.status })
        .from(orders)
        .where(sql`organisation_id = ${A}`),
    );
    expect(statuses.every((r) => r.s === 'created')).toBe(true);
  });

  it('rejects scopes that are not UUIDs before touching the database', async () => {
    await expect(
      db.withScopedTx({ organisationIds: ["x' OR true --"] }, () => Promise.resolve()),
    ).rejects.toThrow(/invalid organisation id/);
  });

  it('applies a statement timeout to each transaction', async () => {
    const quick = new Database({
      appUrl: inject('db').appUrl,
      platformUrl: inject('db').platformUrl,
      poolMax: 1,
      statementTimeoutMs: 100,
    });
    // Drizzle wraps the driver error; the SQLSTATE (57014 query_canceled) is on `cause`.
    await expect(
      quick.withPlatformTx((tx) => tx.execute(sql`SELECT pg_sleep(1)`)),
    ).rejects.toMatchObject({
      cause: { code: '57014' },
    });
    await quick.close();
  });

  it('the platform transaction sees every organisation (worker, super admin)', async () => {
    const seen = await db.withPlatformTx((tx) =>
      tx
        .select({ org: orders.organisationId })
        .from(orders)
        .where(sql`organisation_id IN (${A}, ${B})`),
    );
    expect(new Set(seen.map((r) => r.org))).toEqual(new Set([A, B]));
  });
});
