import { AsyncLocalStorage } from 'node:async_hooks';

/** Per-request (or per-job) context: request ID and who/where, for logs, jobs and errors. */
export interface RequestContext {
  requestId: string;
  route?: string;
  organisationId?: string;
  branchId?: string;
  role?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function currentContext(): RequestContext | undefined {
  return storage.getStore();
}

export function currentRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}
