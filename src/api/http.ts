import axios from 'axios'
import { resolveApiBaseUrl } from '../config/apiBaseUrl'

/** Axios при url, начинающемся с «/», подставляет путь к хосту и игнорирует `baseURL` — ломает `/api` в dev. */
export function joinUrlUnderBaseURL(config: { url?: string }) {
  const u = config.url
  if (u != null && u !== '' && !/^https?:\/\//i.test(u)) {
    config.url = u.replace(/^\//, '')
  }
}

export const apiHttp = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

apiHttp.interceptors.request.use((config) => {
  joinUrlUnderBaseURL(config)
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiHttp.interceptors.response.use((response) => {
  const data = response.data
  if (data && typeof data === 'object' && 'token' in data && data.token) {
    localStorage.setItem('token', String(data.token))
  }
  return response
})
