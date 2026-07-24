import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://127.0.0.1:8000',
      '/weather': 'http://127.0.0.1:8000',
      '/reports': 'http://127.0.0.1:8000',
      '/risk': 'http://127.0.0.1:8000',
      '/resources': 'http://127.0.0.1:8000',
      '/shelters': 'http://127.0.0.1:8000',
      '/hospitals': 'http://127.0.0.1:8000',
      '/evacuation': 'http://127.0.0.1:8000',
      '/simulate': 'http://127.0.0.1:8000',
      '/simulations': 'http://127.0.0.1:8000',
      '/recommendations': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
