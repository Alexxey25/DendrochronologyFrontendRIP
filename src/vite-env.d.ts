/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** Публичный URL MinIO для медиа, например http://192.168.x.x:9090 */
  readonly VITE_MINIO_PUBLIC_ORIGIN?: string
  /** Порт MinIO (например 9091), если не совпадает с константой в backendHost */
  readonly VITE_MINIO_PORT?: string
  readonly TAURI_ENV_PLATFORM?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
