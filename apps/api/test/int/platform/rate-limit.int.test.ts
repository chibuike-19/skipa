import { beforeAll, describe, expect, it } from 'vitest';

import { harness, type Harness } from './harness.ts';

let h: Harness;
beforeAll(async () => {
  h = await harness(async (app) => {
    app.get(
      '/test/limited',
      {
        config: {
          rateLimit: { max: 3, timeWindow: 60_000, keyGenerator: (req) => `ip:${req.ip}` },
        },
      },
      async () => ({ ok: true }),
    );
    app.get('/test/open', async () => ({ ok: true }));
  });
});

describe('rate limits with the Postgres store (AD §6.2)', () => {
  it('allows the limit, then answers 429 SYS-429 with Retry-After', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++)
      statuses.push((await h.app.inject({ method: 'GET', url: '/test/limited' })).statusCode);
    expect(statuses).toEqual([200, 200, 200, 429]);
    const blocked = await h.app.inject({ method: 'GET', url: '/test/limited' });
    expect(blocked.json()).toMatchObject({
      error: { code: 'SYS-429', userMessage: 'Too many requests. Wait a moment and try again.' },
    });
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    expect(blocked.headers['x-request-id']).toBeDefined();
  });

  it('only limits routes that ask for it', async () => {
    for (let i = 0; i < 5; i++)
      expect((await h.app.inject({ method: 'GET', url: '/test/open' })).statusCode).toBe(200);
  });

  it('stores HMACs of keys, never the IP address itself', async () => {
    const { rows } = await h.db.platform.query<{ key: string }>(
      'SELECT key FROM rate_limit_counters',
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.key).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(row.key).not.toContain('127.0.0.1');
    }
  });
});
