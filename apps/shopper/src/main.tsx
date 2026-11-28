import './styles.css';

import { startMonitoring } from '@skipa/analytics/monitoring';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { createQueryClient } from './api.ts';
import { createAppRouter } from './router.tsx';
import { SessionProvider } from './session.tsx';

// Read import.meta.env.* directly: Vite replaces those with constants, which is what removes the
// mock and service-worker code from builds where they don't apply.
startMonitoring({
  app: 'shopper',
  dsn: import.meta.env.VITE_SENTRY_DSN,
  apiUrl: import.meta.env.VITE_API_URL,
  release: import.meta.env.VITE_RELEASE,
  environment: import.meta.env.MODE,
});

async function boot(): Promise<void> {
  // Mocks only in development builds with VITE_USE_MOCKS=true; the import is compiled out otherwise.
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
    const { startBrowserMocks } = await import('@skipa/mocks/browser');
    await startBrowserMocks(import.meta.env);
  }
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    const { registerSW } = await import('virtual:pwa-register');
    // registerType "prompt": the new version waits and applies on next launch (brief §10).
    registerSW({ immediate: false });
  }
  const queryClient = createQueryClient();
  const router = createAppRouter(queryClient);
  const root = document.getElementById('root');
  if (root === null) return;
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <RouterProvider router={router} />
        </SessionProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void boot();
