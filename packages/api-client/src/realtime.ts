// Live updates (AD §6.11, §8.2): server-sent events from GET /v1/stream, with polling as the
// fallback. Polling runs from the start and whenever the stream is not open (no EventSource, a
// proxy that buffers, a dropped connection) and stops while the stream is open. Events carry IDs;
// callers refetch the resource (e.g. invalidate ['order', id]) rather than trust event payloads.
import type { components } from './generated/schema.ts';

export type RealtimeEvent = components['schemas']['RealtimeEvent'];
export type RealtimeEventType = RealtimeEvent['type'];

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
] as const satisfies readonly RealtimeEventType[];

// Fails to compile if the contract adds an event type this list does not have.
type AssertNone<T extends never> = T;
export type AllRealtimeTypesListed = AssertNone<
  Exclude<RealtimeEventType, (typeof REALTIME_EVENT_TYPES)[number]>
>;

export const POLL_INTERVAL_MS = 3_000;

export interface RealtimeOptions {
  baseUrl: string;
  /** e.g. ['order:<id>'] or ['branch:<id>'] */
  channels: readonly string[];
  onEvent: (event: RealtimeEvent) => void;
  /** Fallback: refetch what the events would have told you about. */
  poll?: () => unknown;
  pollIntervalMs?: number;
  /** For tests; defaults to the global EventSource when there is one. */
  EventSourceImpl?: typeof EventSource | undefined;
}

export interface RealtimeSubscription {
  close(): void;
  /** 'open' while events stream; 'polling' while the fallback runs. */
  readonly mode: 'open' | 'polling';
}

const isEvent = (value: unknown): value is RealtimeEvent =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as RealtimeEvent).id === 'string' &&
  typeof (value as RealtimeEvent).type === 'string' &&
  typeof (value as RealtimeEvent).at === 'string' &&
  typeof (value as RealtimeEvent).data === 'object';

export function subscribeRealtime(options: RealtimeOptions): RealtimeSubscription {
  const interval = options.pollIntervalMs ?? POLL_INTERVAL_MS;
  const Impl = 'EventSourceImpl' in options ? options.EventSourceImpl : globalThis.EventSource;
  let timer: ReturnType<typeof setInterval> | undefined;
  let mode: 'open' | 'polling' = 'polling';

  const startPolling = () => {
    mode = 'polling';
    if (timer !== undefined || options.poll === undefined) return;
    timer = setInterval(() => void options.poll?.(), interval);
  };
  const stopPolling = () => {
    mode = 'open';
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
  };

  startPolling();
  if (Impl === undefined) {
    return {
      close: () => {
        if (timer !== undefined) clearInterval(timer);
      },
      get mode() {
        return mode;
      },
    };
  }

  const url = new URL('/v1/stream', options.baseUrl);
  url.searchParams.set('channels', options.channels.join(','));
  const source = new Impl(url.href, { withCredentials: true });
  source.addEventListener('open', stopPolling);
  source.addEventListener('error', startPolling);
  for (const type of REALTIME_EVENT_TYPES) {
    source.addEventListener(type, (message) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse((message as MessageEvent<string>).data);
      } catch {
        return;
      }
      if (isEvent(parsed)) options.onEvent(parsed);
    });
  }
  return {
    close() {
      source.close();
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    },
    get mode() {
      return mode;
    },
  };
}
