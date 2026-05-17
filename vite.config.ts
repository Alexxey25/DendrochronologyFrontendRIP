import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import { GITHUB_PAGES_REPO_SLUG } from './src/config/githubPages'
import { API_PORT, BACKEND_HOST } from './src/config/backendConstants'

const backendApiOrigin = `http://${BACKEND_HOST}:${API_PORT}`

const isProdBuild = process.env.NODE_ENV === 'production'
const base = !isProdBuild ? '/' : `/${GITHUB_PAGES_REPO_SLUG}/`

export default defineConfig({
  base,
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
  plugins: [react(), mkcert()],
})
