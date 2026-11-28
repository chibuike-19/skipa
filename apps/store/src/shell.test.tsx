// The shell against the MSW mocks: the session guard, email sign-in, navigation and sign-out.
import { OTP, resetState } from '@skipa/mocks';
import { unwrap } from '@skipa/api-client';
import { createMockServer } from '@skipa/mocks/node';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { api, createQueryClient } from './api.ts';
import { createAppRouter } from './router.tsx';
import { safeNext } from './routes/sign-in.tsx';

const server = createMockServer();
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});
afterEach(() => {
  cleanup();
  resetState();
});
afterAll(() => {
  server.close();
});

function renderAt(path: string, queryClient = createQueryClient()) {
  const router = createAppRouter(queryClient, createMemoryHistory({ initialEntries: [path] }));
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { router, queryClient };
}

async function signIn(code: string) {
  fireEvent.change(await screen.findByLabelText('Work email'), {
    target: { value: 'bisi.kalu@adunnimart.example' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Email me a code' }));
  fireEvent.change(await screen.findByLabelText('Digit 1'), { target: { value: code } });
}

describe('store shell', () => {
  it('sends a signed-out user to sign-in, then back to the page they asked for', async () => {
    const { router } = renderAt('/refunds');
    await screen.findByRole('heading', { name: 'Sign in to your store' });
    expect(router.state.location.pathname).toBe('/sign-in');
    await signIn('482913');
    await screen.findByRole('heading', { name: 'Refunds' });
    expect(router.state.location.pathname).toBe('/refunds');
    expect(screen.getByText('Signed in as Bisi Kalu')).toBeTruthy();
  });

  it('opens on Live and marks the current section in the sidebar', async () => {
    const { router } = renderAt('/');
    await signIn('482913');
    await screen.findByRole('heading', { name: 'Live' });
    expect(router.state.location.pathname).toBe('/live');
    expect(screen.getByRole('link', { name: 'Live' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('link', { name: 'Refunds' }));
    await screen.findByRole('heading', { name: 'Refunds' });
    expect(screen.getByRole('link', { name: 'Refunds' }).getAttribute('aria-current')).toBe('page');
  });

  it('an unknown section is a not-found page, not a blank screen', async () => {
    renderAt('/');
    await signIn('482913');
    await screen.findByRole('heading', { name: 'Live' });
    cleanup();
    renderAt('/no-such-section');
    await screen.findByRole('heading', { name: 'We can’t find that page' });
  });

  it('a wrong code shows the catalogue message and stays on the code step', async () => {
    renderAt('/sign-in');
    await signIn(OTP.wrongCode);
    await screen.findByText("That code isn't right. Check and try again.");
    expect(screen.getByRole('heading', { name: 'Enter the code' })).toBeTruthy();
  });

  it('sign out returns to sign-in', async () => {
    const { router } = renderAt('/');
    await signIn('482913');
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
    await screen.findByRole('heading', { name: 'Sign in to your store' });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/sign-in');
    });
  });

  it('a call that answers AUTH-001 ends the session and returns to sign-in', async () => {
    const { router, queryClient } = renderAt('/refunds');
    await signIn('482913');
    await screen.findByText(/^Signed in as /);
    // The server forgets the session (expired or revoked elsewhere); the next call says AUTH-001.
    resetState();
    await queryClient
      .query({ queryKey: ['probe'], queryFn: () => unwrap(api.GET('/v1/auth/session')) })
      .catch(() => undefined);
    await screen.findByRole('heading', { name: 'Sign in to your store' });
    expect(router.state.location.pathname).toBe('/sign-in');
  });

  it('never follows `next` off-site', () => {
    expect(safeNext('/refunds')).toBe('/refunds');
    expect(safeNext('//evil.example')).toBe('/');
    expect(safeNext('https://evil.example')).toBe('/');
  });
});
