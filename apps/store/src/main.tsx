import './styles.css';

import { startMonitoring } from '@skipa/analytics/monitoring';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { APP, createQueryClient } from './api.ts';
import { createAppRouter } from './router.tsx';

startMonitoring({
  app: APP,
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
  const queryClient = createQueryClient();
  const router = createAppRouter(queryClient);
  const root = document.getElementById('root');
  if (root === null) return;
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

void boot();
