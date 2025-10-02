import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@mini-vc-wallet-1/server': path.resolve(__dirname, '../server/src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Nest Server
        changeOrigin: true,
      },
    },
  },
});
