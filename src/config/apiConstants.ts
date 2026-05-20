import { API_PORT, BACKEND_HOST, MINIO_PORT } from './backendHost'

const publicHost =
  import.meta.env.VITE_BACKEND_HOST?.trim() || BACKEND_HOST

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (import.meta.env.DEV ? '/api' : `http://${publicHost}:${API_PORT}/api`)

export const MINIO_PUBLIC_ORIGIN =
  import.meta.env.VITE_MINIO_PUBLIC_ORIGIN?.trim().replace(/\/$/, '') ||
  `http://${publicHost}:${MINIO_PORT}`

export const minioConstructionBaseUrl = import.meta.env.DEV
  ? '/constructions'
  : `${MINIO_PUBLIC_ORIGIN}/constructions`
