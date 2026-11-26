// Database access (brief §7, AD §6.3). Two pools:
//   app       skipa_app: request traffic; RLS enforced. Every transaction is scoped with
//             SET LOCAL app.org_ids, so a query that forgets its organisation filter still sees
//             only the caller's organisations.
//   platform  skipa_platform (BYPASSRLS): worker jobs and super admin routes.
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { AppError } from './errors.ts';

export type Tx = NodePgDatabase & { $client: pg.PoolClient };

export interface Scope {
  organisationIds: readonly string[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface DatabaseOptions {
  appUrl: string;
  platformUrl: string;
  poolMax: number;
  /** Per-transaction statement timeout. */
  statementTimeoutMs?: number;
  applicationName?: string;
}

export class Database {
  readonly app: pg.Pool;
  readonly platform: pg.Pool;
  private readonly statementTimeoutMs: number;

  constructor(options: DatabaseOptions) {
    const common = {
      max: options.poolMax,
      application_name: options.applicationName ?? 'skipa-api',
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
    };
    this.app = new pg.Pool({ ...common, connectionString: options.appUrl });
    this.platform = new pg.Pool({ ...common, connectionString: options.platformUrl });
    this.statementTimeoutMs = options.statementTimeoutMs ?? 5_000;
  }

  /** Run `fn` in one transaction as skipa_app, limited to `scope.organisationIds` by RLS. */
  async withScopedTx<T>(scope: Scope, fn: (tx: Tx) => Promise<T>): Promise<T> {
    for (const id of scope.organisationIds) {
      if (!UUID.test(id)) throw new Error(`invalid organisation id in scope: ${id}`);
    }
    return this.transaction(
      this.app,
      async (client) => {
        await client.query(`SELECT set_config('app.org_ids', $1, true)`, [
          scope.organisationIds.join(','),
        ]);
      },
      fn,
    );
  }

  /** Run `fn` in one transaction as skipa_platform (bypasses RLS: worker and super admin only). */
  async withPlatformTx<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    return this.transaction(this.platform, () => Promise.resolve(), fn);
  }

  /** Cheap reachability check for /health/ready. */
  async ping(): Promise<void> {
    await Promise.all([this.app.query('SELECT 1'), this.platform.query('SELECT 1')]);
  }

  async close(): Promise<void> {
    await Promise.all([this.app.end(), this.platform.end()]);
  }

  private async transaction<T>(
    pool: pg.Pool,
    prepare: (client: pg.PoolClient) => Promise<void>,
    fn: (tx: Tx) => Promise<T>,
  ): Promise<T> {
    let client: pg.PoolClient;
    try {
      client = await pool.connect();
    } catch (cause) {
      throw new AppError('SYS-001', { message: 'database connection failed', cause });
    }
    let broken = false;
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('statement_timeout', $1, true)`, [
        String(this.statementTimeoutMs),
      ]);
      await prepare(client);
      const result = await fn(drizzle({ client }));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {
        broken = true; // connection is unusable: destroy it instead of returning it to the pool
      });
      throw error;
    } finally {
      client.release(broken);
    }
  }
}
