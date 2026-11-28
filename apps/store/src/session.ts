// Staff session (brief §4, RB-01): GET /v1/auth/session answers who is signed in on this surface;
// AUTH-001 means nobody is. Routes under `_app` require a session and send everyone else to
// /sign-in, coming back to where they were afterwards.
import { ApiError, unwrap, type Schema } from '@skipa/api-client';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, SESSION_KEY } from './api.ts';

export type StaffMe = Schema<'StaffMe'>;

export const sessionQuery = queryOptions({
  queryKey: SESSION_KEY,
  queryFn: async (): Promise<StaffMe | null> => {
    try {
      return await unwrap(api.GET('/v1/auth/session'));
    } catch (error) {
      if (error instanceof ApiError && error.code === 'AUTH-001') return null;
      throw error;
    }
  },
  staleTime: 5 * 60_000,
});

/** The signed-in staff member; null once the session has ended (the layout then redirects). */
export function useStaff(): StaffMe | null {
  return useQuery(sessionQuery).data ?? null;
}

export function useSignOut(): () => Promise<void> {
  const queryClient = useQueryClient();
  return async () => {
    try {
      await unwrap(api.POST('/v1/auth/sign-out'));
    } finally {
      // Signed out locally even if the request failed: the cookie expires on its own.
      queryClient.setQueryData(sessionQuery.queryKey, null);
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'session' });
    }
  };
}
