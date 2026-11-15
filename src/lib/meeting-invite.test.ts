import { describe, expect, it } from 'vitest'
import { parseMeetingInvite } from './meeting-invite'

describe('meeting invite inputs', () => {
  it.each([' owlio-abcd1234 ', 'https://owlio.test/students/classrooms/meeting-room?room=OWLIO-ABCD1234', '/students/classrooms/meeting-room?session=ignored&code=OWLIO-ABCD1234'])(
    'accepts classroom codes and copied links: %s', value => expect(parseMeetingInvite(value)).toEqual({ code: 'OWLIO-ABCD1234' }))
  it('keeps legacy short and scheduled-session invitations working', () => {
    expect(parseMeetingInvite('owlioa7k2')).toEqual({ code: 'OWLIOA7K2' })
    const sessionId = '11111111-1111-4111-8111-111111111111'
    expect(parseMeetingInvite('OWLIO-SESSION-' + sessionId)).toEqual({ sessionId })
    expect(parseMeetingInvite('/students/classrooms/meeting-room?session=' + sessionId)).toEqual({ sessionId })
    expect(parseMeetingInvite('invalid')).toBeNull()
  })
})
