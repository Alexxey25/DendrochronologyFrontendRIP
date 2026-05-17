import {
  BACKEND_HOST,
  MINIO_CONSOLE_PORT,
  MINIO_PORT as MINIO_PORT_DEFAULT,
} from './backendHost'

const CONSTRUCTIONS_PATH = '/constructions'

function resolvedMinioPort(): number {
  const raw = import.meta.env.VITE_MINIO_PORT
  if (raw != null && String(raw).trim() !== '') {
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0 && n < 65536) {
      return Math.floor(n)
    }
  }
  return MINIO_PORT_DEFAULT
}

function minioMediaOrigin(): string {
  const fromEnv = import.meta.env.VITE_MINIO_PUBLIC_ORIGIN?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const port =
    resolvedMinioPort() === MINIO_CONSOLE_PORT
      ? MINIO_PORT_DEFAULT
      : resolvedMinioPort()
  if (import.meta.env.DEV || import.meta.env.TAURI_ENV_PLATFORM) {
    return `http://localhost:${port}`
  }
  return `http://${BACKEND_HOST}:${port}`
}

function rewriteMinioUrl(url: string): string {
  const apiPort =
    resolvedMinioPort() === MINIO_CONSOLE_PORT
      ? MINIO_PORT_DEFAULT
      : resolvedMinioPort()
  let out = url.trim()
  if (!out) return out

  const devHost = `http://localhost:${apiPort}`
  const loopbackHost = `http://127.0.0.1:${apiPort}`

  if (out.startsWith(CONSTRUCTIONS_PATH)) {
    out = `${devHost}${out}`
  }

  for (const consolePort of [MINIO_CONSOLE_PORT]) {
    for (const host of ['127.0.0.1', 'localhost', BACKEND_HOST] as const) {
      const prefix = `http://${host}:${consolePort}`
      if (out.startsWith(prefix)) {
        out = `${devHost}${out.slice(prefix.length)}`
      }
    }
  }

  if (import.meta.env.DEV && !import.meta.env.VITE_MINIO_PUBLIC_ORIGIN) {
    const remote = `http://${BACKEND_HOST}:${apiPort}`
    for (const prefix of [remote, loopbackHost]) {
      if (out.startsWith(prefix)) {
        out = devHost + out.slice(prefix.length)
      }
    }
  }

  return out
}

/** URL медиа в MinIO — как `minioBase` + objectName в metoda/WEB. */
export function minioObjectUrl(objectName: string): string {
  const name = objectName.trim().replace(/^\//, '')
  if (!name) return ''
  if (name.startsWith('http://') || name.startsWith('https://')) {
    return rewriteMinioUrl(name)
  }
  if (name.startsWith('constructions/')) {
    return rewriteMinioUrl(`${minioMediaOrigin()}/${name}`)
  }
  const base = `${minioMediaOrigin()}${CONSTRUCTIONS_PATH}`
  const encoded = name
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return rewriteMinioUrl(`${base}/${encoded}`)
}
