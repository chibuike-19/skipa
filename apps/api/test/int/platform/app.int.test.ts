// Platform behaviour through real HTTP handling (Fastify inject) and the real database:
// request IDs, error envelope, health, CORS and security headers.
import { AppError } from '../../../src/platform/errors.ts';
import { z } from 'zod';
import { beforeAll, describe, expect, it } from 'vitest';

import { harness, ORIGIN, type Harness } from './harness.ts';

// The contract's Error schema (api/openapi.v1.yaml components.schemas.Error).
const contractError = z
  .object({
    error: z
      .object({
        code: z.string().regex(/^[A-Z]{3,6}-[0-9]{3}$/),
        message: z.string(),
        userMessage: z.string(),
        requestId: z.string(),
        details: z.record(z.string(), z.unknown()).optional(),
      })
      .strict(),
  })
  .strict();

let h: Harness;
beforeAll(async () => {
  h = await harness(async (app) => {
    app.post(
      '/test/validate',
      { schema: { body: z.object({ quantity: z.number().int().min(1) }) } },
      async (request) => request.body,
    );
    app.get('/test/app-error', async () => {
      throw new AppError('RCPT-002', {
        message: 'receipt LK-04822 already used',
        params: { time: '14:39' },
      });
    });
    app.get('/test/crash', async () => {
      throw new Error('db password is hunter2 for ada@example.com');
    });
    app.get('/test/internal-code', async () => {
      throw new AppError('PAY-010', { message: 'amount mismatch on SKP-LK-04815-A1' });
    });
  });
});

describe('request IDs (ER-03, M0 AC: every response has X-Request-Id)', () => {
  it('is on success, client errors, server errors, not-found and preflight responses', async () => {
    const responses = await Promise.all([
      h.app.inject({ method: 'GET', url: '/health/live' }),
      h.app.inject({ method: 'POST', url: '/test/validate', payload: { quantity: 0 } }),
      h.app.inject({ method: 'GET', url: '/test/crash' }),
      h.app.inject({ method: 'GET', url: '/nope' }),
      h.app.inject({
        method: 'OPTIONS',
        url: '/health/live',
        headers: { origin: ORIGIN, 'access-control-request-method': 'GET' },
      }),
    ]);
    for (const res of responses) {
      expect(res.headers['x-request-id'], `${res.statusCode}`).toMatch(/^[0-9a-f-]{36}$/);
    }
    expect(new Set(responses.map((r) => r.headers['x-request-id'])).size).toBe(responses.length);
  });

  it('keeps a well-formed client request ID and replaces an unsafe one', async () => {
    const kept = await h.app.inject({
      method: 'GET',
      url: '/health/live',
      headers: { 'x-request-id': 'client-req-0001' },
    });
    expect(kept.headers['x-request-id']).toBe('client-req-0001');
    const replaced = await h.app.inject({
      method: 'GET',
      url: '/health/live',
      headers: { 'x-request-id': 'x' },
    });
    expect(replaced.headers['x-request-id']).not.toBe('x');
  });

  it('logs one line per request with the request ID and route, in the AD §10.2 format', async () => {
    const res = await h.app.inject({ method: 'GET', url: '/health/live' });
    const id = res.headers['x-request-id'];
    const line = h.logs.find((l) => l.request_id === id && l.event === 'http.request');
    expect(line).toMatchObject({
      route: 'GET /health/live',
      status: 200,
      service: 'api',
      release: 'api@0.0.0+test',
    });
    expect(typeof line?.duration_ms).toBe('number');
  });
});

describe('error envelope', () => {
  it('validation errors → 400 SYS-400 with field paths, in the contract shape', async () => {
    const res = await h.app.inject({
      method: 'POST',
      url: '/test/validate',
      payload: { quantity: 0 },
    });
    expect(res.statusCode).toBe(400);
    const body = contractError.parse(res.json());
    expect(body.error.code).toBe('SYS-400');
    expect(body.error.userMessage).toBe("Something in that request wasn't right.");
    expect(body.error.details).toMatchObject({ issues: [{ path: 'body/quantity' }] });
    // requestId in the body is the short reference of the X-Request-Id header (ER-08).
    const full = String(res.headers['x-request-id']).replace(/-/g, '');
    expect(body.error.requestId).toBe(`${full.slice(-8, -4)}-${full.slice(-4)}`);
  });

  it('AppError → its catalogue status, code and filled-in user message', async () => {
    const res = await h.app.inject({ method: 'GET', url: '/test/app-error' });
    expect(res.statusCode).toBe(409);
    expect(contractError.parse(res.json()).error).toMatchObject({
      code: 'RCPT-002',
      message: 'receipt LK-04822 already used',
      userMessage: 'Already used for exit at 14:39.',
    });
  });

  it('unexpected errors → 500 SYS-500 without leaking the cause, logged with the request ID', async () => {
    const res = await h.app.inject({ method: 'GET', url: '/test/crash' });
    expect(res.statusCode).toBe(500);
    const body = contractError.parse(res.json());
    expect(body.error).toMatchObject({
      code: 'SYS-500',
      message: 'unexpected',
      userMessage: 'Something went wrong on our side.',
    });
    expect(res.body).not.toContain('hunter2');
    const logged = h.logs.find(
      (l) => l.request_id === res.headers['x-request-id'] && l.event === 'http.error',
    );
    expect(logged).toMatchObject({ code: 'SYS-500', level: 'error' });
    expect(JSON.stringify(logged)).not.toContain('ada@example.com');
  });

  it('a code that is never an HTTP error becomes a 500 with the generic message', async () => {
    const res = await h.app.inject({ method: 'GET', url: '/test/internal-code' });
    expect(res.statusCode).toBe(500);
    expect(res.json()).toMatchObject({
      error: { code: 'PAY-010', userMessage: 'Something went wrong on our side.' },
    });
  });

  it('unknown routes → 404 SYS-404', async () => {
    const res = await h.app.inject({ method: 'GET', url: '/v1/nothing-here?x=1' });
    expect(res.statusCode).toBe(404);
    expect(contractError.parse(res.json()).error).toMatchObject({
      code: 'SYS-404',
      userMessage: "We couldn't find that.",
    });
  });

  it('malformed JSON → 400 SYS-400', async () => {
    const res = await h.app.inject({
      method: 'POST',
      url: '/test/validate',
      headers: { 'content-type': 'application/json' },
      payload: '{bad',
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ error: { code: 'SYS-400' } });
  });
});

describe('health (NF-01, ER-09)', () => {
  it('/health/live reports ok with the release', async () => {
    const res = await h.app.inject({ method: 'GET', url: '/health/live' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok', release: 'api@0.0.0+test' });
  });

  it('/health/ready checks the database and says what is not built yet', async () => {
    const res = await h.app.inject({ method: 'GET', url: '/health/ready' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      status: 'ok',
      release: 'api@0.0.0+test',
      checks: { database: 'ok', queue: 'not_installed', paystack: 'not_configured' },
    });
  });

  it('/health/ready fails with 503 SYS-001 when the database is unreachable', async () => {
    const down = await (
      await import('./harness.ts')
    ).harness(undefined, {
      pingDatabase: () => Promise.reject(new Error('connect ECONNREFUSED')),
    });
    const res = await down.app.inject({ method: 'GET', url: '/health/ready' });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ error: { code: 'SYS-001' } });
  });
});

describe('CORS and security headers (AD §6.2)', () => {
  it('allows the app origins with credentials', async () => {
    const res = await h.app.inject({
      method: 'GET',
      url: '/health/live',
      headers: { origin: ORIGIN },
    });
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers['access-control-expose-headers']).toContain('X-Request-Id');
    expect(res.headers.vary).toContain('Origin');
  });

  it('answers preflight for allowed origins with the Skipa headers', async () => {
    const res = await h.app.inject({
      method: 'OPTIONS',
      url: '/v1/orders',
      headers: {
        origin: ORIGIN,
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'idempotency-key',
      },
    });
    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-headers']).toContain('Idempotency-Key');
    expect(res.headers['access-control-allow-headers']).toContain('X-Skipa-Client');
  });

  it('gives other origins no CORS headers at all', async () => {
    for (const method of ['GET', 'OPTIONS'] as const) {
      const res = await h.app.inject({
        method,
        url: '/health/live',
        headers: { origin: 'https://evil.example', 'access-control-request-method': 'GET' },
      });
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
      expect(res.headers['access-control-allow-methods']).toBeUndefined();
    }
  });

  it('sets security headers and no-store on API responses', async () => {
    const res = await h.app.inject({ method: 'GET', url: '/health/live' });
    expect(res.headers['strict-transport-security']).toContain('max-age=');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['cache-control']).toBe('no-store');
  });
});
