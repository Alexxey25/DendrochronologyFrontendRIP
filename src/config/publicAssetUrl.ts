/** Статика из /public — всегда от корня origin (не от текущего /construction/:id). */
export function publicAssetUrl(pathFromPublic: string): string {
  const rel = pathFromPublic.replace(/^\//, '')
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/${rel}`
  }
  const base = import.meta.env.BASE_URL ?? '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${rel}`.replace(/\/{2,}/g, '/')
}
