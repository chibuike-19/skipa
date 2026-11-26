// Real-time fan-out (AD §6.11): services call publish(tx, channel, type, data) inside their
// transaction → pg_notify, delivered only if the transaction commits. Each API process LISTENs once
// and fans out to its SSE connections. A 5-minute ring buffer lets clients resume with
// Last-Event-ID; older gaps are left to the client's refetch.
import type { FastifyReply } from 'fastify';
import pg from 'pg';

import { uuidv7 } from './ids.ts';
import type { Logger } from './logger.ts';

export const NOTIFY_CHANNEL = 'skipa_events';
/** Postgres NOTIFY payloads must stay under 8000 bytes; keep events to ids and small data. */
export const MAX_PAYLOAD_BYTES = 7_900;
export const RING_BUFFER_MS = 5 * 60_000;
export const KEEP_ALIVE_MS = 25_000;

/** Channels from AD §6.11: order:<id>, device:<id>, shopper:<id>, session:<id>, branch:<id>, org:<id>, platform. */
const CHANNEL = /^(?:(?:order|device|shopper|session|branch|org):[0-9a-f-]{36}|platform)$/;

/** Event types allowed by the contract's RealtimeEvent schema. */
export const REALTIME_EVENT_TYPES = [
  'order.updated',
  'receipt.issued',
  'exit.check_recorded',
  'exit.device_status',
  'refund.updated',
  'ticket.message',
  'ticket.updated',
  'alert.raised',
  'live.counters',
  'branch.status',
  'catalogue.updated',
] as const;
export type RealtimeEventType = (typeof REALTIME_EVENT_TYPES)[number];

/** Internal form: the contract's RealtimeEvent {id, type, at, data} plus the channel it went to. */
export interface RealtimeEvent {
  /** UUID v7, so ids sort by time across processes. */
  id: string;
  channel: string;
  type: RealtimeEventType;
  data: Record<string, unknown>;
  at: string;
}

interface Queryable {
  query(text: string, values?: unknown[]): Promise<unknown>;
}

export function assertChannel(channel: string) {
  if (!CHANNEL.test(channel)) throw new Error(`invalid realtime channel: ${channel}`);
}

/** Publish inside the caller's transaction (pass the transaction's client). */
export async function publish(
  tx: Queryable,
  channel: string,
  type: RealtimeEventType,
  data: Record<string, unknown>,
): Promise<void> {
  assertChannel(channel);
  if (!REALTIME_EVENT_TYPES.includes(type)) throw new Error(`unknown realtime event type: ${type}`);
  const event: RealtimeEvent = { id: uuidv7(), channel, type, data, at: new Date().toISOString() };
  const payload = JSON.stringify(event);
  if (Buffer.byteLength(payload) > MAX_PAYLOAD_BYTES) {
    throw new Error(`realtime payload for ${type} is too large; send ids and let clients refetch`);
  }
  await tx.query('SELECT pg_notify($1, $2)', [NOTIFY_CHANNEL, payload]);
}

type Listener = (event: RealtimeEvent) => void;

export class RealtimeHub {
  private client: pg.Client | undefined;
  private readonly listeners = new Map<string, Set<Listener>>();
  private buffer: RealtimeEvent[] = [];
  private stopped = false;
  private reconnectTimer: NodeJS.Timeout | undefined;

  private readonly connectionString: string;
  private readonly logger: Logger;

  constructor(connectionString: string, logger: Logger) {
    this.connectionString = connectionString;
    this.logger = logger;
  }

  async start(): Promise<void> {
    this.stopped = false;
    const client = new pg.Client({
      connectionString: this.connectionString,
      application_name: 'skipa-realtime',
    });
    client.on('notification', (message) => {
      if (message.channel !== NOTIFY_CHANNEL || message.payload === undefined) return;
      try {
        this.deliver(JSON.parse(message.payload) as RealtimeEvent);
      } catch (error) {
        this.logger.error(
          { err: error, event: 'realtime.bad_payload' },
          'could not parse realtime event',
        );
      }
    });
    client.on('error', (error) => {
      this.logger.error(
        { err: error, event: 'realtime.listener_error' },
        'realtime listener lost; reconnecting',
      );
      this.scheduleReconnect();
    });
    await client.connect();
    await client.query(`LISTEN ${NOTIFY_CHANNEL}`);
    this.client = client;
  }

  async stop(): Promise<void> {
    this.stopped = true;
    clearTimeout(this.reconnectTimer);
    const client = this.client;
    this.client = undefined;
    await client?.end().catch(() => undefined);
    this.listeners.clear();
  }

  /**
   * Listen to `channels`. With `lastEventId`, buffered events after it (up to 5 minutes old) are
   * replayed first. Events older than the buffer are not replayed; clients refetch on reconnect.
   */
  subscribe(channels: readonly string[], listener: Listener, lastEventId?: string): () => void {
    for (const channel of channels) assertChannel(channel);
    if (lastEventId !== undefined) {
      this.prune();
      for (const event of this.buffer) {
        if (event.id > lastEventId && channels.includes(event.channel)) listener(event);
      }
    }
    for (const channel of channels) {
      let set = this.listeners.get(channel);
      if (!set) this.listeners.set(channel, (set = new Set()));
      set.add(listener);
    }
    return () => {
      for (const channel of channels) {
        const set = this.listeners.get(channel);
        set?.delete(listener);
        if (set?.size === 0) this.listeners.delete(channel);
      }
    };
  }

  get connectionCount(): number {
    let n = 0;
    for (const set of this.listeners.values()) n += set.size;
    return n;
  }

  private deliver(event: RealtimeEvent) {
    this.buffer.push(event);
    this.prune();
    for (const listener of this.listeners.get(event.channel) ?? []) {
      try {
        listener(event);
      } catch (error) {
        this.logger.error(
          { err: error, event: 'realtime.listener_threw' },
          'realtime listener failed',
        );
      }
    }
  }

  private prune() {
    const cutoff = Date.now() - RING_BUFFER_MS;
    const firstKept = this.buffer.findIndex((e) => Date.parse(e.at) >= cutoff);
    this.buffer = firstKept === -1 ? [] : this.buffer.slice(firstKept);
  }

  private scheduleReconnect(delayMs = 1_000) {
    if (this.stopped || this.reconnectTimer) return;
    const old = this.client;
    this.client = undefined;
    old?.end().catch(() => undefined);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.start().catch((error: unknown) => {
        this.logger.error(
          { err: error, event: 'realtime.reconnect_failed' },
          'realtime reconnect failed',
        );
        this.scheduleReconnect(Math.min(delayMs * 2, 30_000));
      });
    }, delayMs);
  }
}

/**
 * Turn a reply into an SSE stream for `channels` (the route must already have checked that the
 * caller may read them). Keep-alive comments every 25 s (Cloudflare closes idle streams at 100 s).
 */
export function streamEvents(
  reply: FastifyReply,
  hub: RealtimeHub,
  channels: readonly string[],
  lastEventId?: string,
) {
  reply.hijack();
  const res = reply.raw;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'X-Request-Id': reply.request.id,
  });
  // `data` is exactly the contract's RealtimeEvent: {id, type, at, data}.
  const write = (event: RealtimeEvent) => {
    const body = JSON.stringify({ id: event.id, type: event.type, at: event.at, data: event.data });
    res.write(`id: ${event.id}\nevent: ${event.type}\ndata: ${body}\n\n`);
  };
  res.write('retry: 3000\n\n');
  const unsubscribe = hub.subscribe(channels, write, lastEventId);
  const keepAlive = setInterval(() => res.write(': keep-alive\n\n'), KEEP_ALIVE_MS);
  res.on('close', () => {
    clearInterval(keepAlive);
    unsubscribe();
  });
}
