// Tenant isolation (DM-04, brief M0 AC): organisation A cannot read or write organisation B's rows
// through the RLS-enforced role, even when a query leaves out the organisation filter.
import type pg from 'pg';
import { beforeAll, describe, expect, it } from 'vitest';

import { Fixtures } from '../fixtures.ts';
import { connectAs, expectPgError, PG, rolledBack } from './helpers.ts';

// The agreed list from db/schema.sql §16. Changing it is a data-protection decision (brief §19).
const RLS_TABLES = [
  'billing_statements',
  'branch_categories',
  'branch_products',
  'branch_settings',
  'branches',
  'branding_versions',
  'catalogue_snapshots',
  'categories',
  'checker_signals',
  'disputes',
  'exit_check_items',
  'exit_checks',
  'exit_devices',
  'exit_plans',
  'financial_adjustments',
  'loss_baselines',
  'loss_counts',
  'order_items',
  'order_status_history',
  'orders',
  'payment_attempts',
  'payout_reports',
  'paystack_settlements',
  'pos_connections',
  'pos_department_mappings',
  'pos_files',
  'pos_postings',
  'pos_sync_runs',
  'product_price_history',
  'products',
  'qr_codes',
  'random_check_blocks',
  'receipt_deliveries',
  'receipts',
  'reconciliation_items',
  'reconciliation_runs',
  'refund_status_history',
  'refunds',
  'settlement_lines',
  'shopping_sessions',
  'star_ledger',
  'stray_charges',
  'support_messages',
  'support_tickets',
  'unknown_barcodes',
  'user_branches',
].sort();

let platform: pg.Client;
let app: pg.Client;
const A = { org: '', branch: '', order: '' };
const B = { org: '', branch: '', order: '' };

beforeAll(async () => {
  platform = await connectAs('platform');
  app = await connectAs('app');
  const f = new Fixtures(platform);
  for (const side of [A, B]) {
    side.org = await f.organisation();
    side.branch = await f.branch(side.org);
    const category = await f.category(side.org);
    const product = await f.product(side.org, category);
    side.order = await f.order(side.org, side.branch, await f.device());
    await f.orderItem(side.org, side.order, product);
    await f.paymentAttempt(side.org, side.order, 'pending');
    await f.refund(side.org, side.branch, side.order);
  }
});

/** Runs `fn` as skipa_app inside a transaction scoped to `orgIds`, like the API's tx helper. */
async function asOrgs<T>(orgIds: string[] | null, fn: () => Promise<T>): Promise<T> {
  return rolledBack(app, async () => {
    if (orgIds !== null) {
      await app.query(`SELECT set_config('app.org_ids', $1, true)`, [orgIds.join(',')]);
    }
    return fn();
  });
}

const ids = async (sql: string, params: unknown[] = []) =>
  (await app.query<{ organisation_id: string }>(sql, params)).rows.map((r) => r.organisation_id);

describe('row-level security', () => {
  it('is enabled with the tenant_isolation policy on exactly the agreed tables', async () => {
    const { rows } = await platform.query<{ t: string; rls: boolean; force: boolean }>(`
      SELECT c.relname AS t, c.relrowsecurity AS rls, c.relforcerowsecurity AS force
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity ORDER BY 1`);
    expect(rows.map((r) => r.t)).toEqual(RLS_TABLES);

    const policies = await platform.query<{ t: string; qual: string; with_check: string }>(`
      SELECT tablename AS t, qual, with_check FROM pg_policies
      WHERE schemaname = 'public' AND policyname = 'tenant_isolation' ORDER BY 1`);
    expect(policies.rows.map((p) => p.t)).toEqual(RLS_TABLES);
    for (const p of policies.rows) {
      expect(p.qual).toContain(`current_setting('app.org_ids'`);
      expect(p.with_check).toContain(`current_setting('app.org_ids'`);
    }
  });

  it('organisation A sees only its own rows when a query has no organisation filter', async () => {
    await asOrgs([A.org], async () => {
      for (const table of [
        'branches',
        'orders',
        'order_items',
        'payment_attempts',
        'refunds',
        'products',
      ]) {
        const seen = await ids(`SELECT organisation_id FROM ${table}`);
        expect(seen.length, table).toBeGreaterThan(0);
        expect(new Set(seen), table).toEqual(new Set([A.org]));
      }
    });
  });

  it('organisation A cannot read B even by asking for B directly, on every RLS table', async () => {
    await asOrgs([A.org], async () => {
      for (const table of RLS_TABLES) {
        const seen = await ids(`SELECT organisation_id FROM ${table} WHERE organisation_id = $1`, [
          B.org,
        ]);
        expect(seen, table).toEqual([]);
      }
    });
  });

  it('a session with both organisations (head office of a group) sees both', async () => {
    await asOrgs([A.org, B.org], async () => {
      expect(new Set(await ids('SELECT organisation_id FROM orders'))).toEqual(
        new Set([A.org, B.org]),
      );
    });
  });

  it('fails closed: with no organisation set, the app role sees nothing', async () => {
    await asOrgs(null, async () => {
      expect(await ids('SELECT organisation_id FROM orders')).toEqual([]);
    });
  });

  it('the scope ends with the transaction (pooled connections cannot leak it)', async () => {
    await asOrgs([A.org], async () => {
      expect((await ids('SELECT organisation_id FROM orders')).length).toBeGreaterThan(0);
    });
    await asOrgs(null, async () => {
      expect(await ids('SELECT organisation_id FROM orders')).toEqual([]);
    });
  });

  it("organisation A cannot write B's rows: inserts are refused, updates touch nothing", async () => {
    await asOrgs([A.org], async () => {
      await app.query('SAVEPOINT s');
      await expectPgError(
        app.query(
          `INSERT INTO categories (organisation_id, kind, name, check_level)
           VALUES ($1, 'custom', 'Sneaky', 'standard')`,
          [B.org],
        ),
        PG.insufficientPrivilege,
      );
      await app.query('ROLLBACK TO SAVEPOINT s');
      const updated = await app.query(`UPDATE orders SET status = 'failed' WHERE id = $1`, [
        B.order,
      ]);
      expect(updated.rowCount).toBe(0);
    });
    const { rows } = await platform.query<{ status: string }>(
      'SELECT status FROM orders WHERE id = $1',
      [B.order],
    );
    expect(rows[0]?.status).toBe('created');
  });

  it('the platform role (worker, super admin) bypasses RLS', async () => {
    const { rows } = await platform.query<{ n: number }>(
      'SELECT count(DISTINCT organisation_id)::int AS n FROM orders WHERE organisation_id = ANY($1)',
      [[A.org, B.org]],
    );
    expect(rows[0]?.n).toBe(2);
  });
});
