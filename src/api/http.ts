import axios from 'axios'

export const apiHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
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
