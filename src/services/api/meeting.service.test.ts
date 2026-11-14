import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { postApiWithCsrf } from './auth.service'
import { createMeeting, endMeeting, getClassroomSessions, joinMeeting, scheduleClassroomSession, sendMeetingMessage, setMeetingHand } from './meeting.service'
vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('./auth.service', () => ({ postApiWithCsrf: vi.fn() }))
const id = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
const path = '/api/v1/sessions/' + id + '/native-meeting'
const session = { id, title: 'Class', startsAt: '2026-11-14T10:00:00Z', endsAt: '2026-11-14T11:00:00Z', mode: 'ONLINE', status: 'SCHEDULED', version: 0 }
beforeEach(() => vi.resetAllMocks())
describe('scheduled-session meeting contracts', () => {
  it('opens and ends a session room with strict empty bodies', async () => {
    vi.mocked(postApiWithCsrf).mockResolvedValueOnce({ id: other, status: 'OPEN' }).mockResolvedValueOnce({ id: other, status: 'ENDING' })
    expect(await createMeeting(id)).toEqual({ id: other, status: 'OPEN' })
    expect(postApiWithCsrf).toHaveBeenLastCalledWith(path, {})
    expect((await endMeeting(id)).status).toBe('ENDING')
    expect(postApiWithCsrf).toHaveBeenLastCalledWith(path + '/end', {})
  })
  it('uses the browser media URL and server participant ID without inventing host identity', async () => {
    const credentials = { meetingId: other, participantId: id, url: 'wss://media.example.test', token: 'test-grant', expiresIn: 60 }
    vi.mocked(postApiWithCsrf).mockResolvedValue(credentials)
    expect(await joinMeeting(id)).toEqual(credentials)
    expect(postApiWithCsrf).toHaveBeenCalledWith(path + '/join', {})
  })
  it('propagates disabled-provider and admission errors without fallback or replay', async () => {
    vi.mocked(postApiWithCsrf).mockRejectedValue(new Error('MEETINGS_DISABLED'))
    await expect(joinMeeting(id)).rejects.toThrow('MEETINGS_DISABLED')
    expect(postApiWithCsrf).toHaveBeenCalledOnce()
  })
  it('rejects legacy room codes before sending requests', async () => {
    await expect(createMeeting('OWLIO-old-room')).rejects.toThrow()
    expect(postApiWithCsrf).not.toHaveBeenCalled()
  })
  it('uses HTTP for idempotent chat and versioned hand changes', async () => {
    vi.mocked(postApiWithCsrf).mockResolvedValueOnce({ id, authorId: other, authorName: 'Test', body: 'Hello', createdAt: session.startsAt })
      .mockResolvedValueOnce({ id, handRaisedAt: session.startsAt, version: 3 })
    await sendMeetingMessage(id, other, 'Hello')
    expect(postApiWithCsrf).toHaveBeenLastCalledWith(path + '/messages', { requestId: other, body: 'Hello' })
    await setMeetingHand(id, true, 2)
    expect(postApiWithCsrf).toHaveBeenLastCalledWith(path + '/hand', { raised: true, expectedVersion: 2 })
  })
  it('follows the schedule time/id cursor and cancels reads', async () => {
    const cursor = { afterStartsAt: session.startsAt, afterId: id }
    vi.mocked(api.get).mockResolvedValueOnce({ data: { status: 'success', data: { items: [session], nextCursor: cursor } } })
      .mockResolvedValueOnce({ data: { status: 'success', data: { items: [], nextCursor: null } } })
    const signal = new AbortController().signal
    expect(await getClassroomSessions(id, session.startsAt, session.endsAt, signal)).toEqual([session])
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/classrooms/' + id + '/sessions', { params: { from: session.startsAt, to: session.endsAt, limit: 100, ...cursor }, signal })
  })
  it('does not invent a lesson association when scheduling', async () => {
    vi.mocked(postApiWithCsrf).mockResolvedValue(session)
    const input = { title: session.title, startsAt: session.startsAt, endsAt: session.endsAt, mode: 'ONLINE' as const, timeZone: 'Asia/Manila' }
    await scheduleClassroomSession(id, input)
    expect(postApiWithCsrf).toHaveBeenCalledWith('/api/v1/classrooms/' + id + '/sessions', { ...input, lessonId: null })
  })
})
