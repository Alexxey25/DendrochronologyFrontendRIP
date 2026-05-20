import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export function wslIp() {
  if (process.platform !== 'win32') return null
  try {
    const out = execSync('wsl.exe hostname -I', { encoding: 'utf8', timeout: 5000 }).trim()
    return out.split(/\s+/).find(Boolean) ?? null
  } catch {
    return null
  }
}

export function readBackendHostFromTs() {
  const src = readFileSync(join(root, 'src/config/backendHost.ts'), 'utf8')
  const m = src.match(/BACKEND_HOST\s*=\s*['"]([^'"]+)['"]/)
  return m?.[1] ?? '127.0.0.1'
}

/** Go отдаёт JSON; на :8080 Windows часто сидит ApplicationWebServer (HTML 404). */
export async function apiWorks(host) {
  const url = `http://${host}:8080/api/constructions`
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    })
    const body = await res.text()
    return res.ok && (body.startsWith('[') || body.startsWith('{'))
  } catch {
    return false
  }
}

export async function resolveWorkingBackendHost() {
  const candidates = [
    process.env.VITE_PROXY_BACKEND_HOST?.trim(),
    '127.0.0.1',
    wslIp(),
    readBackendHostFromTs(),
  ].filter(Boolean)

  const seen = new Set()
  for (const host of candidates) {
    if (seen.has(host)) continue
    seen.add(host)
    if (await apiWorks(host)) {
      console.log(`[backend] API OK → http://${host}:8080`)
      return host
    }
  }

  const fallback = wslIp() ?? readBackendHostFromTs()
  console.warn(
    `[backend] API не отвечает JSON на :8080; fallback http://${fallback}:8080 (запустите go run в WSL + docker)`,
  )
  return fallback
}
