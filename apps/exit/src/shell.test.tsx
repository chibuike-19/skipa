// The shell against the MSW mocks: the session guard, email sign-in (AD-04) and sign-out.
import { OTP, resetState } from '@skipa/mocks';
import { unwrap } from '@skipa/api-client';
import { createMockServer } from '@skipa/mocks/node';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    target: { value: 'chidi.o@adunnimart.example' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Email me a code' }));
  fireEvent.change(await screen.findByLabelText('Digit 1'), { target: { value: code } });
}

describe('exit shell', () => {
  it('sends a signed-out checker to sign-in, then back to where they were', async () => {
    const { router } = renderAt('/');
    await screen.findByRole('heading', { name: 'Start your shift' });
    expect(router.state.location.pathname).toBe('/sign-in');
    await signIn('482913');
    await screen.findByRole('heading', { name: 'Ready to scan' });
    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByText('Signed in as Chidi O.')).toBeTruthy();
  });

  it('a wrong code shows the catalogue message and stays on the code step', async () => {
    renderAt('/sign-in');
    await signIn(OTP.wrongCode);
    await screen.findByText("That code isn't right. Check and try again.");
    expect(screen.getByRole('heading', { name: 'Enter the code' })).toBeTruthy();
  });

  it('end shift signs out and returns to sign-in', async () => {
    const { router } = renderAt('/');
    await signIn('482913');
    fireEvent.click(await screen.findByRole('button', { name: 'End shift' }));
    await screen.findByRole('heading', { name: 'Start your shift' });
    expect(router.state.location.pathname).toBe('/sign-in');
  });

  it('a call that answers AUTH-001 ends the session and returns to sign-in', async () => {
    const { router, queryClient } = renderAt('/');
    await signIn('482913');
    await screen.findByText(/^Signed in as /);
    // The server forgets the session (expired or revoked elsewhere); the next call says AUTH-001.
    resetState();
    await queryClient
      .query({ queryKey: ['probe'], queryFn: () => unwrap(api.GET('/v1/auth/session')) })
      .catch(() => undefined);
    await screen.findByRole('heading', { name: 'Start your shift' });
    expect(router.state.location.pathname).toBe('/sign-in');
  });

  it('never follows `next` off-site', () => {
    expect(safeNext('/result/1')).toBe('/result/1');
    expect(safeNext('//evil.example')).toBe('/');
    expect(safeNext('https://evil.example')).toBe('/');
    expect(safeNext(undefined)).toBe('/');
  });
});
