// Idempotency-Key handling (AD §6.2, CS-03, PY-01). A route opts in with
//   config: { idempotency: { subject: (req) => 'device:<id>' } }
// Same key + same request within 24 h → the stored response, replayed. Same key + different body →
// 409 SYS-409. Same key while the first is still running → 409 SYS-410.
//
// Responses with 2xx and 4xx (except 429) are stored. 5xx and 429 are not: the key is released so
// the client can retry. A key left "in progress" for over a minute (e.g. the process died) can be
// taken over; money paths also have database unique constraints (orders: device + key; payment
// attempts: order + key), so a takeover can never create a second order or attempt.
import { createHash } from 'node:crypto';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type pg from 'pg';

import { AppError } from './errors.ts';

export interface IdempotencyRouteConfig {
  /** Who the key belongs to, e.g. `device:<id>` or `user:<id>`. Keys are only unique per subject. */
  subject: (request: FastifyRequest) => string;
}

declare module 'fastify' {
  interface FastifyContextConfig {
    idempotency?: IdempotencyRouteConfig;
  }
  interface FastifyRequest {
    idempotencyClaim?: { scope: string; key: string };
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const IDEMPOTENCY_TTL_HOURS = 24;
export const STALE_IN_PROGRESS_SECONDS = 60;

/** Stable JSON: object keys sorted, so {a,b} and {b,a} hash the same. */
export function canonicalJson(value: unknown): string {
  if (value === undefined) return '';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
}

function requestHash(request: FastifyRequest): Buffer {
  return createHash('sha256')
    .update(`${request.method}\n${request.url}\n${canonicalJson(request.body)}`)
    .digest();
}

interface StoredRow {
  request_hash: Buffer;
  status: 'in_progress' | 'completed';
  response_status: number | null;
  response_body: unknown;
}

async function claim(
  pool: pg.Pool,
  scope: string,
  key: string,
  hash: Buffer,
): Promise<StoredRow | 'claimed'> {
  const inserted = await pool.query(
    `INSERT INTO idempotency_keys (scope, key, request_hash, status, expires_at)
     VALUES ($1, $2, $3, 'in_progress', now() + make_interval(hours => $4))
     ON CONFLICT (scope, key) DO NOTHING`,
    [scope, key, hash, IDEMPOTENCY_TTL_HOURS],
  );
  if (inserted.rowCount === 1) return 'claimed';

  // Take over an expired key, or one stuck in progress, atomically (only one request can win).
  const retaken = await pool.query(
    `UPDATE idempotency_keys
        SET request_hash = $3, status = 'in_progress', response_status = NULL, response_body = NULL,
            created_at = now(), expires_at = now() + make_interval(hours => $4)
      WHERE scope = $1 AND key = $2
        AND (expires_at <= now()
             OR (status = 'in_progress' AND request_hash = $3
                 AND created_at < now() - make_interval(secs => $5)))`,
    [scope, key, hash, IDEMPOTENCY_TTL_HOURS, STALE_IN_PROGRESS_SECONDS],
  );
  if (retaken.rowCount === 1) return 'claimed';

  const { rows } = await pool.query<StoredRow>(
    `SELECT request_hash, status, response_status, response_body
       FROM idempotency_keys WHERE scope = $1 AND key = $2`,
    [scope, key],
  );
  const row = rows[0];
  if (!row) return claim(pool, scope, key, hash); // deleted between statements: try again
  return row;
}

export default fp<{ pool: pg.Pool }>(
  (app: FastifyInstance, { pool }, done) => {
    app.decorateRequest('idempotencyClaim', undefined);

    app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
      const config = request.routeOptions.config.idempotency;
      if (!config) return;
      const key = request.headers['idempotency-key'];
      if (typeof key !== 'string' || !UUID.test(key)) {
        throw new AppError('SYS-400', {
          message: 'Idempotency-Key header is required and must be a UUID',
          details: { header: 'Idempotency-Key' },
        });
      }
      const scope = `${request.method} ${request.routeOptions.url ?? request.url}:${config.subject(request)}`;
      const hash = requestHash(request);
      const result = await claim(pool, scope, key, hash);
      if (result === 'claimed') {
        request.idempotencyClaim = { scope, key };
        return;
      }
      if (!result.request_hash.equals(hash)) {
        throw new AppError('SYS-409', {
          message: 'Idempotency-Key reused with a different request',
        });
      }
      if (result.status === 'in_progress') {
        throw new AppError('SYS-410', {
          message: 'a request with this Idempotency-Key is in progress',
        });
      }
      reply.header('Idempotent-Replayed', 'true');
      reply.code(result.response_status ?? 200);
      return reply.send(result.response_body);
    });

    app.addHook(
      'onSend',
      async (request: FastifyRequest, reply: FastifyReply, payload: unknown) => {
        const claimed = request.idempotencyClaim;
        if (!claimed) return payload;
        request.idempotencyClaim = undefined;
        const status = reply.statusCode;
        if (status >= 500 || status === 429) {
          await pool.query('DELETE FROM idempotency_keys WHERE scope = $1 AND key = $2', [
            claimed.scope,
            claimed.key,
          ]);
          return payload;
        }
        let body: unknown = null;
        if (typeof payload === 'string' && payload !== '') {
          try {
            body = JSON.parse(payload) as unknown;
          } catch {
            body = payload;
          }
        }
        await pool.query(
          `UPDATE idempotency_keys SET status = 'completed', response_status = $3, response_body = $4
          WHERE scope = $1 AND key = $2`,
          [claimed.scope, claimed.key, status, JSON.stringify(body)],
        );
        return payload;
      },
    );
    done();
  },
  { name: 'skipa-idempotency' },
);
