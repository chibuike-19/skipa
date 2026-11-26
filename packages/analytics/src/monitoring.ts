// GlitchTip error reporting for the four web apps (AD §10.1). Uses the Sentry SDK pointed at
// GlitchTip through the API tunnel (/v1/monitoring/tunnel), so the browser never talks to a third
// party and ad blockers don't drop reports. Nothing personal is sent: every event and breadcrumb
// goes through scrubPersonalData (AN-06, ER-05).
//
// The SDK (~25 KB gz) is loaded after first paint to keep the shopper shell under its budget
// (brief §12). Errors raised before it loads are buffered and sent once it is ready.
import { REMOVED, scrubPersonalData, scrubText, scrubUrl } from './scrub.ts';

export interface MonitoringOptions {
  app: 'shopper' | 'exit' | 'store' | 'admin';
  /** VITE_SENTRY_DSN (GlitchTip project DSN; public by design). Empty = reporting off. */
  dsn: string | undefined;
  /** VITE_API_URL: the tunnel lives on the API. */
  apiUrl: string;
  /** VITE_RELEASE, e.g. shopper@1.0.0+9f2c1ab (ER-12) */
  release: string | undefined;
  environment: string;
}

interface ApiErrorLike {
  kind: 'api' | 'network';
  status: number | null;
  code: string | null;
  rawCode: string | null;
  requestId: string | null;
}

type Sentry = typeof import('@sentry/react');

let sentry: Sentry | undefined;
const early: unknown[] = [];
let started = false;

/** Minimal event shape we touch in beforeSend (the SDK's own type is wider). */
interface ScrubbableEvent {
  request?: { url?: string; query_string?: unknown; cookies?: unknown; headers?: unknown; data?: unknown };
  user?: unknown;
  message?: string;
  exception?: { values?: { value?: string }[] };
  extra?: unknown;
  contexts?: unknown;
  breadcrumbs?: { message?: string; data?: Record<string, unknown> }[];
  tags?: Record<string, unknown>;
}

/** Exported for tests: what beforeSend does to every event. */
export function scrubEvent<E extends ScrubbableEvent>(event: E): E {
  const e = { ...event };
  if (e.request !== undefined) {
    e.request = { url: e.request.url === undefined ? undefined : scrubUrl(e.request.url) };
  }
  // Staff and shoppers are identified only by internal IDs elsewhere; never send a user object.
  delete e.user;
  if (e.message !== undefined) e.message = scrubText(e.message);
  if (e.exception?.values !== undefined) {
    e.exception = { ...e.exception, values: e.exception.values.map((v) => ({ ...v, value: v.value === undefined ? undefined : scrubText(v.value) })) };
  }
  e.extra = scrubPersonalData(e.extra);
  e.contexts = scrubPersonalData(e.contexts);
  if (e.breadcrumbs !== undefined) e.breadcrumbs = e.breadcrumbs.map(scrubBreadcrumb);
  return e;
}

export function scrubBreadcrumb<B extends { message?: string; data?: Record<string, unknown> }>(crumb: B): B {
  const b = { ...crumb };
  if (b.message !== undefined) b.message = scrubText(b.message);
  if (b.data !== undefined) {
    const data = scrubPersonalData(b.data);
    if (typeof data.url === 'string') data.url = scrubUrl(data.url);
    // Fetch breadcrumbs: keep method, status and path only (AD §10.1).
    delete data.request_body_size;
    delete data.response_body_size;
    b.data = data;
  }
  return b;
}

function onEarlyError(event: ErrorEvent | PromiseRejectionEvent) {
  early.push('reason' in event ? event.reason : event.error);
}

export function startMonitoring(options: MonitoringOptions): void {
  if (started || options.dsn === undefined || options.dsn === '') return;
  started = true;
  addEventListener('error', onEarlyError);
  addEventListener('unhandledrejection', onEarlyError);
  const load = async () => {
    const s = await import('@sentry/react');
    s.init({
      dsn: options.dsn,
      tunnel: new URL('/v1/monitoring/tunnel', options.apiUrl).href,
      release: options.release,
      environment: options.environment,
      initialScope: { tags: { app: options.app } },
      beforeSend: (event) => scrubEvent(event as ScrubbableEvent) as typeof event,
      beforeBreadcrumb: (crumb) => (crumb === null ? null : scrubBreadcrumb(crumb as { message?: string; data?: Record<string, unknown> }) as typeof crumb),
    });
    sentry = s;
    removeEventListener('error', onEarlyError);
    removeEventListener('unhandledrejection', onEarlyError);
    for (const error of early.splice(0)) s.captureException(error);
  };
  const idle = (globalThis as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
  idle(() => {
    void load();
  });
}

/**
 * Record a failed API call (AD §10.1): a breadcrumb with path, status and request ID always; an
 * error report only for server faults (5xx) and codes the catalogue doesn't know. User errors
 * (wrong code, cart limit) and being offline are expected and not reported.
 */
export function reportApiError(error: ApiErrorLike, request: { method: string; path: string; requestId: string }): void {
  const crumb = {
    category: 'api',
    level: 'warning' as const,
    message: `${request.method} ${request.path} → ${error.status === null ? 'network' : String(error.status)} ${error.rawCode ?? ''}`.trim(),
    data: { method: request.method, path: scrubUrl(request.path), status: error.status, code: error.rawCode, request_id: request.requestId },
  };
  if (sentry === undefined) return;
  sentry.addBreadcrumb(crumb);
  const serverFault = error.kind === 'api' && (error.status ?? 0) >= 500;
  const unknownCode = error.kind === 'api' && error.code === 'SYS-500' && error.rawCode !== 'SYS-500';
  if (serverFault || unknownCode) {
    sentry.captureMessage(`API ${error.rawCode ?? 'error'} on ${request.method} ${request.path}`, {
      level: 'error',
      tags: { request_id: request.requestId, error_code: error.rawCode ?? 'none', reference: error.requestId ?? REMOVED },
    });
  }
}
