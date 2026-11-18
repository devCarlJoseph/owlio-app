import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getClassrooms, getClassroomMembers } from '@/services/api/classroom.service'
import { getClassroomMessages, getClassroomMessageReaders, getClassroomUnread, getClassroomVoiceMessage, markClassroomRead, reactToClassroomMessage, sendClassroomMessage, sendClassroomVoiceMessage } from '@/services/api/classroom-chat.service'
import { ClassroomDetailView } from '../view/classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, student, teacher } from './classroom-test-data'
import { ChatComposer } from '../forms/chat-composer'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), getClassroomMembers: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
vi.mock('@/services/api/classroom-chat.service', () => ({
  classroomVoiceLimit: 512 * 1024,
  getClassroomMessages: vi.fn(), getClassroomMessageReaders: vi.fn(), getClassroomUnread: vi.fn(), getClassroomVoiceMessage: vi.fn(),
  markClassroomRead: vi.fn(), reactToClassroomMessage: vi.fn(), sendClassroomMessage: vi.fn(), sendClassroomVoiceMessage: vi.fn(),
}))
const saved = { id: 'message-id', authorId: student.id, authorName: student.name, authorRole: 'student' as const,
  body: 'Hello class', createdAt: '2030-01-01T10:00:00Z', replyTo: null }
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getClassrooms).mockResolvedValue([classroom])
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [], next: null })
  vi.mocked(getClassroomUnread).mockResolvedValue({ total: 0, unreadCount: 0, mentionCount: 0, firstUnread: null })
  vi.mocked(markClassroomRead).mockResolvedValue({ messageId: saved.id })
  vi.mocked(getClassroomMembers).mockResolvedValue({ items: [{ id: 'owner', name: 'Class Teacher', role: 'owner' }, { id: student.id, name: student.name, role: 'student' }], nextCursor: null })
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
function mount() {
  return render(<TestSession path="/students/classrooms/class-id?tab=chat"><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
}

it('reflects confirmed emoji reaction counts and removes the current user’s reaction', async () => {
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [saved], canWrite: true, next: null })
  vi.mocked(reactToClassroomMessage).mockResolvedValueOnce({ '👍': { count: 2, mine: true } }).mockResolvedValueOnce({ '👍': { count: 1, mine: false } })
  mount()
  await userEvent.click(await screen.findByRole('button', { name: 'Add reaction' }))
  await userEvent.click(screen.getByRole('button', { name: 'Thumbs up reaction' }))
  const selected = await screen.findByRole('button', { name: 'Thumbs up reaction, 2' })
  expect(selected.getAttribute('aria-pressed')).toBe('true')
  expect(reactToClassroomMessage).toHaveBeenNthCalledWith(1, classroom.id, saved.id, '👍', true)
  await userEvent.click(selected)
  expect((await screen.findByRole('button', { name: 'Thumbs up reaction, 1' })).getAttribute('aria-pressed')).toBe('false')
  expect(reactToClassroomMessage).toHaveBeenNthCalledWith(2, classroom.id, saved.id, '👍', false)
})

it('previews a recording, releases its mic, retries with the same request, and plays the saved audio', async () => {
  const audio = new Blob(['synthetic voice'], { type: 'audio/webm' })
  const stopTrack = vi.fn()
  const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] })
  vi.stubGlobal('navigator', new Proxy(navigator, {
    get: (target, key) => key === 'mediaDevices' ? { getUserMedia } : Reflect.get(target, key, target),
  }))
  class Recorder {
    static isTypeSupported(type: string) { return type.startsWith('audio/webm') }
    state = 'inactive'
    ondataavailable?: ((event: { data: Blob }) => void) | null
    onstop?: (() => void) | null
    start() { this.state = 'recording' }
    stop() {
      this.state = 'inactive'
      this.ondataavailable?.({ data: audio })
      this.onstop?.()
    }
  }
  vi.stubGlobal('MediaRecorder', Recorder)
  const revoke = vi.fn()
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = vi.fn().mockReturnValue('blob:voice-test')
    static revokeObjectURL = revoke
  })
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [saved], canWrite: true, next: null })
  vi.mocked(sendClassroomVoiceMessage)
    .mockRejectedValueOnce(new Error('Could not confirm voice message'))
    .mockResolvedValueOnce({ ...saved, id: 'voice-message', body: 'Voice message', voiceType: 'audio/webm' })
  vi.mocked(getClassroomVoiceMessage).mockResolvedValue(audio)
  mount()
  await userEvent.click(await screen.findByRole('button', { name: 'Record voice message' }))
  expect(getUserMedia).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Start recording' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Stop recording' }))
  expect(stopTrack).toHaveBeenCalledOnce()
  expect(screen.getByLabelText('Preview voice message').getAttribute('src')).toBe('blob:voice-test')
  await userEvent.click(screen.getByRole('button', { name: 'Send voice message' }))
  expect(await screen.findByText('Could not confirm voice message')).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: 'Send voice message' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Play voice message' }))
  expect((await screen.findByLabelText('Voice message playback')).getAttribute('src')).toBe('blob:voice-test')
  expect(vi.mocked(sendClassroomVoiceMessage).mock.calls[1]).toEqual(vi.mocked(sendClassroomVoiceMessage).mock.calls[0])
  expect(getClassroomVoiceMessage).toHaveBeenCalledWith(classroom.id, 'voice-message', expect.any(AbortSignal))
  expect(revoke).toHaveBeenCalledWith('blob:voice-test')
})
it('loads the classroom conversation and sends only after the server confirms', async () => {
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [saved], next: null })
  vi.mocked(sendClassroomMessage).mockResolvedValue({ ...saved, id: 'new', body: 'A new message' })
  mount()
  expect(await screen.findByText('Hello class')).toBeTruthy()
  expect(getClassroomMessages).toHaveBeenCalledWith(classroom.id, undefined, expect.any(AbortSignal))
  const input = screen.getByRole('textbox', { name: 'Message this class' })
  await userEvent.type(input, 'A new message')
  await userEvent.click(screen.getByRole('button', { name: 'Send class chat message' }))
  expect(await screen.findByText('A new message')).toBeTruthy()
  expect(sendClassroomMessage).toHaveBeenCalledWith(classroom.id, expect.any(String), 'A new message', null)
  expect((input as HTMLTextAreaElement).value).toBe('')
  expect(screen.queryByText('Message sent to this classroom.')).toBeNull()
  expect(screen.getAllByText('Sent').at(-1)?.parentElement?.querySelector('time')).toBeTruthy()
})
it('keeps a failed draft and reuses its request ID when retried', async () => {
  vi.mocked(sendClassroomMessage).mockRejectedValueOnce(new Error('Message not confirmed')).mockResolvedValue(saved)
  mount()
  const input = await screen.findByRole('textbox', { name: 'Message this class' })
  await waitFor(() => expect((input as HTMLTextAreaElement).disabled).toBe(false))
  fireEvent.change(input, { target: { value: 'Hello class' } })
  await userEvent.click(screen.getByRole('button', { name: 'Send class chat message' }))
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect((input as HTMLTextAreaElement).value).toBe('Hello class')
  await userEvent.click(screen.getByRole('button', { name: 'Send class chat message' }))
  await waitFor(() => expect(sendClassroomMessage).toHaveBeenCalledTimes(2))
  expect(vi.mocked(sendClassroomMessage).mock.calls[1]).toEqual(vi.mocked(sendClassroomMessage).mock.calls[0])
})
it('aborts reads when leaving the classroom', async () => {
  const view = mount()
  await waitFor(() => expect(getClassroomMessages).toHaveBeenCalled())
  const signal = vi.mocked(getClassroomMessages).mock.calls[0][2]!
  view.unmount()
  expect(signal.aborted).toBe(true)
})

it('clears loading and disables sending when current classroom access is denied', async () => {
  vi.mocked(getClassroomMessages).mockRejectedValue(Object.assign(new Error('Classroom unavailable'), { isAxiosError: true, response: { status: 404 } }))
  mount()
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(screen.queryByText('Loading classroom messages…')).toBeNull()
  expect((screen.getByRole('textbox', { name: 'Message this class' }) as HTMLTextAreaElement).disabled).toBe(true)
})

it('opens real chat members on demand and restores focus when details close', async () => {
  mount()
  const toggle = await screen.findByRole('button', { name: 'Conversation details' })
  expect(getClassroomMembers).not.toHaveBeenCalled()
  await userEvent.click(toggle)
  const close = screen.getByRole('button', { name: 'Close conversation details' })
  expect(document.activeElement).toBe(close)
  await userEvent.click(screen.getByRole('button', { name: 'Chat members' }))
  expect(await screen.findByText('Class Teacher')).toBeTruthy()
  expect(screen.getByText(student.name)).toBeTruthy()
  expect(getClassroomMembers).toHaveBeenCalledWith(classroom.id, undefined, expect.any(AbortSignal))
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(document.activeElement).toBe(toggle))
  expect(toggle.getAttribute('aria-expanded')).toBe('false')
})

it('keeps server-backed replies and preserves a draft while conversation details are shown', async () => {
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [saved], next: null })
  vi.mocked(sendClassroomMessage).mockResolvedValue({ ...saved, id: 'reply-id', body: 'A reply' })
  mount()
  await screen.findByText(saved.body)
  const input = screen.getByRole('textbox', { name: 'Message this class' })
  await userEvent.type(input, 'A reply')
  await userEvent.click(screen.getByRole('button', { name: 'Conversation details' }))
  await userEvent.click(screen.getByRole('button', { name: 'Close conversation details' }))
  expect((input as HTMLTextAreaElement).value).toBe('A reply')
  await userEvent.click(screen.getByRole('button', { name: 'Reply to ' + student.name }))
  await userEvent.click(screen.getByRole('button', { name: 'Send class chat message' }))
  await waitFor(() => expect(sendClassroomMessage).toHaveBeenCalledWith(classroom.id, expect.any(String), 'A reply', saved.id))
})

it('loads older pages to jump to the first unread message and saves read status', async () => {
  const older = { ...saved, id: 'older-message', authorId: 'owner', body: 'First unread', createdAt: '2029-12-31T10:00:00Z' }
  const cursor = { beforeId: saved.id, beforeCreatedAt: saved.createdAt }
  vi.mocked(getClassroomMessages).mockImplementation(async (_id, before) => before ? { items: [older], next: null } : { items: [saved], next: cursor })
  vi.mocked(getClassroomUnread).mockResolvedValue({ total: 52, unreadCount: 51, mentionCount: 1, firstUnread: { id: older.id, createdAt: older.createdAt } })
  mount()
  expect(await screen.findByText('52 messages')).toBeTruthy()
  expect(screen.getByText('51 unread · 1 mentions')).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: 'View all unread messages' }))
  expect(await screen.findByText('First unread')).toBeTruthy()
  await waitFor(() => expect(document.getElementById('chat-message-' + older.id)?.className).toContain('bg-brand-soft'))
  expect(getClassroomMessages).toHaveBeenCalledWith(classroom.id, cursor, expect.any(AbortSignal))
  expect(markClassroomRead).toHaveBeenCalledWith(classroom.id, older.id)
})

it('reports read failures without claiming messages were read', async () => {
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [saved], next: null })
  vi.mocked(getClassroomUnread).mockResolvedValue({ total: 1, unreadCount: 1, mentionCount: 0, firstUnread: { id: saved.id, createdAt: saved.createdAt } })
  vi.mocked(markClassroomRead).mockRejectedValue(new Error('Offline'))
  mount()
  await userEvent.click(await screen.findByRole('button', { name: 'Mark all as read' }))
  expect(await screen.findByText('Messages could not be marked as read. Please retry.')).toBeTruthy()
  expect(screen.getByText('1 unread')).toBeTruthy()
})

it('picks a current member mention and preserves it on a failed send', async () => {
  vi.mocked(sendClassroomMessage).mockRejectedValueOnce(new Error('Offline')).mockResolvedValue({ ...saved, body: '@Class Teacher hello' })
  mount()
  const input = await screen.findByRole('textbox', { name: 'Message this class' })
  await waitFor(() => expect((input as HTMLTextAreaElement).disabled).toBe(false))
  await userEvent.click(screen.getByRole('button', { name: 'Mention someone' }))
  expect(screen.queryByRole('option', { name: /All enrolled students/ })).toBeNull()
  await userEvent.click(await screen.findByRole('option', { name: '@Class Teacher · Class owner' }))
  await userEvent.type(input, 'hello')
  await userEvent.click(screen.getByRole('button', { name: 'Send class chat message' }))
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect((input as HTMLTextAreaElement).value).toBe('@Class Teacher hello')
  await userEvent.click(screen.getByRole('button', { name: 'Send class chat message' }))
  await waitFor(() => expect(sendClassroomMessage).toHaveBeenCalledTimes(2))
  expect(vi.mocked(sendClassroomMessage).mock.calls[1]).toEqual(vi.mocked(sendClassroomMessage).mock.calls[0])
  expect(vi.mocked(sendClassroomMessage).mock.calls[0][4]).toEqual({ mentionUserIds: ['owner'], mentionStudents: false })
})

it('stops when the server repeats a history cursor', async () => {
  const cursor = { beforeId: saved.id, beforeCreatedAt: saved.createdAt }
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [saved], next: cursor })
  vi.mocked(getClassroomUnread).mockResolvedValue({ total: 99, unreadCount: 90, mentionCount: 0, firstUnread: { id: 'missing-message', createdAt: saved.createdAt } })
  mount()
  await userEvent.click(await screen.findByRole('button', { name: 'View all unread messages' }))
  expect(await screen.findByText('History pagination could not continue.')).toBeTruthy()
  expect(markClassroomRead).not.toHaveBeenCalled()
})

it('allows the teaching owner to notify all students with @students', async () => {
  vi.mocked(sendClassroomMessage).mockResolvedValue({ ...saved, body: '@students Hello' })
  render(<TestSession user={teacher} path="/educators/classrooms/class-id?tab=chat"><Routes><Route path="/educators/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
  const input = await screen.findByRole('textbox', { name: 'Message this class' })
  await waitFor(() => expect((input as HTMLTextAreaElement).disabled).toBe(false))
  await userEvent.click(screen.getByRole('button', { name: 'Mention someone' }))
  await userEvent.click(screen.getByRole('option', { name: '@students · All enrolled students' }))
  await userEvent.type(input, 'Hello')
  await userEvent.click(screen.getByRole('button', { name: 'Send class chat message' }))
  await waitFor(() => expect(sendClassroomMessage).toHaveBeenCalledWith(classroom.id, expect.any(String), '@students Hello', null, { mentionUserIds: [], mentionStudents: true }))
})

it('opens a notification-linked message even when it is in older history', async () => {
  const cursor = { beforeId: saved.id, beforeCreatedAt: saved.createdAt }
  const linked = { ...saved, id: 'linked', body: 'Mentioned here' }
  vi.mocked(getClassroomMessages).mockImplementation(async (_id, before) => before ? { items: [linked], next: null } : { items: [saved], next: cursor })
  render(<TestSession path="/students/classrooms/class-id?tab=chat&message=linked"><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
  expect(await screen.findByText('Mentioned here')).toBeTruthy()
  await waitFor(() => expect(markClassroomRead).toHaveBeenCalledWith(classroom.id, 'linked'))
})

it('filters mention suggestions inline without moving focus or sending on selection', async () => {
  const send = vi.fn().mockResolvedValue(true)
  render(<ChatComposer classroomId={classroom.id} userId={student.id} onSend={send} replyingTo={null} onCancelReply={() => {}} />)
  const input = screen.getByRole('textbox', { name: 'Message this class' })
  await userEvent.type(input, 'Hello @t')
  expect(await screen.findByRole('option', { name: '@Class Teacher · Class owner' })).toBeTruthy()
  expect(document.activeElement).toBe(input)
  expect(screen.queryByRole('textbox', { name: /find/i })).toBeNull()
  expect(getClassroomMembers).toHaveBeenCalledTimes(1)
  await userEvent.keyboard('{Enter}')
  expect((input as HTMLTextAreaElement).value).toBe('Hello @Class Teacher ')
  expect(send).not.toHaveBeenCalled()
  await userEvent.type(input, 'hello{Enter}')
  expect(send).toHaveBeenCalledWith('Hello @Class Teacher hello', { mentionUserIds: ['owner'], mentionStudents: false })
})

it('updates matches while typing and supports arrow selection and Escape', async () => {
  vi.mocked(getClassroomMembers).mockResolvedValue({ items: [
    { id: 'one', name: 'Alice Brown', role: 'student' },
    { id: 'two', name: 'Amy Carter', role: 'student' },
    { id: 'three', name: 'Bob Smith', role: 'student' },
  ], nextCursor: null })
  render(<ChatComposer classroomId={classroom.id} onSend={vi.fn()} replyingTo={null} onCancelReply={() => {}} />)
  const input = screen.getByRole('textbox', { name: 'Message this class' })
  await userEvent.type(input, '@a')
  expect(await screen.findByRole('option', { name: '@Alice Brown' })).toBeTruthy()
  expect(screen.getByRole('option', { name: '@Amy Carter' })).toBeTruthy()
  expect(screen.queryByRole('option', { name: '@Bob Smith' })).toBeNull()
  await userEvent.keyboard('{ArrowDown}{Enter}')
  expect((input as HTMLTextAreaElement).value).toBe('@Amy Carter ')
  await userEvent.type(input, '@b')
  expect(await screen.findByRole('option', { name: '@Bob Smith' })).toBeTruthy()
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('listbox')).toBeNull()
  expect(document.activeElement).toBe(input)
})

it('replaces only the mention at the caret and ignores email addresses', async () => {
  render(<ChatComposer classroomId={classroom.id} onSend={vi.fn()} replyingTo={null} onCancelReply={() => {}} />)
  const input = screen.getByRole('textbox', { name: 'Message this class' }) as HTMLTextAreaElement
  await userEvent.type(input, 'name@example.test')
  expect(screen.queryByRole('listbox')).toBeNull()
  expect(getClassroomMembers).not.toHaveBeenCalled()
  fireEvent.change(input, { target: { value: 'Hello @Cl, welcome', selectionStart: 9, selectionEnd: 9 } })
  await userEvent.click(await screen.findByRole('option', { name: '@Class Teacher · Class owner' }))
  expect(input.value).toBe('Hello @Class Teacher, welcome')
})

it('does not submit a partial mention while matching members are loading', async () => {
  vi.mocked(getClassroomMembers).mockReturnValue(new Promise(() => {}))
  const send = vi.fn()
  render(<ChatComposer classroomId={classroom.id} onSend={send} replyingTo={null} onCancelReply={() => {}} />)
  await userEvent.type(screen.getByRole('textbox', { name: 'Message this class' }), '@a{Enter}')
  expect(send).not.toHaveBeenCalled()
  expect(screen.getByText('Loading members…')).toBeTruthy()
})

it('does not notify a selected member after their mention text is edited', async () => {
  const send = vi.fn().mockResolvedValue(true)
  render(<ChatComposer classroomId={classroom.id} onSend={send} replyingTo={null} onCancelReply={() => {}} />)
  const input = screen.getByRole('textbox', { name: 'Message this class' })
  await userEvent.type(input, '@c')
  await userEvent.click(await screen.findByRole('option', { name: '@Class Teacher · Class owner' }))
  fireEvent.change(input, { target: { value: '@Class TeacherX hello' } })
  await userEvent.click(screen.getByRole('button', { name: 'Send class chat message' }))
  expect(send).toHaveBeenCalledWith('@Class TeacherX hello', undefined)
})

it('removes the visible typing and mention guidelines', async () => {
  render(<ChatComposer classroomId={classroom.id} onSend={vi.fn()} replyingTo={null} onCancelReply={() => {}} />)
  await userEvent.type(screen.getByRole('textbox', { name: 'Message this class' }), '@c')
  await screen.findByRole('option', { name: '@Class Teacher · Class owner' })
  expect(screen.queryByText(/Enter to send|Enter to mention|Esc to close/)).toBeNull()
})

it('shows seen status beside the timestamp and loads confirmed readers on demand', async () => {
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [{ ...saved, seenCount: 2 }], next: null })
  vi.mocked(getClassroomMessageReaders).mockResolvedValueOnce({ items: [{ id: 'reader-one', name: 'Reader One' }], nextCursor: 'next-reader' })
    .mockResolvedValueOnce({ items: [{ id: 'reader-two', name: 'Reader Two' }], nextCursor: null })
  mount()
  const seen = await screen.findByRole('button', { name: 'Seen by 2. View readers' })
  expect(seen.parentElement?.querySelector('time')).toBeTruthy()
  expect(getClassroomMessageReaders).not.toHaveBeenCalled()
  await userEvent.click(seen)
  expect(await screen.findByText('Reader One')).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: 'Load more readers' }))
  expect(await screen.findByText('Reader Two')).toBeTruthy()
  expect(getClassroomMessageReaders).toHaveBeenCalledWith(classroom.id, saved.id, 'next-reader', expect.any(AbortSignal))
  const signal = vi.mocked(getClassroomMessageReaders).mock.calls[0][3]!
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(signal.aborted).toBe(true)
})

it('keeps reader errors distinct from an empty list and hides receipt controls on incoming messages', async () => {
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [{ ...saved, seenCount: 1 }, { ...saved, id: 'incoming', authorId: 'owner', seenCount: null }], next: null })
  vi.mocked(getClassroomMessageReaders).mockRejectedValue(new Error('Offline'))
  mount()
  expect(await screen.findAllByText('Hello class')).toHaveLength(2)
  expect(screen.getAllByRole('button', { name: /View readers/ })).toHaveLength(1)
  await userEvent.click(screen.getByRole('button', { name: 'Seen by 1. View readers' }))
  expect(await screen.findByText('Readers could not be loaded.')).toBeTruthy()
  expect(screen.queryByText('No current class members have seen this message yet.')).toBeNull()
})

it('acknowledges a fully visible latest message only in a focused conversation', async () => {
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [{ ...saved, authorId: 'owner' }], next: null })
  vi.mocked(getClassroomUnread).mockResolvedValueOnce({ total: 1, unreadCount: 1, mentionCount: 0, firstUnread: { id: saved.id, createdAt: saved.createdAt } })
    .mockResolvedValue({ total: 1, unreadCount: 0, mentionCount: 0, firstUnread: null })
  const focused = vi.spyOn(document, 'hasFocus').mockReturnValue(false)
  try {
    mount()
    await screen.findByText('1 unread')
    const list = screen.getByRole('log').querySelector('[data-slot="scroll-area-viewport"]')!
    vi.spyOn(list, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList)
    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 100 } as DOMRect)
    vi.spyOn(document.getElementById('chat-message-' + saved.id)!, 'getBoundingClientRect').mockReturnValue({ top: 10, bottom: 80 } as DOMRect)
    fireEvent(window, new Event('focus'))
    await new Promise(resolve => setTimeout(resolve, 550))
    expect(markClassroomRead).not.toHaveBeenCalled()
    focused.mockReturnValue(true)
    fireEvent(window, new Event('focus'))
    await waitFor(() => expect(markClassroomRead).toHaveBeenCalledWith(classroom.id, saved.id))
  } finally { focused.mockRestore() }
})
