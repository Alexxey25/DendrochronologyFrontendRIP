import { apiOrigin } from './backendConstants'

/** Базовый URL API для axios (браузер: /api и Vite proxy; Tauri: прямой origin бэкенда). */
export function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (fromEnv != null && fromEnv !== '') return fromEnv
  if (import.meta.env.TAURI_ENV_PLATFORM) {
    return `${apiOrigin}/api`
  }
  return '/api'
}
