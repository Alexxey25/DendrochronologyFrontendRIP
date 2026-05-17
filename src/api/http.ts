import axios from 'axios'
import { resolveApiBaseUrl } from '../config/apiBaseUrl'

export const apiHttp = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

apiHttp.interceptors.request.use((config) => {
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
