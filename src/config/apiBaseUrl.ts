import { apiOrigin } from './backendConstants'

/**
 * Базовый URL API для axios.
 * - dev (браузер и `tauri dev`): всегда `/api` → тот же origin, что и Vite (:3000), запросы уходит на прокси — CORS к бэкенду не нужен.
 * - production + Tauri: прямой `apiOrigin`, прокси нет.
 */
export function resolveApiBaseUrl(): string {
  // dev / tauri dev: Vite-прокси /api (иначе .env.production.local уводит на мёртвый :8080 Windows)
  if (import.meta.env.DEV) {
    return '/api'
  }
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  if (fromEnv) return fromEnv
  return `${apiOrigin}/api`
}
