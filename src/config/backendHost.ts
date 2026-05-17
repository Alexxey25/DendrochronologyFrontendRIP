/** Хост бэкенда (Zerotier / прод). Без import.meta — файл импортируется из vite.config (Node). */
export const BACKEND_HOST = '192.168.194.69'
export const API_PORT = 8080
/**
 * Порт S3 API MinIO (отдача файлов в `<img>` / `<video>`).
 * 9091 — обычно только веб-консоль (`/buckets/.../browse/`), не подставлять в медиа-URL.
 * Переопределение: `VITE_MINIO_PORT` в `.env`.
 */
export const MINIO_PORT = 9090
/** Типичный порт MinIO Console (UI); для плеера не используется. */
export const MINIO_CONSOLE_PORT = 9091

export const apiOrigin = `http://${BACKEND_HOST}:${API_PORT}`
