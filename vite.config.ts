import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import { GITHUB_PAGES_REPO_SLUG } from './src/config/githubPages'
import {
  API_PORT,
  LOCAL_BACKEND_HOST,
  MINIO_PORT,
  ZEROTIER_HOST,
} from './src/config/backendHost'

function resolveDevBackendHost(): string {
  const fromEnv = process.env.VITE_DEV_BACKEND_HOST?.trim()
  if (fromEnv) return fromEnv

  if (process.platform === 'win32') {
    try {
      const out = execSync('wsl.exe hostname -I', { encoding: 'utf8', timeout: 5000 }).trim()
      const ip = out.split(/\s+/).find(Boolean)
      if (ip) return ip
    } catch {
      /* wsl unavailable */
    }
  }

  return LOCAL_BACKEND_HOST
}

const devBackendHost = resolveDevBackendHost()
const backendApiOrigin = `http://${devBackendHost}:${API_PORT}`
const minioOrigin = `http://${devBackendHost}:${MINIO_PORT}`

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
      '/constructions': {
        target: minioOrigin,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
  plugins: [
    react(),
    mkcert({
      hosts: ['localhost', '127.0.0.1', ZEROTIER_HOST],
    }),
  ],
})
