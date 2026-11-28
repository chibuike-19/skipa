// The shopper app's API client (brief §4): cookies, X-Skipa-Client, request IDs, the device token,
// and every failure recorded for GlitchTip (path, status, request ID only).
import { reportApiError } from '@skipa/analytics/monitoring';
import { createApiClient, type ApiError } from '@skipa/api-client';
import { QueryClient } from '@tanstack/react-query';

import pkg from '../package.json' with { type: 'json' };

export const APP_VERSION = pkg.version;
const DEVICE_KEY = 'skipa.device';

export interface StoredDevice {
  deviceId: string;
  deviceToken: string;
}

export function storedDevice(): StoredDevice | null {
  try {
    const raw = localStorage.getItem(DEVICE_KEY);
    return raw === null ? null : (JSON.parse(raw) as StoredDevice);
  } catch {
    return null;
  }
}

export function storeDevice(device: StoredDevice): void {
  localStorage.setItem(DEVICE_KEY, JSON.stringify(device));
}

export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  app: 'shopper',
  version: APP_VERSION,
  // contract: Device.deviceToken "send as X-Skipa-Device"
  headers: (): Record<string, string> => {
    const device = storedDevice();
    return device === null ? {} : { 'X-Skipa-Device': device.deviceToken };
  },
  onError: reportApiError,
});

function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'kind' in e && 'status' in e;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Retry only what can succeed on retry: dropped connections and server faults.
        retry: (count, error) =>
          isApiError(error) &&
          (error.kind === 'network' || (error.status ?? 0) >= 500) &&
          count < 2,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      // Mutations never retry on their own; money-moving ones carry an Idempotency-Key and the
      // screen decides when to resend (brief §16).
      mutations: { retry: false },
    },
  });
}
