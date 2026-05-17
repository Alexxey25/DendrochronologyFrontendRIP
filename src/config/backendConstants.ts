/** Хост бэкенда и MinIO (Zerotier этого ПК). При смене сети поменяй здесь или через Vite env. */
export const BACKEND_HOST = '192.168.194.69'
export const API_PORT = 8080
export const MINIO_PORT = 9090

export const apiOrigin = `http://${BACKEND_HOST}:${API_PORT}`
export const minioConstructionBaseUrl = `http://${BACKEND_HOST}:${MINIO_PORT}/constructions`
