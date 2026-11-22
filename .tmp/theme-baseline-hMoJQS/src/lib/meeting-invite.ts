import { getSessionIdFromInvite } from './session-code'

export const isStandalonePeerCode = (value: string) => /^OWLIO-PEER-[A-Z0-9]{16}$/i.test(value)
export const isStudyMeetingCode = (value: string) => /^OWLIO-SPACE-[0-9A-F]{8}(?:-[0-9A-F]{4}){3}-[0-9A-F]{12}$/i.test(value)
export const isMeetingCode = (value: string) => /^OWLIO-?(?:[A-Z0-9]{4}|[A-Z0-9]{8})$/i.test(value)
  || isStandalonePeerCode(value) || isStudyMeetingCode(value)
export const studyMeetingCode = (spaceId: string) => 'OWLIO-SPACE-' + spaceId.toUpperCase()

export function parseMeetingInvite(value: string): { code: string } | { sessionId: string } | null {
  let code = value.trim()
  if (code.includes('://') || code.startsWith('/') || code.includes('?')) {
    try {
      const params = new URL(code, 'http://owlio.invalid').searchParams
      code = params.get('room') || params.get('code') || code
    } catch { return null }
  }
  if (isMeetingCode(code)) return { code: code.toUpperCase() }
  const sessionId = getSessionIdFromInvite(value)
  return sessionId ? { sessionId } : null
}
