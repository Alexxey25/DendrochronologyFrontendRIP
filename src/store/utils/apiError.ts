import axios from 'axios'

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      if ('description' in data) return String(data.description)
      if ('message' in data) return String(data.message)
      if ('error' in data) return String(data.error)
    }
    if (error.response?.status) return `Ошибка запроса: ${error.response.status}`
  }

  return 'Ошибка запроса'
}
