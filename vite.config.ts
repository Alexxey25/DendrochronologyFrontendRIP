import { execSync } from 'node:child_process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { API_PORT } from './src/config/backendHost'

function resolveProxyHost(env: Record<string, string>): string {
  const fromEnv = env.VITE_PROXY_BACKEND_HOST?.trim()
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

  return '127.0.0.1'
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyHost = resolveProxyHost(env)
  const backendApiOrigin = `http://${proxyHost}:${API_PORT}`

  return {
    base: command === 'build' ? './' : '/',
    envPrefix: ['VITE_', 'TAURI_'],
    clearScreen: false,
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
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
    preview: {
      host: true,
      port: 4173,
      proxy: {
        '/api': {
          target: backendApiOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
  }
})
