import { describe, expect, it } from 'vitest'
import { formatSessionCode, getSessionIdFromInvite } from './session-code'
const id = '11111111-1111-4111-8111-111111111111'
describe('session invites', () => {
  it('accepts a scheduled-session code or explicit session URL', () => {
    expect(getSessionIdFromInvite(formatSessionCode(id))).toBe(id)
    expect(getSessionIdFromInvite('/students/classrooms/meeting-room?session=' + id)).toBe(id)
  })
  it('does not reinterpret a legacy room identifier as a scheduled session', () => {
    expect(getSessionIdFromInvite('OWLIO-' + id)).toBe('')
    expect(getSessionIdFromInvite('/students/classrooms/meeting-room?room=' + id)).toBe('')
    expect(getSessionIdFromInvite('not-an-id')).toBe('')
  })
})
