import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          const acceptsHtml = req.headers.accept?.includes('text/html');
          const isEmailOrResetPage = req.url?.startsWith('/api/verify-email/') || req.url?.startsWith('/api/reset-password/');
          if (acceptsHtml && isEmailOrResetPage) return '/index.html';
        },
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
})
