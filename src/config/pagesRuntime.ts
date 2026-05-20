import { ZEROTIER_PHONE_HOST } from './backendHost'

function isMobileUserAgent(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export function shouldUseMockOnly(): boolean {
  if (typeof window === 'undefined') return false
  if (window.location.hostname === ZEROTIER_PHONE_HOST) return true
  return isMobileUserAgent()
}
