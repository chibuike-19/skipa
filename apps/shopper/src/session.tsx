// Shopper session (brief §4): the device (registered once, token kept on the phone) and the
// shopper, if signed in (GET /v1/me; 401 means a guest). Store sessions (check-in) arrive in F1.
import { unwrap, type Schema } from '@skipa/api-client';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, type ReactNode } from 'react';

import { api, APP_VERSION, storedDevice, storeDevice, type StoredDevice } from './api.ts';

export interface ShopperSession {
  status: 'loading' | 'ready';
  /** The device could not be registered (offline or API down). */
  offline: boolean;
  device: StoredDevice | null;
  /** null for guests. */
  shopper: Schema<'ShopperProfile'> | null;
}

const Ctx = createContext<ShopperSession>({
  status: 'loading',
  offline: false,
  device: null,
  shopper: null,
});

export function useSession(): ShopperSession {
  return useContext(Ctx);
}

async function ensureDevice(): Promise<StoredDevice> {
  const existing = storedDevice();
  if (existing !== null) return existing;
  const device = await unwrap(
    api.POST('/v1/devices', { body: { platform: 'web', appVersion: `shopper@${APP_VERSION}` } }),
  );
  storeDevice(device);
  return device;
}

async function loadShopper(): Promise<Schema<'ShopperProfile'> | null> {
  try {
    return await unwrap(api.GET('/v1/me'));
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: string }).code === 'AUTH-001'
    )
      return null;
    throw error;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const device = useQuery({ queryKey: ['device'], queryFn: ensureDevice, staleTime: Infinity });
  const shopper = useQuery({ queryKey: ['me'], queryFn: loadShopper, enabled: device.isSuccess });
  // No connection or API down: carry on as a guest (Skipa opens offline, D-15); the device is
  // registered on the next open. A disabled query stays "pending", so don't wait on it.
  const waiting = device.isPending || (device.isSuccess && shopper.isPending);
  const value: ShopperSession = {
    status: waiting ? 'loading' : 'ready',
    offline: device.isError,
    device: device.data ?? null,
    shopper: shopper.data ?? null,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
