import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Component gallery (brief §8, §18 `pnpm gallery`): every component and state in three brand modes.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  server: { port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
  build: { outDir: '../dist/gallery', emptyOutDir: true },
});
