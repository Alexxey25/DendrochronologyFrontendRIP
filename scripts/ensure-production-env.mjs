import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveWorkingBackendHost } from './resolve-backend-host.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const host = await resolveWorkingBackendHost()
const content = [
  '# Сгенерировано scripts/ensure-production-env.mjs — не коммитить',
  `VITE_API_BASE_URL=http://${host}:8080/api`,
  `VITE_MINIO_PUBLIC_ORIGIN=http://${host}:9090`,
  '',
].join('\n')

writeFileSync(join(root, '.env.production.local'), content, 'utf8')
console.log(`[backend] .env.production.local → ${host}`)

const tauriConfPath = join(root, 'src-tauri/tauri.conf.json')
const conf = JSON.parse(readFileSync(tauriConfPath, 'utf8'))
const origins = [
  `http://${host}:8080`,
  `http://${host}:9090`,
  `http://${host}:9091`,
]
let csp = conf.app.security.csp
if (!csp.includes(origins[0])) {
  for (const directive of ['connect-src', 'img-src', 'media-src']) {
    const needle = `${directive} `
    csp = csp.replace(needle, `${needle}${origins.join(' ')} `)
  }
  conf.app.security.csp = csp
  writeFileSync(tauriConfPath, `${JSON.stringify(conf, null, 2)}\n`, 'utf8')
  console.log(`[backend] tauri.conf.json CSP + ${host}`)
}
