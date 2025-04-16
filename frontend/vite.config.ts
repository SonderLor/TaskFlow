import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        { from: /^\/tasks\/.*$/, to: '/index.html' },
        { from: /./, to: '/index.html' }
      ]
    }
  }
});
