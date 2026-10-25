import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base by default so assets load correctly on GitHub Pages (e.g. /<repo-name>/)
  // or custom domain without breaking root paths
  base: process.env.VITE_BASE_PATH || './',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
