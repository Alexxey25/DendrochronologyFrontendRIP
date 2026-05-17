/** Реэкспорт для модулей приложения; из vite.config импортируйте только `./backendHost`. */
export { apiOrigin, API_PORT, BACKEND_HOST, MINIO_PORT } from './backendHost'
export {
  MINIO_CONSTRUCTIONS_PATH,
  minioConstructionBase,
  minioConstructionBaseUrl,
  minioMediaOrigin,
  minioObjectUrl,
  rewriteMinioUrlForVideoPlayback,
  rewriteMinioUrlForPlayback,
  rewriteMinioUrlIfDev,
  type ConstructionMediumKind,
} from './minioPublicOrigin'
