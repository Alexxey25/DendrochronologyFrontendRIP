import { Api } from './Api'
import { resolveApiBaseUrl } from '../config/apiBaseUrl'
import { joinUrlUnderBaseURL } from './http'

export const api = new Api({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
})

api.instance.interceptors.request.use((config) => {
  joinUrlUnderBaseURL(config)
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.instance.interceptors.response.use((response) => {
  const data = response.data
  if (data && typeof data === 'object' && 'token' in data && data.token) {
    localStorage.setItem('token', String(data.token))
  }
  return response
})
