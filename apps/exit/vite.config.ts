import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { msw } from 'msw/vite';
import { defineConfig, loadEnv } from 'vite';

import { preloadInter } from '@skipa/tokens/vite';

// Exit mode (brief §4, §6.2). Online only (D-16): no service worker, no offline queue. Port 5174.
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_');
  const mocks = command === 'serve' && env.VITE_USE_MOCKS === 'true';
  return {
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      preloadInter(),
      ...(mocks ? [msw({ mode: 'worker-only' })] : []),
    ],
    server: { port: 5174, strictPort: true },
    preview: { port: 5174, strictPort: true },
    build: { target: 'es2022', sourcemap: true },
  };
});
