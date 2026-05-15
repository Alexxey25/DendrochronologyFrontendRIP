export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export function parseIsModeratorFromToken(token: string): boolean {
  const payload = parseJwtPayload(token)
  if (!payload) return false
  return Boolean(payload.is_moderator ?? payload.isModerator ?? payload.moderator)
}

export function parseLoginFromToken(token: string): string {
  const payload = parseJwtPayload(token)
  if (!payload) return ''
  const value = payload.login ?? payload.username ?? payload.sub
  return typeof value === 'string' ? value : ''
}
