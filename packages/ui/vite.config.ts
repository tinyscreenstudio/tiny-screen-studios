import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/', // Use absolute paths for custom domain
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
    copyPublicDir: true,
  },
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  preview: {
    port: 3001,
    open: true,
    historyApiFallback: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  assetsInclude: ['**/*.md'],
});
