import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { API_PORT } from './src/config/backendConstants'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /** Loopback по умолчанию: прокси с этой же машины к Go надёжнее, чем Zerotier IP. Иначе — `.env`: `VITE_PROXY_BACKEND_HOST=192.168...` */
  const proxyHost = env.VITE_PROXY_BACKEND_HOST || '127.0.0.1'
  const backendApiOrigin = `http://${proxyHost}:${API_PORT}`

  return {
    base: command === 'build' && process.env.TAURI_ENV_PLATFORM ? './' : '/',
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
