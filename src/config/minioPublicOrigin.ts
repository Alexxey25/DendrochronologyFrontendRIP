import {
  BACKEND_HOST,
  MINIO_CONSOLE_PORT,
  MINIO_PORT as MINIO_PORT_DEFAULT,
} from './backendHost'

/** Как в WEB/handler.go: minioBase + objectName */
export const MINIO_CONSTRUCTIONS_PATH = '/constructions'

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

function effectiveMinioApiPort(): number {
  const port = resolvedMinioPort()
  return port === MINIO_CONSOLE_PORT ? MINIO_PORT_DEFAULT : port
}

export function minioMediaOrigin(): string {
  const fromEnv = import.meta.env.VITE_MINIO_PUBLIC_ORIGIN?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const port = effectiveMinioApiPort()
  if (import.meta.env.DEV || import.meta.env.TAURI_ENV_PLATFORM) {
    return `http://localhost:${port}`
  }
  return `http://${BACKEND_HOST}:${port}`
}

export function minioConstructionBase(): string {
  return `${minioMediaOrigin()}${MINIO_CONSTRUCTIONS_PATH}`
}

export const minioConstructionBaseUrl = minioConstructionBase()

export type ConstructionMediumKind = 'image' | 'video'

function encodeObjectName(name: string): string {
  return name
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

/** Один и тот же URL для <img> и <video> — как productpage.html на бэкенде. */
export function minioObjectUrl(objectName: string): string {
  const name = objectName.trim().replace(/^\//, '')
  if (!name) return ''
  if (name.startsWith('http://') || name.startsWith('https://')) {
    return rewriteMinioUrlForPlayback(name)
  }
  if (name.startsWith('constructions/')) {
    return rewriteMinioUrlForPlayback(`${minioMediaOrigin()}/${name}`)
  }
  const base = minioConstructionBase().replace(/\/$/, '')
  return rewriteMinioUrlForPlayback(`${base}/${encodeObjectName(name)}`)
}

export function rewriteMinioUrlForPlayback(url: string): string {
  const apiPort = effectiveMinioApiPort()
  let out = url.trim()
  if (!out) return out

  const devHost = `http://localhost:${apiPort}`
  const loopbackHost = `http://127.0.0.1:${apiPort}`

  if (out.startsWith(MINIO_CONSTRUCTIONS_PATH)) {
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

/** @deprecated то же, что rewriteMinioUrlForPlayback */
export function rewriteMinioUrlForVideoPlayback(url: string): string {
  return rewriteMinioUrlForPlayback(url)
}

export function rewriteMinioUrlIfDev(url: string): string {
  return rewriteMinioUrlForPlayback(url)
}
