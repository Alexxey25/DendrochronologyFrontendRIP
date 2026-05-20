import { apiOrigin } from './backendConstants'

/**
 * Базовый URL API для axios.
 * - dev (браузер и `tauri dev`): всегда `/api` → тот же origin, что и Vite (:3000), запросы уходит на прокси — CORS к бэкенду не нужен.
 * - production + Tauri: прямой `apiOrigin`, прокси нет.
 */
export function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) {
    return '/api'
  }
  return `${apiOrigin}/api`
}
