/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ORIGIN?: string
  readonly VITE_MINIO_PUBLIC_ORIGIN?: string
  readonly VITE_DEV_BACKEND_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
