import { getSessionIdFromInvite } from './session-code'

export function parseMeetingInvite(value: string): { code: string } | { sessionId: string } | null {
  let code = value.trim()
  if (code.includes('://') || code.startsWith('/') || code.includes('?')) {
    try {
      const params = new URL(code, 'http://owlio.invalid').searchParams
      code = params.get('room') || params.get('code') || code
    } catch { return null }
  }
  if (/^OWLIO-?(?:[A-Z0-9]{4}|[A-Z0-9]{8})$/i.test(code)) return { code: code.toUpperCase() }
  const sessionId = getSessionIdFromInvite(value)
  return sessionId ? { sessionId } : null
}
