import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { API_PORT, BACKEND_HOST } from './src/config/backendConstants'

const backendApiOrigin = `http://${BACKEND_HOST}:${API_PORT}`

export default defineConfig({
  base: '/',
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: backendApiOrigin,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
  plugins: [react()],
})
