import { beforeEach, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { mutateApiWithCsrf, postApiWithCsrf } from './auth.service'
import { getClassroomMessageReaders, getClassroomUnread, getClassroomVoiceMessage, markClassroomRead, reactToClassroomMessage, sendClassroomMessage, sendClassroomVoiceMessage } from './classroom-chat.service'
vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('./auth.service', () => ({ mutateApiWithCsrf: vi.fn(), postApiWithCsrf: vi.fn() }))
const id = '902df2ea-e551-43c0-b879-956366138d93'
beforeEach(() => vi.resetAllMocks())
it('validates unread summaries and propagates cancellation', async () => {
  const summary = { total: 100, unreadCount: 51, mentionCount: 2, firstUnread: { id, createdAt: '2030-01-01T10:00:00Z' } }
  vi.mocked(api.get).mockResolvedValue({ data: { data: summary } })
  const signal = new AbortController().signal
  expect(await getClassroomUnread('class/id', signal)).toEqual(summary)
  expect(api.get).toHaveBeenCalledWith('/api/v1/classrooms/class%2Fid/messages/unread', { signal })
  vi.mocked(api.get).mockResolvedValue({ data: { data: { ...summary, unreadCount: -1 } } })
  await expect(getClassroomUnread('class')).rejects.toThrow()
})
it('uses the CSRF helper for read acknowledgments and structured mentions', async () => {
  vi.mocked(postApiWithCsrf).mockResolvedValueOnce({ messageId: id }).mockResolvedValueOnce({ id, authorId: id, authorName: 'Teacher', authorRole: 'educator', body: '@students Hello', createdAt: '2030-01-01', replyTo: null, mentionUserIds: [id], mentionStudents: true })
  await markClassroomRead('class', id)
  expect(postApiWithCsrf).toHaveBeenLastCalledWith('/api/v1/classrooms/class/messages/read', { messageId: id })
  await sendClassroomMessage('class', id, '@students Hello', null, { mentionUserIds: [id], mentionStudents: true })
  expect(postApiWithCsrf).toHaveBeenLastCalledWith('/api/v1/classrooms/class/messages', { requestId: id, body: '@students Hello', replyToId: null, mentionUserIds: [id], mentionStudents: true })
})

it('validates scoped reader pages and passes the cursor and cancellation signal', async () => {
  const signal = new AbortController().signal
  vi.mocked(api.get).mockResolvedValue({ data: { status: 'success', data: { items: [{ id, name: 'Reader', email: 'private@example.test' }], nextCursor: null } } })
  expect(await getClassroomMessageReaders('class/id', id, id, signal)).toEqual({ items: [{ id, name: 'Reader' }], nextCursor: null })
  expect(api.get).toHaveBeenCalledWith(`/api/v1/classrooms/class%2Fid/messages/${id}/readers`, { params: { limit: 50, cursor: id }, signal })
  vi.mocked(api.get).mockResolvedValue({ data: { status: 'success', data: { items: [{ id: 'invalid', name: 'Reader' }], nextCursor: null } } })
  await expect(getClassroomMessageReaders('class', id)).rejects.toThrow()
})

it('sets the desired reaction on the scoped message and validates the server counts', async () => {
  const reactions = { '👍': { count: 2, mine: true } }
  vi.mocked(postApiWithCsrf).mockResolvedValue({ reactions })
  await expect(reactToClassroomMessage('class/id', id, '👍', true)).resolves.toEqual(reactions)
  expect(postApiWithCsrf).toHaveBeenCalledWith(`/api/v1/classrooms/class%2Fid/messages/${id}/reactions`, { emoji: '👍', active: true })
  vi.mocked(postApiWithCsrf).mockResolvedValue({ reactions: { '👍': { count: -1, mine: true } } })
  await expect(reactToClassroomMessage('class', id, '👍', true)).rejects.toThrow()
})

it('sends raw voice clips with CSRF and only accepts bounded audio playback responses', async () => {
  const voice = new Blob(['voice fixture'], { type: 'audio/webm' })
  const saved = { id, authorId: id, authorName: 'Teacher', authorRole: 'educator', body: 'Voice message', createdAt: '2030-01-01', replyTo: null, voiceType: 'audio/webm' }
  vi.mocked(mutateApiWithCsrf).mockResolvedValue(saved)
  await expect(sendClassroomVoiceMessage('class', id, voice, id)).resolves.toEqual(saved)
  expect(mutateApiWithCsrf).toHaveBeenCalledWith('POST', `/api/v1/classrooms/class/messages/voice?requestId=${id}&replyToId=${id}`, voice, 'audio/webm')
  const signal = new AbortController().signal
  vi.mocked(api.get).mockResolvedValueOnce({ data: voice }).mockResolvedValueOnce({ data: new Blob(['error'], { type: 'text/html' }) })
  await expect(getClassroomVoiceMessage('class/id', id, signal)).resolves.toBe(voice)
  expect(api.get).toHaveBeenCalledWith(`/api/v1/classrooms/class%2Fid/messages/${id}/voice`, { responseType: 'blob', signal })
  await expect(getClassroomVoiceMessage('class', id, signal)).rejects.toThrow('Invalid voice message response.')
})
