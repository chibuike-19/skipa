// pnpm db:seed on a migrated database (M0 AC: `pnpm db:migrate && pnpm db:seed` on a clean DB).
import { randomBytes } from 'node:crypto';

import type pg from 'pg';
import { beforeAll, describe, expect, it } from 'vitest';

import { isValidEan13 } from '../../../src/db/seed/catalogue-data.ts';
import { FIXTURE, ORGANISATIONS, runSeed, SUPER_ADMIN_EMAIL } from '../../../src/db/seed/seed.ts';
import { PiiCrypto } from '../../../src/platform/crypto.ts';
import { connectAs } from './helpers.ts';

let platform: pg.Client;
const crypto = new PiiCrypto(
  randomBytes(32).toString('base64'),
  randomBytes(32).toString('base64'),
);
let firstRun: Record<string, number>;

const one = async <T extends pg.QueryResultRow>(sql: string, params: unknown[] = []) =>
  (await platform.query<T>(sql, params)).rows[0] as T;

beforeAll(async () => {
  platform = await connectAs('platform');
  await platform.query('BEGIN');
  firstRun = await runSeed(platform, { crypto });
  await platform.query('COMMIT');
});

describe('seed', () => {
  it('inserts the platform configuration', async () => {
    expect(firstRun).toMatchObject({
      standard_categories: 9,
      feature_flags: 5,
      star_rules: 1,
      platform_settings: 4,
    });
    const flags = await platform.query<{ key: string; enabled: boolean }>(
      'SELECT key, enabled FROM feature_flags ORDER BY key',
    );
    expect(Object.fromEntries(flags.rows.map((f) => [f.key, f.enabled]))).toEqual({
      connected_exit_scale: false,
      first_time_tours: true,
      referrals: false,
      skipa_home: true,
      superadmin_second_step: false,
    });
  });

  it('creates both organisations as the brief describes', async () => {
    const orgs = await platform.query<{
      name: string;
      plan: string;
      platform_fee_bps: number;
      pilot_ends_on: Date | null;
      pos_mode: string;
      pos_connector_key: string;
    }>(
      'SELECT name, plan, platform_fee_bps, pilot_ends_on, pos_mode, pos_connector_key FROM organisations WHERE id = ANY($1) ORDER BY name',
      [ORGANISATIONS.map((o) => o.id)],
    );
    expect(
      orgs.rows.map((o) => [o.name, o.plan, o.platform_fee_bps, o.pos_mode, o.pos_connector_key]),
    ).toEqual([
      ['Adunni Mart', 'pilot', 0, 'api', 'mock_pos'],
      ['Harbour Grocers', 'paid', 200, 'file', 'generic_csv'],
    ]);
    const branches = await platform.query<{ code: string }>(
      'SELECT code FROM branches WHERE organisation_id = ANY($1) ORDER BY code',
      [ORGANISATIONS.map((o) => o.id)],
    );
    expect(branches.rows.map((b) => b.code)).toEqual(['IK', 'LK', 'VI']);
  });

  it('matches the pack fixtures where they overlap (check-in.json, catalogue.json)', async () => {
    const lk = await one<{
      organisation_id: string;
      name: string;
      area: string;
      latitude: string;
      phone: string;
      service_desk_note: string;
    }>(
      'SELECT organisation_id, name, area, latitude, phone, service_desk_note FROM branches WHERE id = $1',
      [FIXTURE.lekkiBranchId],
    );
    expect(lk).toEqual({
      organisation_id: FIXTURE.adunniOrgId,
      name: 'Lekki Phase 1',
      area: 'Lekki',
      latitude: '6.447400',
      phone: '+234 803 000 1180',
      service_desk_note: 'Customer service desk by the main entrance',
    });
    const products = await platform.query<{
      id: string;
      barcode: string;
      name: string;
      price_kobo: string;
      sold_through_skipa: boolean;
      category_active: boolean;
    }>(
      `SELECT p.id, p.barcode, p.name, bp.price_kobo, p.sold_through_skipa, bc.active AS category_active
         FROM products p
         JOIN branch_products bp ON bp.product_id = p.id AND bp.branch_id = $1
         JOIN branch_categories bc ON bc.category_id = p.category_id AND bc.branch_id = $1
        WHERE p.id = ANY($2) ORDER BY p.id`,
      [FIXTURE.lekkiBranchId, FIXTURE.products.map((p) => p.id)],
    );
    expect(products.rows).toEqual([
      // available
      {
        id: FIXTURE.products[0].id,
        barcode: '6156000231187',
        name: 'Malt drink 33 cl',
        price_kobo: '40000',
        sold_through_skipa: true,
        category_active: true,
      },
      // category_off: alcoholic drinks are switched off at Lekki
      {
        id: FIXTURE.products[1].id,
        barcode: '5000213003218',
        name: 'Stout 60 cl',
        price_kobo: '120000',
        sold_through_skipa: true,
        category_active: false,
      },
      // till_only
      {
        id: FIXTURE.products[2].id,
        barcode: '6154000057038',
        name: 'Vegetable oil 1 L',
        price_kobo: '320000',
        sold_through_skipa: false,
        category_active: true,
      },
    ]);
  });

  it('prices about 1,300 products at every branch, with valid barcodes and every edge case', async () => {
    const perBranch = await platform.query<{ code: string; n: number }>(
      `SELECT b.code, count(*)::int AS n FROM branch_products bp JOIN branches b ON b.id = bp.branch_id
        WHERE b.organisation_id = ANY($1) GROUP BY b.code ORDER BY b.code`,
      [ORGANISATIONS.map((o) => o.id)],
    );
    for (const row of perBranch.rows) expect(row.n, row.code).toBeGreaterThanOrEqual(1_300);

    const generatedBarcodes = await platform.query<{ barcode: string }>(
      `SELECT barcode FROM products WHERE barcode LIKE '615000%' AND organisation_id = ANY($1)`,
      [ORGANISATIONS.map((o) => o.id)],
    );
    expect(generatedBarcodes.rows.every((r) => isValidEan13(r.barcode))).toBe(true);

    const edge = await one<Record<string, number>>(
      `SELECT count(*) FILTER (WHERE NOT p.sold_through_skipa)::int AS till_only,
              count(*) FILTER (WHERE p.weight_grams IS NULL)::int AS missing_weight,
              count(*) FILTER (WHERE p.variable_price)::int AS variable_price,
              count(*) FILTER (WHERE p.extra_checks)::int AS extra_checks,
              count(*) FILTER (WHERE bp.price_synced_at < now() - interval '24 hours')::int AS stale_price,
              count(*) FILTER (WHERE bp.stock_qty = 0)::int AS out_of_stock,
              min(bp.price_kobo)::int AS min_price, max(bp.price_kobo)::int AS max_price
         FROM branch_products bp JOIN products p ON p.id = bp.product_id WHERE bp.branch_id = $1`,
      [FIXTURE.lekkiBranchId],
    );
    for (const key of [
      'till_only',
      'missing_weight',
      'variable_price',
      'extra_checks',
      'stale_price',
      'out_of_stock',
    ]) {
      expect(edge[key], key).toBeGreaterThan(0);
    }
    expect(edge.min_price).toBeGreaterThanOrEqual(20_000);
    expect(edge.max_price).toBeLessThanOrEqual(6_000_000);
  });

  it('creates one user per role per organisation and the super admin', async () => {
    const users = await platform.query<{ email: string; role: string }>(
      `SELECT email, role FROM users WHERE email LIKE '%.test' ORDER BY email`,
    );
    expect(users.rows).toContainEqual({ email: SUPER_ADMIN_EMAIL, role: 'super_admin' });
    for (const email of [
      'ho@adunni.test',
      'manager.lk@adunni.test',
      'checker.lk@adunni.test',
      'manager.ik@adunni.test',
      'ho@harbour.test',
      'checker.vi@harbour.test',
    ]) {
      expect(users.rows.map((u) => u.email)).toContain(email);
    }
    const scoped = await one<{ n: number }>(
      `SELECT count(*)::int AS n FROM users u JOIN user_branches ub ON ub.user_id = u.id WHERE u.email = 'checker.lk@adunni.test' AND ub.branch_id = $1`,
      [FIXTURE.lekkiBranchId],
    );
    expect(scoped.n).toBe(1);
  });

  it('stores 50 shoppers with encrypted phones, all five avatars and consents', async () => {
    const shoppers = await platform.query<{
      phone_enc: Buffer;
      phone_masked: string;
      avatar: string;
    }>(
      `SELECT phone_enc, phone_masked, avatar FROM pii.shoppers WHERE phone_masked LIKE '+234 809 *** %'`,
    );
    expect(shoppers.rows).toHaveLength(50);
    expect(new Set(shoppers.rows.map((s) => s.avatar))).toEqual(
      new Set(['tomi', 'mimi', 'ata', 'lubo', 'sardi']),
    );
    const first = shoppers.rows[0];
    expect(first).toBeDefined();
    const phone = crypto.decrypt(first?.phone_enc ?? Buffer.alloc(0), 'pii.shoppers.phone');
    expect(phone).toMatch(/^\+2348099990\d{3}$/);
    expect(first?.phone_enc.includes(Buffer.from(phone.slice(4)))).toBe(false);
    const consents = await one<{ n: number }>(
      `SELECT count(*)::int AS n FROM pii.consents WHERE notice_version = '2026-11-v1'`,
    );
    expect(consents.n).toBe(100);
  });

  it('can run again without changing anything', async () => {
    await platform.query('BEGIN');
    const second = await runSeed(platform, { crypto });
    await platform.query('COMMIT');
    expect(Object.values(second).every((n) => n === 0)).toBe(true);
  });
});
