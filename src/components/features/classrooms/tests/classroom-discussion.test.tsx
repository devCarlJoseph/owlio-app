import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getClassrooms } from '@/services/api/classroom.service'
import * as api from '@/services/api/classroom-discussion.service'
import { ClassroomDetailView } from '../view/classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, student, teacher } from './classroom-test-data'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
vi.mock('@/services/api/classroom-discussion.service', () => ({ getClassroomPosts: vi.fn(), createClassroomPost: vi.fn(), getClassComments: vi.fn(), addClassComment: vi.fn(), setClassReaction: vi.fn() }))
const post: api.DiscussionPostRecord = { id: 'post-id', authorId: teacher.id, authorName: 'Teacher Account', body: 'What did you learn today?\n\nReading: https://example.test/lesson', createdAt: '2026-11-17T02:00:00Z', commentCount: 1, lastCommentAt: '2026-11-17T03:00:00Z', repliers: [{ id: student.id, name: student.name }], reactions: [{ emoji: '👍', count: 2, mine: false }] }
const comment: api.DiscussionCommentRecord = { id: 'comment-id', authorId: student.id, authorName: student.name, authorRole: 'student', body: 'I learned about fractions.', createdAt: '2026-11-17T03:00:00Z' }
function open(owner = false) {
  return render(<TestSession user={owner ? teacher : student} path={`/${owner ? 'educators' : 'students'}/classrooms/class-id?tab=feed`}><Routes><Route path="/:role/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
}
afterEach(cleanup)
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getClassrooms).mockResolvedValue([classroom])
  vi.mocked(api.getClassroomPosts).mockResolvedValue({ items: [post], next: null, readOnly: false })
  vi.mocked(api.getClassComments).mockResolvedValue({ items: [comment], next: null })
  vi.mocked(api.addClassComment).mockResolvedValue({ ...comment, id: 'new-comment', body: 'My answer' })
  vi.mocked(api.createClassroomPost).mockResolvedValue({ ...post, id: 'new-post', body: 'Class update' })
  vi.mocked(api.setClassReaction).mockResolvedValue({ ...post, reactions: [{ emoji: '👍', count: 3, mine: true }] })
})
it('opens the connected Discussion deep link and lets a student comment and react without publishing posts', async () => {
  const user = userEvent.setup(); open()
  expect(await screen.findByText('What did you learn today?')).toBeTruthy()
  expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Discussion')
  expect(screen.queryByRole('button', { name: 'Post to class' })).toBeNull()
  expect(screen.getByRole('link', { name: 'https://example.test/lesson' }).getAttribute('rel')).toContain('noopener')
  expect(screen.getByRole('heading', { name: '1 class comment' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: /1 class comment/ })).toBeNull()
  expect(await screen.findByText(comment.body)).toBeTruthy()
  const input = screen.getByRole('textbox', { name: 'Write a class comment' })
  await user.type(input, 'My answer'); await user.click(screen.getByRole('button', { name: 'Comment' }))
  expect(await screen.findByText('My answer')).toBeTruthy()
  expect(api.addClassComment).toHaveBeenCalledWith('class-id', 'post-id', expect.any(String), 'My answer')
  await user.click(screen.getByRole('button', { name: 'Thumbs up, 2 reactions' }))
  expect(await screen.findByRole('button', { name: 'Thumbs up, 3 reactions' })).toBeTruthy()
  expect(api.setClassReaction).toHaveBeenCalledWith('class-id', 'post-id', '👍', true)
  vi.mocked(api.setClassReaction).mockResolvedValue({ ...post, reactions: [{ emoji: '👍', count: 2, mine: false }] })
  await user.click(screen.getByRole('button', { name: 'Thumbs up, 3 reactions' }))
  await screen.findByRole('button', { name: 'Thumbs up, 2 reactions' })
  expect(api.setClassReaction).toHaveBeenLastCalledWith('class-id', 'post-id', '👍', false)
})
it('allows the owner to publish and clears only a confirmed draft', async () => {
  const user = userEvent.setup(); open(true)
  const input = await screen.findByRole('textbox', { name: 'Write a class post' })
  await waitFor(() => expect((input as HTMLTextAreaElement).disabled).toBe(false))
  await user.type(input, 'Class update'); await user.click(screen.getByRole('button', { name: 'Post to class' }))
  expect(await screen.findByText('Class update')).toBeTruthy()
  expect((input as HTMLTextAreaElement).value).toBe('')
  expect(api.createClassroomPost).toHaveBeenCalledWith('class-id', expect.any(String), 'Class update')
})
it('preserves failed comments and reuses the request ID on retry', async () => {
  vi.mocked(api.addClassComment).mockRejectedValueOnce(new Error('Offline'))
  const user = userEvent.setup(); open()
  const input = await screen.findByRole('textbox', { name: 'Write a class comment' })
  await waitFor(() => expect((input as HTMLTextAreaElement).disabled).toBe(false))
  await user.type(input, 'My answer'); await user.click(screen.getByRole('button', { name: 'Comment' }))
  expect(await screen.findByText('Offline')).toBeTruthy()
  expect((input as HTMLTextAreaElement).value).toBe('My answer')
  await user.click(screen.getByRole('button', { name: 'Comment' }))
  await screen.findByText('My answer')
  expect(vi.mocked(api.addClassComment).mock.calls[0][2]).toBe(vi.mocked(api.addClassComment).mock.calls[1][2])
})
it('shows failed reads honestly and disables archived writes', async () => {
  vi.mocked(api.getClassroomPosts).mockRejectedValueOnce(new Error('Offline'))
  const user = userEvent.setup(); open(true)
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(screen.queryByText('No class posts yet')).toBeNull()
  expect((screen.getByRole('button', { name: 'Post to class' }) as HTMLButtonElement).disabled).toBe(true)
  vi.mocked(api.getClassroomPosts).mockResolvedValue({ items: [post], next: null, readOnly: true })
  await user.click(screen.getByRole('button', { name: 'Retry loading discussion' }))
  expect(await screen.findByText('This classroom is archived. Discussion is read-only.')).toBeTruthy()
  const reactions = screen.getByRole('group', { name: 'Post reactions' })
  expect((within(reactions).getByRole('button', { name: 'Add reaction' }) as HTMLButtonElement).disabled).toBe(true)
})
it('ignores a late read after leaving the discussion', async () => {
  let complete!: (page: Awaited<ReturnType<typeof api.getClassroomPosts>>) => void
  vi.mocked(api.getClassroomPosts).mockReturnValue(new Promise(resolve => { complete = resolve }))
  const view = open(); await screen.findByText('Loading class discussion…')
  view.unmount(); complete({ items: [post], next: null, readOnly: false })
  expect(screen.queryByText('What did you learn today?')).toBeNull()
})
