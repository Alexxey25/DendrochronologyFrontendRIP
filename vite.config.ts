import fs from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { API_PORT, MINIO_CONSOLE_PORT, MINIO_PORT } from './src/config/backendHost'

/** MinIO на Windows, Vite в WSL — localhost:9090 в WSL не тот хост. */
function resolveMinioProxyHost(env: Record<string, string>): string {
  const fromEnv = env.VITE_PROXY_MINIO_HOST?.trim()
  if (fromEnv) return fromEnv
  if (process.env.WSL_DISTRO_NAME) {
    try {
      const conf = fs.readFileSync('/etc/resolv.conf', 'utf8')
      const ns = conf.match(/^nameserver\s+(\S+)/m)?.[1]
      if (ns) return ns
    } catch {
      /* ignore */
    }
  }
  return 'localhost'
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /** Loopback по умолчанию: прокси с этой же машины к Go надёжнее, чем Zerotier IP. Иначе — `.env`: `VITE_PROXY_BACKEND_HOST=192.168...` */
  const proxyHost = env.VITE_PROXY_BACKEND_HOST || '127.0.0.1'
  /** API может смотреть на 192.168…, MinIO почти всегда на этой машине — не используем тот же host, что и для `/api`. */
  const minioProxyHost = resolveMinioProxyHost(env)
  /** S3 API MinIO (9090). `VITE_MINIO_PORT=9091` — это Console, для прокси подменяем на API. */
  const minioPort = (() => {
    const raw = env.VITE_MINIO_PORT
    if (raw != null && String(raw).trim() !== '') {
      const n = Number(raw)
      if (Number.isFinite(n) && n > 0 && n < 65536) {
        const p = Math.floor(n)
        return p === MINIO_CONSOLE_PORT ? MINIO_PORT : p
      }
    }
    return MINIO_PORT
  })()
  const backendApiOrigin = `http://${proxyHost}:${API_PORT}`
  const minioOrigin = `http://${minioProxyHost}:${minioPort}`

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
        '/minio': {
          target: minioOrigin,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/minio/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const range = req.headers.range
              if (range) {
                proxyReq.setHeader('Range', range)
              }
            })
          },
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
        '/minio': {
          target: minioOrigin,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/minio/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const range = req.headers.range
              if (range) {
                proxyReq.setHeader('Range', range)
              }
            })
          },
        },
      },
    },
    plugins: [react()],
  }
})
