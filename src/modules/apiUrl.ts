declare global {
  interface Window {
    __RUNTIME_API_ORIGIN__?: string
    __RUNTIME_MINIO_BASE__?: string
  }
}

function trimOrigin(value: string): string {
  return value.replace(/\/$/, '')
}

export function runtimeApiOrigin(): string {
  if (typeof window !== 'undefined' && window.__RUNTIME_API_ORIGIN__) {
    return trimOrigin(String(window.__RUNTIME_API_ORIGIN__))
  }
  return trimOrigin((import.meta.env.VITE_API_ORIGIN as string | undefined) ?? '')
}

export function runtimeMinioBase(): string {
  if (typeof window !== 'undefined' && window.__RUNTIME_MINIO_BASE__) {
    return trimOrigin(String(window.__RUNTIME_MINIO_BASE__))
  }
  return trimOrigin((import.meta.env.VITE_MINIO_PUBLIC_ORIGIN as string | undefined) ?? '')
}

/** Как org-structure: origin + /api, без проверок mixed content в коде. */
export function resolveBaseURL(): string {
  const apiOrigin = runtimeApiOrigin()
  return apiOrigin ? `${apiOrigin}/api` : '/api'
}

export function resolveMinioConstructionBase(): string {
  const base = runtimeMinioBase()
  if (base) return `${base}/constructions`
  if (import.meta.env.DEV) {
    return (
      trimOrigin(
        (import.meta.env.VITE_MINIO_PUBLIC_ORIGIN as string | undefined) ??
          'http://127.0.0.1:9090'
      ) + '/constructions'
    )
  }
  return '/constructions'
}
