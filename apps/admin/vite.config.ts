import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { msw } from 'msw/vite';
import { defineConfig, loadEnv } from 'vite';

import { preloadInter } from '@skipa/tokens/vite';

// Skipa super admin (brief §4, §6.4). Desktop web, online only. Port 5176.
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
    server: { port: 5176, strictPort: true },
    preview: { port: 5176, strictPort: true },
    build: { target: 'es2022', sourcemap: true },
  };
});
