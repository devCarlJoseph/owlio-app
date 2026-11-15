import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { mutateApiWithCsrf, postApiWithCsrf } from './auth.service'
import { deletePersonalNote, getPersonalNotes, getPersonalSubjects, getPersonalTasks, markNotificationRead, savePersonalNote, savePersonalSubject, savePersonalTask, togglePersonalTask } from './personal-workspace.service'

vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('./auth.service', () => ({ mutateApiWithCsrf: vi.fn(), postApiWithCsrf: vi.fn() }))
const id = '11111111-1111-4111-8111-111111111111'
const cursor = '22222222-2222-4222-8222-222222222222'
const subject = { id, name: 'Physics', description: '', archivedAt: null, version: 2 }
const task = { id, title: 'Read', dueAt: null, completedAt: null, version: 3 }
const note = { id, subjectId: null, title: 'My note', content: 'Text', version: 4 }
const page = (items: unknown[], nextCursor: string | null = null) => ({ data: { status: 'success', data: { items, nextCursor } } })
beforeEach(() => vi.resetAllMocks())

describe('account-owned workspace contracts', () => {
  it('follows collection cursors and forwards cancellation to every page', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(page([subject], cursor)).mockResolvedValueOnce(page([{ ...subject, id: cursor }]))
    const controller = new AbortController()
    expect(await getPersonalSubjects(controller.signal)).toHaveLength(2)
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/users/me/subjects', { params: { limit: 50, cursor }, signal: controller.signal })
  })
  it('rejects repeated cursors instead of looping', async () => {
    vi.mocked(api.get).mockResolvedValue(page([], cursor))
    await expect(getPersonalTasks()).rejects.toThrow('repeated a page')
    expect(api.get).toHaveBeenCalledTimes(2)
  })
  it('rejects malformed and non-API responses without using local data', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(page([{ id: 'sample-note', title: 'Fake' }])).mockResolvedValueOnce({ data: '<html>login</html>' })
    await expect(getPersonalNotes()).rejects.toThrow()
    await expect(getPersonalSubjects()).rejects.toThrow()
  })
  it('sends only supported subject fields and the observed version for edits', async () => {
    vi.mocked(mutateApiWithCsrf).mockResolvedValue(subject)
    await savePersonalSubject({ name: 'Physics', description: '' })
    expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('POST', '/api/v1/users/me/subjects', { name: 'Physics', description: '' })
    await savePersonalSubject({ name: 'Physics', description: '' }, subject)
    expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('PATCH', '/api/v1/users/me/subjects/' + id, { name: 'Physics', description: '', expectedVersion: 2 })
  })
  it('preserves optimistic concurrency for task edits, completion and reopening', async () => {
    vi.mocked(mutateApiWithCsrf).mockResolvedValue(task)
    vi.mocked(postApiWithCsrf).mockResolvedValue(task)
    await savePersonalTask({ title: 'Read', dueAt: null }, task)
    expect(mutateApiWithCsrf).toHaveBeenCalledWith('PATCH', '/api/v1/users/me/tasks/' + id, { title: 'Read', dueAt: null, expectedVersion: 3 })
    await togglePersonalTask(task)
    expect(postApiWithCsrf).toHaveBeenLastCalledWith('/api/v1/users/me/tasks/' + id + '/complete', { expectedVersion: 3 })
    await togglePersonalTask({ ...task, completedAt: '2026-11-14T00:00:00Z', version: 4 })
    expect(postApiWithCsrf).toHaveBeenLastCalledWith('/api/v1/users/me/tasks/' + id + '/reopen', { expectedVersion: 4 })
  })
  it('uses the note delete body and does not retry version conflicts', async () => {
    vi.mocked(mutateApiWithCsrf).mockResolvedValueOnce(note).mockRejectedValueOnce(new Error('STALE_NOTE'))
    await savePersonalNote({ title: note.title, content: note.content, subjectId: null }, note)
    await expect(deletePersonalNote(note)).rejects.toThrow('STALE_NOTE')
    expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('DELETE', '/api/v1/users/me/personal-notes/' + id, { expectedVersion: 4 })
    expect(mutateApiWithCsrf).toHaveBeenCalledTimes(2)
  })
  it('marks only the selected notification as read', async () => {
    vi.mocked(postApiWithCsrf).mockResolvedValue({ id, readAt: '2026-11-14T00:00:00Z' })
    await markNotificationRead(id)
    expect(postApiWithCsrf).toHaveBeenCalledWith('/api/v1/users/me/notifications/' + id + '/read', {})
  })
})
