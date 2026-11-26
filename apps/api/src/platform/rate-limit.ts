// Rate limits backed by Postgres (AD §6.2: no Redis). @fastify/rate-limit does the HTTP side;
// this store keeps fixed-window counters in the UNLOGGED table rate_limit_counters (ADR-34).
// Keys are HMAC-SHA256 digests, so IP addresses and phone numbers are never stored.
import { createHmac } from 'node:crypto';

import rateLimit, {
  type FastifyRateLimitStore,
  type FastifyRateLimitStoreCtor,
} from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import type pg from 'pg';

import { AppError } from './errors.ts';

type IncrCallback = (error: Error | null, result?: { current: number; ttl: number }) => void;

export function hashRateLimitKey(secret: Buffer, key: string): string {
  return createHmac('sha256', secret).update(key).digest('base64url');
}

export function pgRateLimitStore(pool: pg.Pool, secret: Buffer): FastifyRateLimitStoreCtor {
  class PgRateLimitStore implements FastifyRateLimitStore {
    private readonly prefix: string;

    constructor(_options?: unknown, prefix = 'global') {
      this.prefix = prefix;
    }

    incr(key: string, callback: IncrCallback, timeWindow: number) {
      const hashed = hashRateLimitKey(secret, `${this.prefix}|${key}`);
      pool
        .query<{ count: number; ttl: string }>(
          `INSERT INTO rate_limit_counters (key, count, reset_at)
           VALUES ($1, 1, now() + make_interval(secs => $2::double precision / 1000))
           ON CONFLICT (key) DO UPDATE SET
             count = CASE WHEN rate_limit_counters.reset_at <= now() THEN 1
                          ELSE rate_limit_counters.count + 1 END,
             reset_at = CASE WHEN rate_limit_counters.reset_at <= now() THEN EXCLUDED.reset_at
                             ELSE rate_limit_counters.reset_at END
           RETURNING count, ceil(extract(epoch FROM reset_at - now()) * 1000)::bigint AS ttl`,
          [hashed, timeWindow],
        )
        .then(({ rows }) => {
          const row = rows[0];
          if (!row) throw new Error('rate limit upsert returned no row');
          callback(null, { current: row.count, ttl: Math.max(0, Number(row.ttl)) });
          // Opportunistic cleanup of finished windows (about 1 call in 100).
          if (Math.random() < 0.01) {
            pool
              .query('DELETE FROM rate_limit_counters WHERE reset_at < now()')
              .catch(() => undefined);
          }
        })
        .catch((error: unknown) => {
          callback(error instanceof Error ? error : new Error(String(error)));
        });
    }

    child(routeOptions: { path: string; method?: string | string[] }) {
      const method = Array.isArray(routeOptions.method)
        ? routeOptions.method.join(',')
        : (routeOptions.method ?? '');
      return new PgRateLimitStore(undefined, `${method} ${routeOptions.path}`);
    }
  }
  return PgRateLimitStore;
}

/**
 * Registers @fastify/rate-limit with the Postgres store. `global: false`: each route sets its own
 * limit (AD §6.2 lists them per endpoint), e.g. config: { rateLimit: { max: 10, timeWindow: 60_000 } }.
 * If the store is unreachable the request fails rather than skipping the limit (fail closed).
 */
export async function registerRateLimit(app: FastifyInstance, pool: pg.Pool, secret: Buffer) {
  await app.register(rateLimit, {
    global: false,
    store: pgRateLimitStore(pool, secret),
    skipOnError: false,
    errorResponseBuilder: (_request, context) =>
      new AppError('SYS-429', {
        message: `rate limit of ${String(context.max)} per ${context.after} exceeded`,
      }),
  });
}
