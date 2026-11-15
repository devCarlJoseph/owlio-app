import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getClassrooms } from '@/services/api/classroom.service'
import { getClassroomMessages, sendClassroomMessage } from '@/services/api/classroom-chat.service'
import { ClassroomDetailView } from './classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, student } from './classroom-test-data'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
vi.mock('@/services/api/classroom-chat.service', () => ({ getClassroomMessages: vi.fn(), sendClassroomMessage: vi.fn() }))
const saved = { id: 'message-id', authorId: student.id, authorName: student.name, authorRole: 'student' as const,
  body: 'Hello class', createdAt: '2030-01-01T10:00:00Z', replyTo: null }
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getClassrooms).mockResolvedValue([classroom])
  vi.mocked(getClassroomMessages).mockResolvedValue({ items: [], next: null })
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
