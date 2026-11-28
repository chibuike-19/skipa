// The exit app's API client (brief §4): the per-surface httpOnly session cookie
// (`credentials: 'include'`, AD §5), X-Skipa-Client, request IDs, and every failure recorded for
// GlitchTip (path, status, request ID only).
import { reportApiError } from '@skipa/analytics/monitoring';
import { ApiError, createApiClient } from '@skipa/api-client';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import pkg from '../package.json' with { type: 'json' };

export const APP = 'exit' as const;
export const APP_VERSION = pkg.version;

export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  app: APP,
  version: APP_VERSION,
  onError: reportApiError,
});

/** Query key of the staff session (session.ts). Kept here so the cache can clear it. */
export const SESSION_KEY = ['session'] as const;

export function createQueryClient(): QueryClient {
  // Session ended on the server (expired, revoked, signed out elsewhere): forget it here too, and
  // the signed-in layout sends the user to sign-in (RB-06).
  const onError = (error: unknown) => {
    if (error instanceof ApiError && error.code === 'AUTH-001')
      queryClient.setQueryData(SESSION_KEY, null);
  };
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        // Retry only what can succeed on retry: dropped connections and server faults.
        retry: (count, error) =>
          error instanceof ApiError &&
          (error.kind === 'network' || (error.status ?? 0) >= 500) &&
          count < 2,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
  return queryClient;
}
