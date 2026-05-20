import { Api } from './Api'
import { resolveBaseURL } from '../modules/apiUrl'
import { shouldUseMockOnly } from '../config/pagesRuntime'

export const api = new Api({
  baseURL: '/api',
  withCredentials: true,
})

api.instance.interceptors.request.use((config) => {
  if (shouldUseMockOnly()) {
    return Promise.reject(new Error('mock-only'))
  }
  config.baseURL = resolveBaseURL()
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.instance.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data && typeof data === 'object' && 'token' in data && data.token) {
      localStorage.setItem('token', String(data.token))
    }
    return response
  },
  (error) => Promise.reject(error)
)
