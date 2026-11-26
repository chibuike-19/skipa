// GET /v1/stream through MSW's sse(): intercepts the app's real EventSource. Same wire format as
// the API (apps/api/src/platform/realtime.ts): `retry: 3000`, then `id`, `event: <type>`,
// `data: {"id","type","at","data"}`. Event data carries IDs only; the apps refetch on each event
// (AD §8.2), so they never depend on payload details the API has not fixed yet.
import { sse } from 'msw';

import { OPERATIONS } from '../generated/operations.ts';
import { mswPath } from '../http.ts';
import { getScenario } from '../scenarios.ts';
import { subscribe } from '../state.ts';

// RealtimeEvent.type in the contract.
type EventMap = {
  [
    K in
      | 'order.updated'
      | 'receipt.issued'
      | 'exit.check_recorded'
      | 'exit.device_status'
      | 'refund.updated'
      | 'ticket.message'
      | 'ticket.updated'
      | 'alert.raised'
      | 'live.counters'
      | 'branch.status'
      | 'catalogue.updated'
  ]: string;
};

/** MSW needs a global EventSource to build this handler (browsers; Node with --experimental-eventsource). */
export const createStreamHandler = () =>
  sse<EventMap>(mswPath(OPERATIONS.stream.path), ({ client, request }) => {
    if (getScenario() === 'offline' || getScenario() === 'server-error') {
      client.error();
      return;
    }
    const channels = new Set(
      (new URL(request.url).searchParams.get('channels') ?? '')
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c !== ''),
    );
    client.send({ retry: 3000 });
    const unsubscribe = subscribe((event) => {
      if (!channels.has(event.channel)) return;
      client.send({
        id: event.id,
        event: event.type as keyof EventMap,
        data: JSON.stringify({ id: event.id, type: event.type, at: event.at, data: event.data }),
      });
    });
    request.signal.addEventListener('abort', unsubscribe, { once: true });
  });
