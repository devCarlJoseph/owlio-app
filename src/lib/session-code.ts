const prefix = 'OWLIO-SESSION-'
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function formatSessionCode(sessionId: string) { return prefix + sessionId }
export function getSessionIdFromInvite(value: string) {
  let code = value.trim()
  if (code.includes('://') || code.startsWith('/') || code.includes('?')) {
    try { code = new URL(code, window.location.origin).searchParams.get('session') ?? '' }
    catch { return '' }
  }
  const sessionId = code.replace(/^OWLIO-SESSION-/i, '')
  return uuid.test(sessionId) ? sessionId : ''
}
