import { z } from 'zod'
import { getSessionIdFromInvite } from './session-code'

const studyMeetingPrefix = 'OWLIO-SPACE-'
const studySpaceId = z.uuid()

export const isStandalonePeerCode = (value: string) => /^OWLIO-PEER-[A-Z0-9]{16}$/i.test(value)
export const isStudyMeetingCode = (value: string) => value.toUpperCase().startsWith(studyMeetingPrefix)
  && studySpaceId.safeParse(value.slice(studyMeetingPrefix.length).toLowerCase()).success
export const isMeetingCode = (value: string) => /^OWLIO-?(?:[A-Z0-9]{4}|[A-Z0-9]{8})$/i.test(value)
  || isStandalonePeerCode(value) || isStudyMeetingCode(value)
export const studyMeetingCode = (spaceId: string) => studyMeetingPrefix + spaceId.toUpperCase()

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
