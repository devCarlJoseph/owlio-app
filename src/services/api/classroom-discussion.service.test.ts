import { beforeEach, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { mutateApiWithCsrf, postApiWithCsrf } from './auth.service'
import { addClassComment, createClassroomPost, editClassComment, editClassroomPost, getClassComments, getClassroomPosts, setClassReaction } from './classroom-discussion.service'
vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('./auth.service', () => ({ postApiWithCsrf: vi.fn(), mutateApiWithCsrf: vi.fn() }))
const id = '11111111-1111-4111-8111-111111111111'
const post = { id, authorId: id, authorName: 'Educator', body: 'Hello class', createdAt: '2026-11-17T02:00:00Z', commentCount: 0, lastCommentAt: null, repliers: [], reactions: [] }
beforeEach(() => vi.resetAllMocks())
it('validates paginated responses and passes cancellation and cursor selectors', async () => {
  const controller = new AbortController(), cursor = { beforeCreatedAt: post.createdAt, beforeId: id }
  vi.mocked(api.get).mockResolvedValue({ data: { status: 'success', data: { items: [post], next: cursor, readOnly: false } } })
  expect((await getClassroomPosts(id, cursor, controller.signal)).items).toEqual([post])
  expect(api.get).toHaveBeenCalledWith(`/api/v1/classrooms/${id}/posts`, { params: { limit: 20, ...cursor }, signal: controller.signal })
  vi.mocked(api.get).mockResolvedValue({ data: { status: 'success', data: { items: [{ ...post, commentCount: 'invented' }], next: null, readOnly: false } } })
  await expect(getClassroomPosts(id)).rejects.toThrow()
})
it('uses the existing CSRF helper, stable request IDs, and explicit reaction state', async () => {
  vi.mocked(postApiWithCsrf).mockResolvedValue(post)
  await createClassroomPost(id, id, 'Hello class')
  expect(postApiWithCsrf).toHaveBeenLastCalledWith(`/api/v1/classrooms/${id}/posts`, { requestId: id, body: 'Hello class' })
  await setClassReaction(id, id, '👍', false)
  expect(postApiWithCsrf).toHaveBeenLastCalledWith(`/api/v1/classrooms/${id}/posts/${id}/reactions`, { emoji: '👍', active: false })
  const comment = { id, authorId: id, authorName: 'Student', authorRole: 'student', body: 'Reply', createdAt: post.createdAt }
  vi.mocked(postApiWithCsrf).mockResolvedValue(comment)
  expect(await addClassComment(id, id, id, 'Reply')).toEqual(comment)
  expect(postApiWithCsrf).toHaveBeenLastCalledWith(`/api/v1/classrooms/${id}/posts/${id}/comments`, { requestId: id, body: 'Reply' })
})
it('preserves failed reads as errors', async () => {
  vi.mocked(api.get).mockRejectedValue(new Error('Denied'))
  await expect(getClassComments(id, id)).rejects.toThrow('Denied')
})

it('uses scoped CSRF-protected PATCH endpoints and requires a server edit timestamp in the response', async () => {
  const input = { body: 'Updated', expectedEditedAt: null }
  const edited = { ...post, body: input.body, editedAt: '2026-11-23T03:00:00.000Z' }
  vi.mocked(mutateApiWithCsrf).mockResolvedValueOnce(edited).mockResolvedValueOnce({ ...edited, authorRole: 'student' }).mockResolvedValueOnce(post)
  expect(await editClassroomPost(id, id, input)).toEqual(edited)
  expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('PATCH', `/api/v1/classrooms/${id}/posts/${id}`, input)
  expect(await editClassComment(id, id, id, input)).toMatchObject({ body: 'Updated', editedAt: edited.editedAt })
  expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('PATCH', `/api/v1/classrooms/${id}/posts/${id}/comments/${id}`, input)
  await expect(editClassroomPost(id, id, input)).rejects.toThrow()
})
