import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionProvider, useSession } from './session.tsx';

function Probe() {
  const s = useSession();
  return (
    <span>{`${s.status}|${String(s.offline)}|${s.shopper === null ? 'guest' : s.shopper.name}`}</span>
  );
}

const renderSession = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <SessionProvider>
        <Probe />
      </SessionProvider>
    </QueryClientProvider>,
  );

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('shopper session', () => {
  it('opens as a guest when the API cannot be reached (D-15), instead of loading forever', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderSession();
    await waitFor(() => {
      expect(screen.getByText('ready|true|guest')).toBeTruthy();
    });
  });

  it('registers the device once and keeps its token on the phone', async () => {
    const fetch = vi.fn((request: Request) => {
      const path = new URL(request.url).pathname;
      if (path === '/v1/devices')
        return Promise.resolve(
          Response.json(
            { deviceId: '0193a1f2-0000-7000-8000-0000000000d1', deviceToken: 'dt' },
            { status: 201 },
          ),
        );
      return Promise.resolve(
        Response.json(
          {
            error: {
              code: 'AUTH-001',
              message: 'x',
              userMessage: 'Please sign in again.',
              requestId: '91c0-44ad',
            },
          },
          { status: 401 },
        ),
      );
    });
    vi.stubGlobal('fetch', fetch);
    renderSession();
    await waitFor(() => {
      expect(screen.getByText('ready|false|guest')).toBeTruthy();
    });
    expect(JSON.parse(localStorage.getItem('skipa.device') ?? '{}')).toEqual({
      deviceId: '0193a1f2-0000-7000-8000-0000000000d1',
      deviceToken: 'dt',
    });
    const me = fetch.mock.calls.map(([r]) => r).find((r) => new URL(r.url).pathname === '/v1/me');
    expect(me?.headers.get('X-Skipa-Device')).toBe('dt');
  });
});
