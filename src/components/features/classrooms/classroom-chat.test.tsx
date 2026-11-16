import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getClassrooms, getClassroomMembers } from '@/services/api/classroom.service'
import { getClassroomMessages, sendClassroomMessage } from '@/services/api/classroom-chat.service'
import { ClassroomDetailView } from './classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, student } from './classroom-test-data'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), getClassroomMembers: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
vi.mock('@/services/api/classroom-chat.service', () => ({ getClassroomMessages: vi.fn(), sendClassroomMessage: vi.fn() }))
const saved = { id: 'message-id', authorId: student.id, authorName: student.name, authorRole: 'student' as const,
  body: 'Hello class', createdAt: '2030-01-01T10:00:00Z', replyTo: null }
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getClassrooms).mockResolvedValue([classroom])
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [], next: null })
  vi.mocked(getClassroomMembers).mockResolvedValue({ items: [{ id: 'owner', name: 'Class Teacher', role: 'owner' }, { id: student.id, name: student.name, role: 'student' }], nextCursor: null })
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
function mount() {
  return render(<TestSession path="/students/classrooms/class-id?tab=chat"><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
}
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
