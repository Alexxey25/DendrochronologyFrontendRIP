import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { GITHUB_PAGES_REPO_SLUG } from './src/config/githubPages'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const certKeyPath = path.resolve(__dirname, 'cert.key')
const certCrtPath = path.resolve(__dirname, 'cert.crt')
const httpsOpts =
  fs.existsSync(certKeyPath) && fs.existsSync(certCrtPath)
    ? {
        key: fs.readFileSync(certKeyPath),
        cert: fs.readFileSync(certCrtPath),
      }
    : undefined

// П. 1 PWA.md: base = /ИмяРепозитория/
export default defineConfig({
  base: `/${GITHUB_PAGES_REPO_SLUG}/`,
  server: {
    host: true,
    port: 3000,
    ...(httpsOpts ? { https: httpsOpts } : {}),
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    ...(httpsOpts ? { https: httpsOpts } : {}),
  },
  plugins: [
    react(),
    mkcert(),
  ],
})
