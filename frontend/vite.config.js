import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, o Vite repassa /api e /uploads para o back-end (porta 3001).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
