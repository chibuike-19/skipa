// Idempotency-Key (AD §6.2, CS-03, PY-01; M0 AC: idempotency replay test passes).
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AppError } from '../../../src/platform/errors.ts';
import { harness, type Harness } from './harness.ts';

let h: Harness;
let executions = 0;

beforeAll(async () => {
  h = await harness(async (base) => {
    const app = base.withTypeProvider<ZodTypeProvider>();
    const subject = (req: { headers: Record<string, string | string[] | undefined> }) => {
      const device = req.headers['x-test-device'];
      return `device:${typeof device === 'string' ? device : 'd1'}`;
    };
    app.post(
      '/test/orders',
      {
        config: { idempotency: { subject } },
        schema: { body: z.object({ totalKobo: z.number().int(), slowMs: z.number().optional() }) },
      },
      async (request, reply) => {
        executions += 1;
        if (request.body.slowMs) await sleep(request.body.slowMs);
        return reply.code(201).send({ orderId: randomUUID(), totalKobo: request.body.totalKobo });
      },
    );
    app.post('/test/conflict', { config: { idempotency: { subject } } }, async () => {
      executions += 1;
      throw new AppError('CART-006', { message: 'prices changed' });
    });
    app.post('/test/boom', { config: { idempotency: { subject } } }, async () => {
      executions += 1;
      throw new Error('temporary failure');
    });
  });
});

beforeEach(() => {
  executions = 0;
});

const post = (url: string, key: string | undefined, payload: unknown, device = 'd1') =>
  h.app.inject({
    method: 'POST',
    url,
    payload: payload as Record<string, unknown>,
    headers: { 'x-test-device': device, ...(key !== undefined && { 'idempotency-key': key }) },
  });

describe('Idempotency-Key', () => {
  it('replays the first response for the same key and body, without running the handler again', async () => {
    const key = randomUUID();
    const first = await post('/test/orders', key, { totalKobo: 3_130_000 });
    const second = await post('/test/orders', key, { totalKobo: 3_130_000 });
    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(201);
    expect(second.json()).toEqual(first.json());
    expect(second.headers['idempotent-replayed']).toBe('true');
    expect(second.headers['x-request-id']).not.toBe(first.headers['x-request-id']);
    expect(executions).toBe(1);
  });

  it('treats the same body with keys in a different order as the same request', async () => {
    const key = randomUUID();
    await post('/test/orders', key, { totalKobo: 5, slowMs: 1 });
    const replay = await post('/test/orders', key, { slowMs: 1, totalKobo: 5 });
    expect(replay.headers['idempotent-replayed']).toBe('true');
    expect(executions).toBe(1);
  });

  it('rejects the same key with a different body: 409 SYS-409', async () => {
    const key = randomUUID();
    await post('/test/orders', key, { totalKobo: 100 });
    const res = await post('/test/orders', key, { totalKobo: 999 });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toMatchObject({ error: { code: 'SYS-409' } });
    expect(executions).toBe(1);
  });

  it('double tap: concurrent requests with one key run the handler once; the other gets SYS-410', async () => {
    const key = randomUUID();
    const [a, b] = await Promise.all([
      post('/test/orders', key, { totalKobo: 100, slowMs: 300 }),
      post('/test/orders', key, { totalKobo: 100, slowMs: 300 }),
    ]);
    const statuses = [a.statusCode, b.statusCode].sort();
    expect(statuses).toEqual([201, 409]);
    const conflict = a.statusCode === 409 ? a : b;
    expect(conflict.json()).toMatchObject({ error: { code: 'SYS-410' } });
    expect(executions).toBe(1);
    // Once the first finishes, a retry gets its response.
    const retry = await post('/test/orders', key, { totalKobo: 100, slowMs: 300 });
    expect(retry.statusCode).toBe(201);
    expect(retry.headers['idempotent-replayed']).toBe('true');
  });

  it('keys are per subject: two devices may use the same key', async () => {
    const key = randomUUID();
    await post('/test/orders', key, { totalKobo: 1 }, 'd1');
    const other = await post('/test/orders', key, { totalKobo: 1 }, 'd2');
    expect(other.headers['idempotent-replayed']).toBeUndefined();
    expect(executions).toBe(2);
  });

  it('stores business-rule errors (4xx) and replays them', async () => {
    const key = randomUUID();
    const first = await post('/test/conflict', key, {});
    const second = await post('/test/conflict', key, {});
    expect(first.statusCode).toBe(409);
    expect(second.statusCode).toBe(409);
    expect(second.json()).toMatchObject({ error: { code: 'CART-006' } });
    expect(executions).toBe(1);
  });

  it('does not store 5xx: the key is released so the client can retry', async () => {
    const key = randomUUID();
    expect((await post('/test/boom', key, {})).statusCode).toBe(500);
    expect((await post('/test/boom', key, {})).statusCode).toBe(500);
    expect(executions).toBe(2);
  });

  it('requires a UUID Idempotency-Key on routes that opt in: 400 SYS-400', async () => {
    for (const key of [undefined, 'not-a-uuid']) {
      const res = await post('/test/orders', key, { totalKobo: 1 });
      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        error: { code: 'SYS-400', details: { header: 'Idempotency-Key' } },
      });
    }
    expect(executions).toBe(0);
  });

  it('takes over a key stuck in progress for over a minute (process died mid-request)', async () => {
    const key = randomUUID();
    const scope = 'POST /test/orders:device:d1';
    const { createHash } = await import('node:crypto');
    const { canonicalJson } = await import('../../../src/platform/idempotency.ts');
    const hash = createHash('sha256')
      .update(`POST\n/test/orders\n${canonicalJson({ totalKobo: 7 })}`)
      .digest();
    await h.db.platform.query(
      `INSERT INTO idempotency_keys (scope, key, request_hash, status, created_at, expires_at)
       VALUES ($1, $2, $3, 'in_progress', now() - interval '2 minutes', now() + interval '1 day')`,
      [scope, key, hash],
    );
    const res = await post('/test/orders', key, { totalKobo: 7 });
    expect(res.statusCode).toBe(201);
    expect(executions).toBe(1);
  });

  it('keeps keys for 24 hours', async () => {
    const key = randomUUID();
    await post('/test/orders', key, { totalKobo: 2 });
    const { rows } = await h.db.platform.query<{ hours: number }>(
      `SELECT round(extract(epoch FROM expires_at - created_at) / 3600)::int AS hours FROM idempotency_keys WHERE key = $1`,
      [key],
    );
    expect(rows[0]?.hours).toBe(24);
  });
});
