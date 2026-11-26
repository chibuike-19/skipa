import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { readMockConfig } from './config.ts';
import { OPERATIONS } from './generated/operations.ts';
import { OTP } from './handlers/platform.ts';
import { MOCKS } from './index.ts';
import { createMockServer } from './node.ts';
import { scenarioFromLocation, setScenario } from './scenarios.ts';
import { fixtures } from './seed.ts';
import { PAYMENT_SETTLE_MS, PENDING_TOO_LONG_MS, resetState } from './state.ts';

const API = 'http://localhost:4000';
const server = createMockServer();

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});
afterAll(() => {
  server.close();
});
beforeEach(() => {
  resetState();
  setScenario('default');
});
afterEach(() => vi.useRealTimers());

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
const getJson = async <T>(res: Response): Promise<T> => (await res.json()) as T;

type Order = {
  id: string;
  status: string;
  receiptId: string | null;
  pendingTooLong: boolean;
  totalKobo: number;
  orderNumber: string;
};

async function placeOrder(key = crypto.randomUUID()): Promise<Order> {
  const res = await post(
    '/v1/orders',
    {
      sessionId: fixtures.checkIn.sessionId,
      items: [{ productId: fixtures.catalogue.products[0]?.id, quantity: 2 }],
      channel: 'card',
    },
    { 'Idempotency-Key': key },
  );
  expect(res.status).toBe(201);
  return getJson<Order>(res);
}

async function pay(orderId: string): Promise<void> {
  const res = await post(
    `/v1/orders/${orderId}/payment-attempts`,
    { channel: 'card' },
    { 'Idempotency-Key': crypto.randomUUID() },
  );
  expect(res.status).toBe(201);
}

const fetchOrder = async (id: string) => getJson<Order>(await fetch(`${API}/v1/orders/${id}`));

describe('handlers', () => {
  it('are built from contract operations, so paths cannot drift', () => {
    for (const m of MOCKS) expect(OPERATIONS[m.operationId]).toBeDefined();
  });
});

describe('payments: only the server marks an order Paid (SH-19, PY-02)', () => {
  it('is pending after Paystack hands back, then paid with a receipt once verified', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const order = await placeOrder();
    expect(order.totalKobo).toBe(80_000);
    await pay(order.id);
    expect((await fetchOrder(order.id)).status).toBe('pending');

    vi.setSystemTime(Date.now() + PAYMENT_SETTLE_MS);
    const paid = await fetchOrder(order.id);
    expect(paid.status).toBe('paid');
    expect(paid.receiptId).not.toBeNull();
    const receipt = await fetch(`${API}/v1/receipts/${paid.receiptId ?? ''}`);
    expect(receipt.status).toBe(200);
    expect(await getJson<{ receiptNumber: string }>(receipt)).toMatchObject({
      receiptNumber: paid.orderNumber.replace('SKP-', ''),
    });
  });

  it('payment-pending-long: stays pending and reports pendingTooLong after 2 minutes (PAY-007)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    setScenario('payment-pending-long');
    const order = await placeOrder();
    await pay(order.id);
    vi.setSystemTime(Date.now() + PENDING_TOO_LONG_MS - 1_000);
    expect(await fetchOrder(order.id)).toMatchObject({ status: 'pending', pendingTooLong: false });
    vi.setSystemTime(Date.now() + 1_000);
    expect(await fetchOrder(order.id)).toMatchObject({ status: 'pending', pendingTooLong: true });
  });

  it('payment-failed: the order fails and no receipt exists', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    setScenario('payment-failed');
    const order = await placeOrder();
    await pay(order.id);
    vi.setSystemTime(Date.now() + PAYMENT_SETTLE_MS);
    expect(await fetchOrder(order.id)).toMatchObject({ status: 'failed', receiptId: null });
  });

  it('streams order.updated and receipt.issued over SSE in the API wire format', async () => {
    const order = await placeOrder();
    const events: { type: string; data: { type: string; data: { orderId: string } } }[] = [];
    const source = new EventSource(`${API}/v1/stream?channels=order:${order.id}`);
    const done = new Promise<void>((resolve) => {
      for (const type of ['order.updated', 'receipt.issued']) {
        source.addEventListener(type, (e) => {
          events.push({ type, data: JSON.parse((e as MessageEvent<string>).data) as never });
          if (events.length === 2) resolve();
        });
      }
    });
    await new Promise<void>((resolve) => {
      source.addEventListener(
        'open',
        () => {
          resolve();
        },
        { once: true },
      );
    });
    vi.useFakeTimers({ toFake: ['Date'] });
    await pay(order.id);
    vi.setSystemTime(Date.now() + PAYMENT_SETTLE_MS);
    await post(`/v1/orders/${order.id}/verify`, undefined);
    await done;
    source.close();
    expect(events.map((e) => e.type)).toEqual(['order.updated', 'receipt.issued']);
    expect(events[1]?.data).toMatchObject({ type: 'receipt.issued', data: { orderId: order.id } });
  });
});

describe('Idempotency-Key (CS-03, PY-01)', () => {
  it('replays the first response for the same key: a double tap creates one order', async () => {
    const key = crypto.randomUUID();
    const first = await placeOrder(key);
    const second = await placeOrder(key);
    expect(second.id).toBe(first.id);
  });

  it('rejects a money-moving request without a key (SYS-400)', async () => {
    const res = await post('/v1/orders', {
      sessionId: fixtures.checkIn.sessionId,
      items: [],
      channel: 'card',
    });
    expect(res.status).toBe(400);
    expect(await getJson<{ error: { code: string } }>(res)).toMatchObject({
      error: { code: 'SYS-400' },
    });
  });
});

describe('scenarios', () => {
  it('server-error: SYS-500 with the short reference that matches X-Request-Id (ER-08)', async () => {
    setScenario('server-error');
    const res = await post('/v1/check-ins', { qrCode: 'QR-ADU-LKI-01' });
    const body = await getJson<{ error: { code: string; requestId: string; userMessage: string } }>(
      res,
    );
    expect(res.status).toBe(500);
    expect(body.error.code).toBe('SYS-500');
    const tail = (res.headers.get('X-Request-Id') ?? '').replace(/-/g, '').slice(-8);
    expect(body.error.requestId).toBe(`${tail.slice(0, 4)}-${tail.slice(4)}`);
  });

  it('offline: requests fail at the network level', async () => {
    setScenario('offline');
    await expect(fetch(`${API}/v1/orders/${fixtures.orderPending.id}`)).rejects.toThrow();
  });

  it.each([
    ['default', 'active', 'on'],
    ['branch-switched-off', 'switched_off', 'off'],
    ['payments-unavailable', 'payments_unavailable', 'payments_unavailable'],
  ] as const)('check-in in %s → %s', async (scenario, status, skipaStatus) => {
    setScenario(scenario);
    const res = await post('/v1/check-ins', { qrCode: 'QR-ADU-LKI-01' });
    expect(await getJson<{ status: string; branch: { skipaStatus: string } }>(res)).toMatchObject({
      status,
      branch: { skipaStatus },
    });
  });

  it('Harbour Grocers checks in with its own brand', async () => {
    const res = await post('/v1/check-ins', { qrCode: 'QR-HBR-VIC-01' });
    expect(await getJson<{ branch: { brand: { primary: string } } }>(res)).toMatchObject({
      branch: { brand: { primary: '#B3400F' } },
    });
  });

  it.each([
    ['exit-clear', 'clear', null],
    ['exit-flagged', 'flagged', null],
    ['exit-invalid-used', 'invalid', 'already_used'],
    ['exit-invalid-other-branch', 'invalid', 'other_branch'],
  ] as const)('exit lookup in %s → %s', async (scenario, decision, invalidReason) => {
    setScenario(scenario);
    const res = await post(
      '/v1/exit/lookups',
      { receiptNumber: 'LK-04822' },
      { 'Idempotency-Key': crypto.randomUUID() },
    );
    expect(await getJson<{ decision: string; invalidReason: string | null }>(res)).toMatchObject({
      decision,
      invalidReason,
    });
  });

  it('scenario precedence: ?scenario= beats the stored one; unknown names are ignored', () => {
    expect(scenarioFromLocation('?scenario=exit-flagged', 'offline')).toBe('exit-flagged');
    expect(scenarioFromLocation('?scenario=nope', 'offline')).toBe('offline');
    expect(scenarioFromLocation('', null)).toBe('default');
  });
});

describe('sign-in', () => {
  const asExit = { 'X-Skipa-Client': 'exit/0.0.0' };

  it('staff session: 401 until the emailed code is verified (AD-04)', async () => {
    expect((await fetch(`${API}/v1/auth/session`, { headers: asExit })).status).toBe(401);
    const challenge = await getJson<{ challengeId: string; destinationMasked: string }>(
      await post('/v1/auth/otp', {
        destination: 'chidi.o@adunnimart.example',
        purpose: 'staff_sign_in',
        surface: 'exit',
      }),
    );
    expect(challenge.destinationMasked).toBe('c***@adunnimart.example');
    const wrong = await post('/v1/auth/otp/verify', {
      challengeId: challenge.challengeId,
      code: OTP.wrongCode,
    });
    expect(await getJson<{ error: { code: string } }>(wrong)).toMatchObject({
      error: { code: 'AUTH-002' },
    });
    expect(
      (await post('/v1/auth/otp/verify', { challengeId: challenge.challengeId, code: '482913' }))
        .status,
    ).toBe(200);
    const me = await fetch(`${API}/v1/auth/session`, { headers: asExit });
    expect(await getJson<{ name: string; role: string }>(me)).toMatchObject({
      name: 'Chidi O.',
      role: 'exit_checker',
    });
  });
});

describe('unmocked and live operations', () => {
  it('an operation without a mock answers 501 MOCK-501, never invented data', async () => {
    const res = await fetch(`${API}/v1/me/stars`);
    expect(res.status).toBe(501);
    expect(await getJson<{ error: { code: string; message: string } }>(res)).toMatchObject({
      error: { code: 'MOCK-501', message: expect.stringContaining('getStars') as string },
    });
  });

  it('a tag switched to the live API passes through (here: nothing listens, so it fails)', async () => {
    const live = createMockServer(new Set(['Account']));
    server.close();
    live.listen({ onUnhandledFrame: 'bypass' });
    try {
      await expect(fetch('http://127.0.0.1:9/v1/me/stars')).rejects.toThrow();
    } finally {
      live.close();
      server.listen({ onUnhandledFrame: 'error' });
    }
  });

  it('config: VITE_USE_MOCKS turns mocks on; unknown live tags are rejected', () => {
    expect(readMockConfig({ VITE_USE_MOCKS: 'true' }).enabled).toBe(true);
    expect(readMockConfig({}).enabled).toBe(false);
    expect([...readMockConfig({ VITE_MOCK_LIVE_TAGS: 'Shopping, Payments' }).liveTags]).toEqual([
      'Shopping',
      'Payments',
    ]);
    expect(() => readMockConfig({ VITE_MOCK_LIVE_TAGS: 'Shoping' })).toThrow(
      /unknown tags: Shoping/,
    );
  });
});
