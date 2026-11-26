// Database invariants from brief §7: each one is proved by trying to break it.
import { randomBytes } from 'node:crypto';

import type pg from 'pg';
import { beforeAll, describe, expect, it } from 'vitest';

import { Fixtures } from '../fixtures.ts';
import { connectAs, expectPgError, PG, rolledBack } from './helpers.ts';

let owner: pg.Client;
let f: Fixtures;
let org: string;
let branch: string;
let device: string;
let product: string;

beforeAll(async () => {
  owner = await connectAs('owner');
  f = new Fixtures(owner);
  org = await f.organisation();
  branch = await f.branch(org);
  device = await f.device();
  product = await f.product(org, await f.category(org));
});

/** Inserts one row and returns a WHERE clause that selects it. */
type RowMaker = () => Promise<{ where: string; params: unknown[] }>;

const appendOnly: Record<string, RowMaker> = {
  order_items: async () => {
    const order = await f.order(org, branch, device);
    return { where: 'id = $1', params: [await f.orderItem(org, order, product)] };
  },
  order_status_history: async () => {
    const order = await f.order(org, branch, device);
    await owner.query(
      `INSERT INTO order_status_history (order_id, organisation_id, to_status, actor_type)
       VALUES ($1, $2, 'created', 'system')`,
      [order, org],
    );
    return { where: 'order_id = $1', params: [order] };
  },
  refund_status_history: async () => {
    const refund = await f.refund(org, branch, await f.order(org, branch, device));
    await owner.query(
      `INSERT INTO refund_status_history (refund_id, organisation_id, to_status, actor_type)
       VALUES ($1, $2, 'requested', 'system')`,
      [refund, org],
    );
    return { where: 'refund_id = $1', params: [refund] };
  },
  exit_plans: async () => {
    const order = await f.order(org, branch, device);
    await owner.query(
      `INSERT INTO exit_plans (order_id, organisation_id, flagged, random_check, random_rate_pct,
                               reasons, expected_weight_grams)
       VALUES ($1, $2, false, false, 5, '[]', 1000)`,
      [order, org],
    );
    return { where: 'order_id = $1', params: [order] };
  },
  financial_adjustments: async () => {
    const reason = `test ${randomBytes(4).toString('hex')}`;
    await owner.query(
      `INSERT INTO financial_adjustments (organisation_id, kind, amount_kobo, reason)
       VALUES ($1, 'manual_correction', 100, $2)`,
      [org, reason],
    );
    return { where: 'reason = $1', params: [reason] };
  },
  chargeback_reserve_ledger: async () => {
    const note = `test ${randomBytes(4).toString('hex')}`;
    await owner.query(
      `INSERT INTO chargeback_reserve_ledger (entry_type, amount_kobo, note) VALUES ('top_up', 100, $1)`,
      [note],
    );
    return { where: 'note = $1', params: [note] };
  },
  star_ledger: async () => {
    const shopper = await f.shopper();
    await owner.query(
      `INSERT INTO star_ledger (shopper_id, organisation_id, delta, reason, rule_version, award_date_wat)
       VALUES ($1, $2, 1, 'visit', 1, current_date)`,
      [shopper, org],
    );
    return { where: 'shopper_id = $1', params: [shopper] };
  },
  product_price_history: async () => {
    await owner.query(
      `INSERT INTO product_price_history (branch_id, product_id, organisation_id, price_kobo, source)
       VALUES ($1, $2, $3, 100, 'pos_api')`,
      [branch, product, org],
    );
    return { where: 'product_id = $1', params: [product] };
  },
  'pii.consents': async () => {
    const shopper = await f.shopper();
    await owner.query(
      `INSERT INTO pii.consents (shopper_id, kind, notice_version, granted)
       VALUES ($1, 'privacy_notice', 'v1', true)`,
      [shopper],
    );
    return { where: 'shopper_id = $1', params: [shopper] };
  },
  'audit.audit_log': async () => {
    const action = `test.${randomBytes(4).toString('hex')}`;
    await owner.query(
      `INSERT INTO audit.audit_log (actor_type, action, target_type) VALUES ('system', $1, 'test')`,
      [action],
    );
    return { where: 'action = $1', params: [action] };
  },
  'audit.personal_data_access': async () => {
    const admin = await f.user(null, 'super_admin');
    await owner.query(
      `INSERT INTO audit.personal_data_access (admin_user_id, subject_type, reason, grant_token_hash,
                                               expires_at)
       VALUES ($1, 'shopper', 'Shopper asked about a charge', $2, now() + interval '30 minutes')`,
      [admin, randomBytes(32)],
    );
    return { where: 'admin_user_id = $1', params: [admin] };
  },
  'audit.admin_sign_ins': async () => {
    const admin = await f.user(null, 'super_admin');
    await owner.query(
      `INSERT INTO audit.admin_sign_ins (user_id, ip_address, user_agent, new_device, succeeded)
       VALUES ($1, '127.0.0.1', 'test', false, true)`,
      [admin],
    );
    return { where: 'user_id = $1', params: [admin] };
  },
};

describe('append-only tables (CS-04, DM-03, ST-05)', () => {
  it('the trigger is on exactly the tables the brief lists', async () => {
    const { rows } = await owner.query<{ t: string }>(`
      SELECT CASE WHEN n.nspname = 'public' THEN c.relname ELSE n.nspname || '.' || c.relname END AS t
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_proc p ON p.oid = tg.tgfoid
      WHERE p.proname = 'forbid_update_delete' AND NOT tg.tgisinternal
      ORDER BY 1`);
    expect(rows.map((r) => r.t)).toEqual(Object.keys(appendOnly).sort());
  });

  for (const [table, makeRow] of Object.entries(appendOnly)) {
    it(`${table}: UPDATE and DELETE are refused, even for the owner`, async () => {
      const { where, params } = await makeRow();
      const before = await owner.query(
        `SELECT count(*)::int AS n FROM ${table} WHERE ${where}`,
        params,
      );
      expect(before.rows[0]).toEqual({ n: 1 });

      // A no-op self-assignment of the column the WHERE clause uses is enough to fire the trigger.
      const column = where.split(' ')[0] ?? 'id';
      await expectPgError(
        owner.query(`UPDATE ${table} SET ${column} = ${column} WHERE ${where}`, params),
        PG.restrictViolation,
      );
      await expectPgError(
        owner.query(`DELETE FROM ${table} WHERE ${where}`, params),
        PG.restrictViolation,
      );

      const after = await owner.query(
        `SELECT count(*)::int AS n FROM ${table} WHERE ${where}`,
        params,
      );
      expect(after.rows[0]).toEqual({ n: 1 });
    });
  }

  it('runtime roles cannot UPDATE or DELETE audit tables at all (no grant)', async () => {
    for (const role of ['app', 'platform'] as const) {
      const client = await connectAs(role);
      for (const table of [
        'audit.audit_log',
        'audit.personal_data_access',
        'audit.admin_sign_ins',
      ]) {
        await expectPgError(client.query(`DELETE FROM ${table}`), PG.insufficientPrivilege);
      }
    }
  });
});

describe('one success per order, one open check, one live refund', () => {
  it('one_successful_attempt_per_order: a second successful attempt is refused (PY-01)', async () => {
    const order = await f.order(org, branch, device);
    await f.paymentAttempt(org, order, 'success');
    await f.paymentAttempt(org, order, 'failed');
    await f.paymentAttempt(org, order, 'superseded');
    await expectPgError(f.paymentAttempt(org, order, 'success'), PG.uniqueViolation);
  });

  it('one_open_check_per_order: a second open exit check is refused until the first completes', async () => {
    const order = await f.order(org, branch, device);
    const checker = await f.user(org, 'exit_checker');
    const first = await f.exitCheck(org, branch, order, checker);
    await expectPgError(f.exitCheck(org, branch, order, checker), PG.uniqueViolation);
    await owner.query(
      `UPDATE exit_checks SET result = 'match', completed_at = now() WHERE id = $1`,
      [first],
    );
    await expect(f.exitCheck(org, branch, order, checker)).resolves.toBeTypeOf('string');
  });

  it('one_live_refund_per_order: a second live refund is refused; a declined one does not count', async () => {
    const order = await f.order(org, branch, device);
    await f.refund(org, branch, order, 'declined');
    await f.refund(org, branch, order, 'requested');
    await expectPgError(f.refund(org, branch, order, 'requested'), PG.uniqueViolation);
  });
});

describe('check constraints', () => {
  it('order_items: line_total_kobo must equal unit_price_kobo × quantity (DM-02)', async () => {
    const order = await f.order(org, branch, device);
    await expect(f.orderItem(org, order, product, 31_300, 3, 93_900)).resolves.toBeTypeOf('string');
    await expectPgError(f.orderItem(org, order, product, 31_300, 3, 93_901), PG.checkViolation);
  });

  it('random check rate accepts only 1, 2, 5, 10, 15 or 20 percent (EX-11, D-20)', async () => {
    await rolledBack(owner, async () => {
      for (const ok of [1, 2, 5, 10, 15, 20]) {
        await owner.query('UPDATE branches SET random_check_rate_pct = $1 WHERE id = $2', [
          ok,
          branch,
        ]);
      }
    });
    for (const bad of [0, 3, 25]) {
      await expectPgError(
        owner.query('UPDATE branches SET random_check_rate_pct = $1 WHERE id = $2', [bad, branch]),
        PG.checkViolation,
      );
    }
  });

  it('every money column is bigint kobo (PY-05, DM-01)', async () => {
    const { rows } = await owner.query<{ col: string; data_type: string }>(`
      SELECT table_schema || '.' || table_name || '.' || column_name AS col, data_type
      FROM information_schema.columns
      WHERE column_name LIKE '%\\_kobo' AND table_schema IN ('public', 'pii', 'audit', 'analytics')`);
    expect(rows.length).toBeGreaterThan(30);
    expect(rows.filter((r) => r.data_type !== 'bigint')).toEqual([]);
  });
});
