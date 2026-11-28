export {
  createApiClient,
  unwrap,
  type ApiClient,
  type ApiClientOptions,
  type SkipaApp,
} from './client.ts';
export {
  ApiError,
  errorFromResponse,
  networkError,
  shortRef,
  type ApiErrorKind,
} from './errors.ts';
export { idempotentAction, idempotencyHeader, type IdempotentAction } from './idempotency.ts';
export {
  subscribeRealtime,
  REALTIME_EVENT_TYPES,
  POLL_INTERVAL_MS,
  type RealtimeEvent,
  type RealtimeEventType,
  type RealtimeOptions,
  type RealtimeSubscription,
} from './realtime.ts';
export type { components, operations, paths } from './generated/schema.ts';

import type { components } from './generated/schema.ts';
/** Shorthand for a named contract schema: `Schema<'Order'>`. */
export type Schema<Name extends keyof components['schemas']> = components['schemas'][Name];
