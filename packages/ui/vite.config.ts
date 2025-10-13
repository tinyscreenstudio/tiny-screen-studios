import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './', // Use relative paths for GitHub Pages compatibility
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    sourcemap: true,
    target: 'es2022',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3001,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
});
