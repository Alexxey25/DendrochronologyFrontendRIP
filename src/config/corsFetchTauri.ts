/** Проксируем через Tauri HTTP только LAN/localhost API; HF/CDN — нативный fetch (CSP). */
const TAURI_CORS_FETCH_INCLUDE = [
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i,
  /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?(\/|$)/i,
  /^https?:\/\/172\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?(\/|$)/i,
]

type CorsFetchWindow = Window & {
  CORSFetch?: {
    config: (options: { include?: RegExp[] }) => void
  }
}

export function configureTauriCorsFetch(): void {
  if (!import.meta.env.TAURI_ENV_PLATFORM) return

  const corsFetch = (window as CorsFetchWindow).CORSFetch
  corsFetch?.config({ include: TAURI_CORS_FETCH_INCLUDE })
}
