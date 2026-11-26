// Minimal valid rows for integration tests, written with plain SQL through a client that the
// caller chooses (usually the platform role, which bypasses RLS like the worker does).
import { randomBytes, randomUUID } from 'node:crypto';

import type pg from 'pg';

let counter = 0;
const next = () => ++counter;
/** Unique across test files, which share one database but not module state. */
const unique = () => `${randomBytes(3).toString('hex').toUpperCase()}${next()}`;
/** Two to four capital letters, unique within a run (branch codes are ^[A-Z]{2,4}$). */
function letters(n: number): string {
  let s = '';
  let x = n + 26; // start at "BA" so every code has at least two letters
  while (x > 0) {
    s = String.fromCharCode(65 + (x % 26)) + s;
    x = Math.floor(x / 26);
  }
  return s;
}

async function one<T>(client: pg.ClientBase, sql: string, params: unknown[]): Promise<T> {
  const { rows } = await client.query(sql, params);
  const row = rows[0] as T | undefined;
  if (row === undefined) throw new Error(`fixture insert returned no row: ${sql}`);
  return row;
}

export class Fixtures {
  private readonly db: pg.ClientBase;

  constructor(db: pg.ClientBase) {
    this.db = db;
  }

  async organisation(): Promise<string> {
    const n = next();
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO organisations (name, legal_name, status, plan, pilot_ends_on)
       VALUES ($1, $2, 'pilot', 'pilot', '2027-01-15') RETURNING id`,
      [`Test Org ${n}`, `Test Org ${n} Ltd`],
    );
    return row.id;
  }

  async branch(organisationId: string): Promise<string> {
    const n = next();
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO branches (organisation_id, code, name, address_line, area)
       VALUES ($1, $2, $3, '1 Test Road', 'Lekki') RETURNING id`,
      [organisationId, letters(n), `Branch ${n}`],
    );
    await this.db.query(
      'INSERT INTO branch_settings (branch_id, organisation_id) VALUES ($1, $2)',
      [row.id, organisationId],
    );
    return row.id;
  }

  async device(): Promise<string> {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO devices (platform, app_version) VALUES ('web', 'shopper-web/0.0.0') RETURNING id`,
      [],
    );
    return row.id;
  }

  async category(organisationId: string): Promise<string> {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO categories (organisation_id, kind, name, check_level)
       VALUES ($1, 'custom', $2, 'standard') RETURNING id`,
      [organisationId, `Category ${next()}`],
    );
    return row.id;
  }

  async product(organisationId: string, categoryId: string): Promise<string> {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO products (organisation_id, pos_product_id, name, category_id, weight_grams)
       VALUES ($1, $2, $3, $4, 500) RETURNING id`,
      [organisationId, `POS-${next()}`, 'Test product', categoryId],
    );
    return row.id;
  }

  async order(
    organisationId: string,
    branchId: string,
    deviceId: string,
    totalKobo = 1_000_000,
  ): Promise<string> {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO orders (organisation_id, branch_id, device_id, order_number, item_count,
                           total_kobo, platform_fee_bps, platform_fee_kobo, idempotency_key)
       VALUES ($1, $2, $3, $4, 1, $5, 0, 0, $6) RETURNING id`,
      [organisationId, branchId, deviceId, `SKP-T-${unique()}`, totalKobo, randomUUID()],
    );
    return row.id;
  }

  async orderItem(
    organisationId: string,
    orderId: string,
    productId: string,
    unitPriceKobo = 500_000,
    quantity = 2,
    lineTotalKobo = unitPriceKobo * quantity,
  ): Promise<string> {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO order_items (order_id, organisation_id, product_id, name, category_name,
                                check_level, extra_checks, unit_price_kobo, quantity,
                                line_total_kobo, weight_grams)
       VALUES ($1, $2, $3, 'Test product', 'Test', 'standard', false, $4, $5, $6, 500)
       RETURNING id`,
      [orderId, organisationId, productId, unitPriceKobo, quantity, lineTotalKobo],
    );
    return row.id;
  }

  async paymentAttempt(
    organisationId: string,
    orderId: string,
    status: 'initialized' | 'pending' | 'success' | 'failed' | 'superseded' = 'pending',
  ): Promise<string> {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO payment_attempts (order_id, organisation_id, reference, idempotency_key,
                                     channel_requested, amount_kobo, subaccount_code,
                                     transaction_charge_kobo, status)
       VALUES ($1, $2, $3, $4, 'card', 1000000, 'ACCT_test', 0, $5) RETURNING id`,
      [orderId, organisationId, `SKP-T-REF-${unique()}`, randomUUID(), status],
    );
    return row.id;
  }

  async user(
    organisationId: string | null,
    role: 'exit_checker' | 'store_manager' | 'head_office_admin' | 'super_admin' = 'store_manager',
  ): Promise<string> {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO users (organisation_id, email, name, role, status)
       VALUES ($1, $2, 'Test User', $3, 'active') RETURNING id`,
      [organisationId, `user-${unique().toLowerCase()}@skipa.test`, role],
    );
    return row.id;
  }

  async refund(
    organisationId: string,
    branchId: string,
    orderId: string,
    status: 'requested' | 'declined' = 'requested',
  ): Promise<string> {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO refunds (organisation_id, branch_id, order_id, origin, reason, amount_kobo,
                            status, needs_head_office)
       VALUES ($1, $2, $3, 'shopper_request', 'other', 1000000, $4, false) RETURNING id`,
      [organisationId, branchId, orderId, status],
    );
    return row.id;
  }

  async shopper(): Promise<string> {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO pii.shoppers (phone_hmac, phone_enc, phone_masked, name)
       VALUES ($1, $2, '+234 803 *** 0000', 'Test Shopper') RETURNING id`,
      [randomBytes(32), randomBytes(48)],
    );
    return row.id;
  }

  async exitCheck(organisationId: string, branchId: string, orderId: string, checkerId: string) {
    const row = await one<{ id: string }>(
      this.db,
      `INSERT INTO exit_checks (organisation_id, branch_id, order_id, checker_user_id,
                                lookup_method, lookup_value_masked, decision)
       VALUES ($1, $2, $3, $4, 'qr', '…2822', 'flagged') RETURNING id`,
      [organisationId, branchId, orderId, checkerId],
    );
    return row.id;
  }
}
