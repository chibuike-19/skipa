import { readFileSync } from 'node:fs';

import { resetState, setScenario } from '@skipa/mocks';
import { createMockServer } from '@skipa/mocks/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { generate, TARGET } from '../scripts/gen.ts';
import { createApiClient, unwrap } from './client.ts';
import { ApiError, errorFromResponse, shortRef } from './errors.ts';
import { idempotencyHeader, idempotentAction } from './idempotency.ts';
import { POLL_INTERVAL_MS, subscribeRealtime, type RealtimeEvent } from './realtime.ts';

const API = 'http://localhost:4000';
const server = createMockServer();
const seen: Request[] = [];
server.events.on('request:start', ({ request }) => {
  seen.push(request.clone());
});

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});
afterAll(() => {
  server.close();
});
beforeEach(() => {
  resetState();
  setScenario('default');
  seen.length = 0;
});
afterEach(() => vi.useRealTimers());

const api = createApiClient({ baseUrl: API, app: 'shopper', version: '1.2.3' });
const PRODUCT = '0193a1f2-3333-7000-8000-000000000001';
const SESSION = '0193a1f2-1111-7000-8000-000000000001';

describe('generated types', () => {
  it('src/generated/schema.ts matches the contract (run pnpm api-client:gen)', async () => {
    expect(readFileSync(TARGET, 'utf8')).toBe(await generate());
  }, 30_000);
});

describe('client', () => {
  it('labels every request with the app and a request ID, and sends cookies', async () => {
    // Capture the Request the client hands to fetch (MSW's copy does not keep `credentials`).
    const sent: Request[] = [];
    const client = createApiClient({
      baseUrl: API,
      app: 'shopper',
      version: '1.2.3',
      fetch: (request) => {
        sent.push(request);
        return globalThis.fetch(request);
      },
    });
    const session = await unwrap(
      client.POST('/v1/check-ins', { body: { qrCode: 'QR-ADU-LKI-01' } }),
    );
    expect(session.branch.storeName).toBe('Adunni Mart');
    const request = sent[0];
    expect(request?.headers.get('X-Skipa-Client')).toBe('shopper/1.2.3');
    expect(request?.headers.get('X-Request-Id')).toMatch(/^[0-9a-f-]{36}$/);
    expect(request?.credentials).toBe('include');
  });

  it('turns the contract error envelope into an ApiError with code, message and reference', async () => {
    setScenario('server-error');
    const error = await unwrap(
      api.POST('/v1/check-ins', { body: { qrCode: 'QR-ADU-LKI-01' } }),
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      kind: 'api',
      status: 500,
      code: 'SYS-500',
      userMessage: 'Something went wrong on our side.',
    });
    expect((error as ApiError).requestId).toMatch(/^[0-9a-f]{4}-[0-9a-f]{4}$/);
  });

  it('keeps the server’s rendered message for known codes', async () => {
    setScenario('price-changed');
    const error = await unwrap(
      api.POST('/v1/orders', {
        params: { header: idempotencyHeader(crypto.randomUUID()) },
        body: { sessionId: SESSION, items: [{ productId: PRODUCT, quantity: 1 }], channel: 'card' },
      }),
    ).catch((e: unknown) => e as ApiError);
    expect(error).toMatchObject({
      code: 'CART-006',
      userMessage: 'Some prices changed. Check your cart before paying.',
    });
  });

  it('reports a network failure as kind "network" with no code', async () => {
    setScenario('offline');
    const error = await unwrap(api.GET('/v1/me')).catch((e: unknown) => e as ApiError);
    expect(error).toMatchObject({ kind: 'network', status: null, code: null, requestId: null });
  });

  it('maps unknown codes (e.g. MOCK-501) to SYS-500 but keeps the raw code', async () => {
    const error = await unwrap(api.GET('/v1/me/stars')).catch((e: unknown) => e as ApiError);
    expect(error).toMatchObject({ status: 501, code: 'SYS-500', rawCode: 'MOCK-501' });
  });

  it('calls onError with the failing request, for breadcrumbs', async () => {
    const onError = vi.fn();
    const client = createApiClient({ baseUrl: API, app: 'store', version: '0.0.0', onError });
    await unwrap(client.GET('/v1/auth/session')).catch(() => undefined);
    expect(onError).toHaveBeenCalledOnce();
    const [error, info] = onError.mock.calls[0] as [
      ApiError,
      { method: string; path: string; requestId: string },
    ];
    expect(error.code).toBe('AUTH-001');
    expect(info).toMatchObject({ method: 'GET', path: '/v1/auth/session' });
    expect(shortRef(info.requestId)).toMatch(/^[0-9a-f]{4}-[0-9a-f]{4}$/);
  });

  it('errorFromResponse falls back to the X-Request-Id header for the reference', () => {
    const res = new Response('oops', {
      status: 502,
      headers: { 'X-Request-Id': '0193a1f2-aaaa-7000-8000-0000091c044ad' },
    });
    expect(errorFromResponse(res, undefined)).toMatchObject({
      code: 'SYS-500',
      rawCode: null,
      requestId: '91c0-44ad',
    });
  });
});

describe('idempotency (PY-01; brief F3 AC: a double tap sends one request with one key)', () => {
  const createOrder = (key: string) =>
    unwrap(
      api.POST('/v1/orders', {
        params: { header: idempotencyHeader(key) },
        body: { sessionId: SESSION, items: [{ productId: PRODUCT, quantity: 2 }], channel: 'card' },
      }),
    );

  it('a double tap sends one request with one key', async () => {
    const action = idempotentAction(createOrder);
    const [a, b] = await Promise.all([action.run(), action.run()]);
    expect(a.id).toBe(b.id);
    const posts = seen.filter((r) => r.method === 'POST' && r.url.endsWith('/v1/orders'));
    expect(posts).toHaveLength(1);
    expect(posts[0]?.headers.get('Idempotency-Key')).toBe(action.key);
  });

  it('a retry after a failure reuses the key; reset() starts a new action', async () => {
    const keys: string[] = [];
    let fail = true;
    const action = idempotentAction(async (key) => {
      keys.push(key);
      if (fail) throw new Error('timeout');
      return createOrder(key);
    });
    await expect(action.run()).rejects.toThrow('timeout');
    fail = false;
    await action.run();
    expect(keys[0]).toBe(keys[1]);
    action.reset();
    await action.run();
    expect(keys[2]).not.toBe(keys[0]);
  });
});

describe('realtime', () => {
  it('delivers order.updated and receipt.issued from the stream', async () => {
    const order = await unwrap(
      api.POST('/v1/orders', {
        params: { header: idempotencyHeader(crypto.randomUUID()) },
        body: { sessionId: SESSION, items: [{ productId: PRODUCT, quantity: 1 }], channel: 'card' },
      }),
    );
    const events: RealtimeEvent[] = [];
    const got = new Promise<void>((resolve) => {
      const sub = subscribeRealtime({
        baseUrl: API,
        channels: [`order:${order.id}`],
        onEvent: (e) => {
          events.push(e);
          if (e.type === 'receipt.issued') {
            sub.close();
            resolve();
          }
        },
      });
    });
    await new Promise((r) => setTimeout(r, 50)); // let the stream open
    vi.useFakeTimers({ toFake: ['Date'] });
    await unwrap(
      api.POST('/v1/orders/{orderId}/payment-attempts', {
        params: { path: { orderId: order.id }, header: idempotencyHeader(crypto.randomUUID()) },
        body: { channel: 'card' },
      }),
    );
    vi.setSystemTime(Date.now() + 4_000);
    await unwrap(
      api.POST('/v1/orders/{orderId}/verify', { params: { path: { orderId: order.id } } }),
    );
    await got;
    expect(events.map((e) => e.type)).toEqual(['order.updated', 'receipt.issued']);
    expect(events[1]?.data).toMatchObject({ orderId: order.id });
  });

  it('falls back to polling every 3 s without EventSource, and stops on close', () => {
    vi.useFakeTimers();
    const poll = vi.fn();
    const sub = subscribeRealtime({
      baseUrl: API,
      channels: ['order:x'],
      onEvent: vi.fn(),
      poll,
      EventSourceImpl: undefined,
    });
    expect(sub.mode).toBe('polling');
    vi.advanceTimersByTime(POLL_INTERVAL_MS * 3);
    expect(poll).toHaveBeenCalledTimes(3);
    sub.close();
    vi.advanceTimersByTime(POLL_INTERVAL_MS * 3);
    expect(poll).toHaveBeenCalledTimes(3);
  });

  it('polls until the stream opens, and again if it drops', () => {
    vi.useFakeTimers();
    const listeners = new Map<string, () => void>();
    class FakeSource {
      readonly url: string;
      constructor(url: string) {
        this.url = url;
      }
      addEventListener(type: string, fn: () => void) {
        listeners.set(type, fn);
      }
      close() {}
    }
    const poll = vi.fn();
    const sub = subscribeRealtime({
      baseUrl: API,
      channels: ['order:x'],
      onEvent: vi.fn(),
      poll,
      EventSourceImpl: FakeSource as unknown as typeof EventSource,
    });
    vi.advanceTimersByTime(POLL_INTERVAL_MS);
    expect(poll).toHaveBeenCalledTimes(1);
    listeners.get('open')?.();
    expect(sub.mode).toBe('open');
    vi.advanceTimersByTime(POLL_INTERVAL_MS * 2);
    expect(poll).toHaveBeenCalledTimes(1);
    listeners.get('error')?.();
    vi.advanceTimersByTime(POLL_INTERVAL_MS);
    expect(poll).toHaveBeenCalledTimes(2);
    sub.close();
  });
});
