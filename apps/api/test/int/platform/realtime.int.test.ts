// SSE fan-out via LISTEN/NOTIFY (AD §6.11).
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

import pino from 'pino';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';

import {
  publish,
  RealtimeHub,
  streamEvents,
  type RealtimeEvent,
} from '../../../src/platform/realtime.ts';
import { harness, type Harness } from './harness.ts';

let hub: RealtimeHub;
let client: pg.Client;
let h: Harness;

beforeAll(async () => {
  const urls = inject('db');
  hub = new RealtimeHub(urls.platformUrl, pino({ level: 'silent' }));
  await hub.start();
  client = new pg.Client({ connectionString: urls.platformUrl });
  await client.connect();
  h = await harness(async (app) => {
    app.get('/test/stream', (request, reply) => {
      const query = request.query as { channels: string; lastEventId?: string };
      streamEvents(reply, hub, query.channels.split(','), query.lastEventId);
    });
  });
});
afterAll(async () => {
  await hub.stop();
  await client.end();
});

const until = async (check: () => boolean, ms = 3_000) => {
  const end = Date.now() + ms;
  while (!check() && Date.now() < end) await sleep(20);
};

async function inTx(fn: () => Promise<void>, commit: boolean) {
  await client.query('BEGIN');
  await fn();
  await client.query(commit ? 'COMMIT' : 'ROLLBACK');
}

describe('RealtimeHub', () => {
  it('delivers events published in a committed transaction, and nothing from a rolled-back one', async () => {
    const channel = `order:${randomUUID()}`;
    const got: RealtimeEvent[] = [];
    const unsubscribe = hub.subscribe([channel], (e) => got.push(e));
    await inTx(
      () => publish(client, channel, 'order.updated', { status: 'cancelled-by-rollback' }),
      false,
    );
    await inTx(
      () => publish(client, channel, 'receipt.issued', { receiptNumber: 'LK-04822' }),
      true,
    );
    await until(() => got.length > 0);
    await sleep(100);
    expect(got.map((e) => e.type)).toEqual(['receipt.issued']);
    expect(got[0]?.data).toEqual({ receiptNumber: 'LK-04822' });
    unsubscribe();
  });

  it('only delivers to subscribers of that channel', async () => {
    const mine = `branch:${randomUUID()}`;
    const other = `branch:${randomUUID()}`;
    const got: RealtimeEvent[] = [];
    const unsubscribe = hub.subscribe([mine], (e) => got.push(e));
    await publish(client, other, 'live.counters', { n: 1 });
    await publish(client, mine, 'live.counters', { n: 2 });
    await until(() => got.length > 0);
    await sleep(100);
    expect(got.map((e) => e.data)).toEqual([{ n: 2 }]);
    unsubscribe();
  });

  it('replays buffered events after Last-Event-ID on resume', async () => {
    const channel = `order:${randomUUID()}`;
    const first: RealtimeEvent[] = [];
    const stop = hub.subscribe([channel], (e) => first.push(e));
    await publish(client, channel, 'order.updated', { step: 1 });
    await until(() => first.length === 1);
    stop();
    await publish(client, channel, 'order.updated', { step: 2 });
    await publish(client, channel, 'receipt.issued', { step: 3 });
    await sleep(200);
    const resumed: RealtimeEvent[] = [];
    const stop2 = hub.subscribe([channel], (e) => resumed.push(e), first[0]?.id);
    expect(resumed.map((e) => e.data)).toEqual([{ step: 2 }, { step: 3 }]);
    stop2();
  });

  it('refuses unknown channels, unknown event types and oversized payloads', async () => {
    await expect(publish(client, 'everyone', 'order.updated', {})).rejects.toThrow(
      /invalid realtime channel/,
    );
    // @ts-expect-error — not a contract event type
    await expect(publish(client, `order:${randomUUID()}`, 'order.deleted', {})).rejects.toThrow(
      /unknown realtime event type/,
    );
    await expect(
      publish(client, `order:${randomUUID()}`, 'order.updated', { blob: 'x'.repeat(9_000) }),
    ).rejects.toThrow(/too large/);
  });
});

describe('streamEvents() over HTTP', () => {
  it("streams the contract's RealtimeEvent {id, type, at, data} as SSE", async () => {
    const channel = `order:${randomUUID()}`;
    const address = await h.app.listen({ port: 0, host: '127.0.0.1' });
    const controller = new AbortController();
    const res = await fetch(`${address}/test/stream?channels=${channel}`, {
      signal: controller.signal,
    });
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    expect(res.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
    if (!res.body) throw new Error('no response body');
    const reader: ReadableStreamDefaultReader<Uint8Array> = res.body.getReader();
    const decoder = new TextDecoder();
    await until(() => hub.connectionCount > 0);
    await publish(client, channel, 'receipt.issued', { receiptNumber: 'LK-04822' });
    let text = '';
    const end = Date.now() + 3_000;
    while (!text.includes('event: receipt.issued') && Date.now() < end) {
      const chunk = await reader.read();
      if (chunk.done) break;
      text += decoder.decode(chunk.value, { stream: true });
    }
    controller.abort();
    const data = /data: (\{.*\})/.exec(text)?.[1];
    const event = JSON.parse(data ?? '{}') as Record<string, unknown>;
    expect(Object.keys(event).sort()).toEqual(['at', 'data', 'id', 'type']);
    expect(event).toMatchObject({ type: 'receipt.issued', data: { receiptNumber: 'LK-04822' } });
    expect(text).toContain(`id: ${String(event.id)}`);
    await until(() => hub.connectionCount === 0);
    expect(hub.connectionCount).toBe(0);
  });
});
