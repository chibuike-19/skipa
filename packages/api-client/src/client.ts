// The one way the apps call the API (brief §4, AD §8.2): typed by the generated contract, cookies
// included, every request labelled with the app and given a request ID that flows to the API's
// logs, GlitchTip and the user's short reference (AD §10.2).
import createClient, { type Client } from 'openapi-fetch';

import { ApiError, errorFromResponse, networkError } from './errors.ts';
import type { paths } from './generated/schema.ts';

export type SkipaApp = 'shopper' | 'exit' | 'store' | 'admin';

export interface ApiClientOptions {
  /** VITE_API_URL, e.g. http://localhost:4000 or https://api.staging.skipa.ng */
  baseUrl: string;
  app: SkipaApp;
  /** App version for X-Skipa-Client, e.g. 1.0.0 */
  version: string;
  /** Called for every failed call, before it is thrown: Sentry breadcrumbs, session expiry. */
  onError?: (error: ApiError, request: { method: string; path: string; requestId: string }) => void;
  /** Extra headers per request, e.g. the shopper's `X-Skipa-Device` token (contract: Device). */
  headers?: () => Record<string, string>;
  /** For tests. Defaults to the global fetch at call time (so MSW can intercept it). */
  fetch?: (request: Request) => Promise<Response>;
}

export type ApiClient = Client<paths>;

const lastRequestIds = new WeakMap<Request, string>();

export function createApiClient(options: ApiClientOptions): ApiClient {
  const client = createClient<paths>({
    baseUrl: options.baseUrl,
    credentials: 'include',
    fetch: options.fetch ?? ((request: Request) => globalThis.fetch(request)),
  });
  client.use({
    onRequest({ request }) {
      request.headers.set('X-Skipa-Client', `${options.app}/${options.version}`);
      if (!request.headers.has('X-Request-Id'))
        request.headers.set('X-Request-Id', crypto.randomUUID());
      for (const [name, value] of Object.entries(options.headers?.() ?? {}))
        request.headers.set(name, value);
      lastRequestIds.set(request, request.headers.get('X-Request-Id') ?? '');
      return request;
    },
    async onResponse({ request, response }) {
      if (response.ok || options.onError === undefined) return undefined;
      const body: unknown = await response
        .clone()
        .json()
        .catch(() => undefined);
      options.onError(errorFromResponse(response, body), {
        method: request.method,
        path: new URL(request.url).pathname,
        requestId: lastRequestIds.get(request) ?? '',
      });
      return undefined;
    },
    onError({ request, error }) {
      options.onError?.(networkError(error), {
        method: request.method,
        path: new URL(request.url).pathname,
        requestId: lastRequestIds.get(request) ?? '',
      });
      return undefined;
    },
  });
  return client;
}

interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/**
 * Await an openapi-fetch call and return its data, or throw an ApiError. TanStack Query functions
 * use this so failures arrive as ApiError with code, user message and reference.
 */
export async function unwrap<T>(call: Promise<FetchResult<T>>): Promise<T> {
  let result: FetchResult<T>;
  try {
    result = await call;
  } catch (cause) {
    throw cause instanceof ApiError ? cause : networkError(cause);
  }
  if (!result.response.ok) throw errorFromResponse(result.response, result.error);
  // 202/204 responses have no body; the operation's type says so (data: never/undefined).
  return result.data as T;
}
