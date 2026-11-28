import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { msw } from 'msw/vite';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { color } from '@skipa/tokens';
import { preloadInter } from '@skipa/tokens/vite';

// Shopper PWA (brief §4, §10). Port 5173 (brief §18).
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_');
  const mocks = command === 'serve' && env.VITE_USE_MOCKS === 'true';
  return {
    plugins: [
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      preloadInter(),
      // Dev with mocks: serve MSW's worker script (never in a build).
      ...(mocks ? [msw({ mode: 'worker-only' })] : []),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'prompt',
        injectRegister: false,
        // D-15, SH-04: the installed app is "Skipa", with Skipa's icon, opening Skipa home.
        manifest: {
          name: 'Skipa',
          short_name: 'Skipa',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          theme_color: color['skipa-primary'],
          background_color: color['bg-page'],
          lang: 'en-NG',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
          globIgnores: ['open-in-chrome.html'],
        },
      }),
    ],
    server: { port: 5173, strictPort: true },
    preview: { port: 5173, strictPort: true },
    build: { target: 'es2022', sourcemap: true },
  };
});
