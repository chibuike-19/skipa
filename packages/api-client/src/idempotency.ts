// Money-moving requests carry an Idempotency-Key (AD §8.2, PY-01): a UUID created when the user
// starts the action and reused on every retry, so the server can return the first response instead
// of acting twice. A second tap while the first request is in flight joins it: one request, one key.

export interface IdempotentAction<T> {
  /** Send (or join the request already in flight). Retries after a failure reuse the same key. */
  run(): Promise<T>;
  /** The key this action sends. */
  readonly key: string;
  readonly inFlight: boolean;
  /** Start a new action: the next run() gets a new key. */
  reset(): void;
}

export function idempotentAction<T>(
  send: (idempotencyKey: string) => Promise<T>,
  newKey: () => string = () => crypto.randomUUID(),
): IdempotentAction<T> {
  let key = newKey();
  let pending: Promise<T> | undefined;
  return {
    run() {
      pending ??= send(key).finally(() => {
        pending = undefined;
      });
      return pending;
    },
    get key() {
      return key;
    },
    get inFlight() {
      return pending !== undefined;
    },
    reset() {
      key = newKey();
    },
  };
}

/** Header object for openapi-fetch calls: `params: { header: idempotencyHeader(key) }`. */
export const idempotencyHeader = (key: string) => ({ 'Idempotency-Key': key }) as const;
