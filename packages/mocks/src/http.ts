// The pieces every handler shares: request IDs, the contract's error envelope, and `mock()`, which
// builds an MSW handler from an operationId so the method and path always come from the contract.
import { ERRORS, renderUserMessage, type ErrorCode } from '@skipa/contracts/errors';
import { delay, http, HttpResponse, passthrough, type HttpHandler, type JsonBodyType } from 'msw';

import { OPERATIONS, type OperationId, type Tag } from './generated/operations.ts';
import { getScenario } from './scenarios.ts';

export const API_PATTERN_PREFIX = '*';

/** `/v1/orders/{orderId}` → `*\/v1/orders/:orderId` (any origin, MSW params). */
export function mswPath(contractPath: string): string {
  return API_PATTERN_PREFIX + contractPath.replace(/\{([A-Za-z0-9_]+)\}/g, ':$1');
}

export function newRequestId(): string {
  return crypto.randomUUID();
}

/** The short reference users see (ER-08); same rule as the API's shortRequestRef(). */
export function shortRef(requestId: string): string {
  const tail = requestId
    .replace(/[^0-9a-fA-F]/g, '')
    .toLowerCase()
    .slice(-8)
    .padStart(8, '0');
  return `${tail.slice(0, 4)}-${tail.slice(4)}`;
}

export function json(body: JsonBodyType, status = 200, requestId = newRequestId()): Response {
  return HttpResponse.json(body, { status, headers: { 'X-Request-Id': requestId } });
}

export function empty(status: number, requestId = newRequestId()): Response {
  return new HttpResponse(null, { status, headers: { 'X-Request-Id': requestId } });
}

/** The contract's error envelope, with the catalogue's status and user message (ER-07, ER-08). */
export function apiError(
  code: ErrorCode,
  message: string = ERRORS[code].meaning,
  params: Record<string, string> = {},
): Response {
  const requestId = newRequestId();
  const status = ERRORS[code].http ?? 500;
  return json(
    {
      error: {
        code,
        message,
        userMessage: renderUserMessage(code, params),
        requestId: shortRef(requestId),
      },
    },
    status,
    requestId,
  );
}

export interface MockSample {
  /** Path parameters, e.g. { orderId: '…' }. */
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface MockRequestInfo {
  request: Request;
  params: Record<string, string>;
  url: URL;
  /** The Idempotency-Key header, when the operation takes one. */
  idempotencyKey: string | undefined;
}

export type MockResolver = (info: MockRequestInfo) => Response | Promise<Response>;

export interface MockDefinition {
  operationId: OperationId;
  handler: HttpHandler;
  /** Requests `mocks:validate` sends through this handler in every scenario. */
  samples: MockSample[];
}

/** Scenarios that cut off every API request. */
const NETWORK_DOWN = new Set(['offline']);

// Idempotency-Key replay: same key + same operation returns the first response (CS-03, PY-01).
const replays = new Map<string, { status: number; body: string; headers: [string, string][] }>();

export function resetIdempotency(): void {
  replays.clear();
}

export function mock(
  operationId: OperationId,
  resolver: MockResolver,
  samples: MockSample[] = [{}],
): MockDefinition {
  const op = OPERATIONS[operationId];
  const handler = http[op.method](mswPath(op.path), async ({ request, params }) => {
    await delay(); // realistic latency in the browser, none in Node
    if (NETWORK_DOWN.has(getScenario())) return HttpResponse.error();
    if (getScenario() === 'server-error') return apiError('SYS-500', 'mock scenario server-error');

    const idempotencyKey = request.headers.get('Idempotency-Key') ?? undefined;
    if (op.idempotent) {
      if (idempotencyKey === undefined || !/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
        return apiError('SYS-400', 'Idempotency-Key header (uuid) is required');
      }
      const stored = replays.get(`${operationId}:${idempotencyKey}`);
      if (stored !== undefined) {
        return new HttpResponse(stored.body === '' ? null : stored.body, {
          status: stored.status,
          headers: stored.headers,
        });
      }
    }
    const flatParams = Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
    );
    const response = await resolver({
      request,
      params: flatParams,
      url: new URL(request.url),
      idempotencyKey,
    });
    if (op.idempotent && idempotencyKey !== undefined && response.status < 500) {
      const copy = response.clone();
      replays.set(`${operationId}:${idempotencyKey}`, {
        status: copy.status,
        body: await copy.text(),
        headers: [...copy.headers.entries()],
      });
    }
    return response;
  });
  return { operationId, handler, samples };
}

/** Read a JSON body; undefined when there is none or it does not parse. */
export async function readJson<T>(request: Request): Promise<T | undefined> {
  try {
    return (await request.clone().json()) as T;
  } catch {
    return undefined;
  }
}

const OPERATION_LIST = Object.entries(OPERATIONS).map(([operationId, op]) => ({
  operationId,
  method: op.method.toUpperCase(),
  tag: op.tag,
  pattern: new RegExp(`^${op.path.replace(/\{[A-Za-z0-9_]+\}/g, '[^/]+')}$`),
}));

export function findOperation(
  method: string,
  pathname: string,
): (typeof OPERATION_LIST)[number] | undefined {
  return OPERATION_LIST.find((o) => o.method === method.toUpperCase() && o.pattern.test(pathname));
}

/**
 * Catch-all for API paths no mock handles. Tags switched to the live API pass through; anything
 * else answers 501 MOCK-501 so a screen built against an unmocked endpoint fails loudly instead of
 * receiving invented data.
 */
export function fallbackHandlers(liveTags: ReadonlySet<Tag>): HttpHandler[] {
  const resolve = ({ request }: { request: Request }): Response => {
    const url = new URL(request.url);
    const op = findOperation(request.method, url.pathname);
    if (op !== undefined && liveTags.has(op.tag)) return passthrough();
    const requestId = newRequestId();
    const what =
      op === undefined
        ? 'not in the contract'
        : `operation ${op.operationId} (${op.tag}) has no mock yet`;
    return json(
      {
        error: {
          code: 'MOCK-501',
          message: `${request.method} ${url.pathname}: ${what}`,
          userMessage: "This part of Skipa isn't available in mock mode yet.",
          requestId: shortRef(requestId),
        },
      },
      501,
      requestId,
    );
  };
  return [http.all('*/v1/*', resolve), http.all('*/health/*', resolve)];
}
