import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@flagship/js-provider': path.resolve(__dirname, '../../src'),
    },
  },
  optimizeDeps: {
    exclude: ['@flagship/js-provider'],
  },
  build: {
    rollupOptions: {
      external: ['fs', 'fs/promises', 'path', 'http', 'https', 'url'],
      output: {
        manualChunks: undefined,
      },
    },
  },
  ssr: {
    noExternal: [],
    external: ['fs', 'fs/promises', 'path', 'http', 'https', 'url'],
  },
  server: {
    watch: {
      ignored: ['!**/node_modules/@flagship/js-provider/**'],
    },
  },
});

