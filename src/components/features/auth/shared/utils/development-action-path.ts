const allowedActionPaths = new Set(['/auth/email-verification', '/auth/password-reset'])

export function getDevelopmentActionPath(actionUrl?: string) {
  if (!import.meta.env.DEV || !actionUrl) return null

  try {
    const url = new URL(actionUrl, window.location.origin)
    if (url.origin !== window.location.origin || !allowedActionPaths.has(url.pathname)) return null
    return `${url.pathname}${url.search}`
  } catch {
    return null
  }
}
