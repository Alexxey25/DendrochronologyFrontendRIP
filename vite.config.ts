import { execSync } from 'node:child_process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { API_PORT } from './src/config/backendHost'

function wslIpSync(): string | null {
  if (process.platform !== 'win32') return null
  try {
    const out = execSync('wsl.exe hostname -I', { encoding: 'utf8', timeout: 5000 }).trim()
    return out.split(/\s+/).find(Boolean) ?? null
  } catch {
    return null
  }
}

function resolveProxyHostSync(env: Record<string, string>): string {
  const fromEnv = env.VITE_PROXY_BACKEND_HOST?.trim()
  if (fromEnv) return fromEnv
  return wslIpSync() ?? '127.0.0.1'
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyHost = resolveProxyHostSync(env)
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
          // secure: false, // для https-таргета; Tauri — только http:// бэкенд
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
          // secure: false,
        },
      },
    },
    plugins: [react()],
  }
})
