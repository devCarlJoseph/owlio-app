import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { mutateApiWithCsrf } from './auth.service'
import { listClassroomWork, loadClassroomWork, saveClassworkResponse, submitClassworkResponse } from './classwork-workspace.service'

vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('./auth.service', () => ({ mutateApiWithCsrf: vi.fn() }))
const at = '2030-01-01T10:00:00Z'
const work = { id: 'work-id', classroomId: 'class-id', title: 'Reading', instructions: 'Read and answer.', maxPoints: null, dueAt: at, status: 'PUBLISHED', publishedAt: at, createdAt: at, updatedAt: at }
const envelope = (data: unknown) => ({ data: { status: 'success', data } })

beforeEach(() => vi.resetAllMocks())
describe('classroom classwork service', () => {
  it('follows classwork pagination, excludes draft records for learners, and propagates cancellation', async () => {
    const controller = new AbortController()
    vi.mocked(api.get).mockImplementation(async (url, config) => {
      const params = config?.params as { cursor?: string } | undefined
      if (url === '/api/v1/classrooms/class-id/classwork') return envelope(params?.cursor ? { items: [{ ...work, id: 'draft-id', status: 'DRAFT', version: 1 }], nextCursor: null } : { items: [work], nextCursor: 'next-id' })
      if (url === '/api/v1/classwork/work-id/questions') return envelope({ version: 2, questions: [] })
      if (url === '/api/v1/classwork/work-id/submissions/me') return envelope(null)
      throw new Error('Unexpected request: ' + url)
    })
    expect(await listClassroomWork('class-id', false, controller.signal)).toEqual([{ work, questions: { version: 2, questions: [] }, submission: null }])
    expect(api.get).toHaveBeenCalledTimes(4)
    for (const [, config] of vi.mocked(api.get).mock.calls) expect(config?.signal).toBe(controller.signal)
  })

  it('never requests the owner’s personal submission and keeps API errors distinct from an empty list', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(envelope({ items: [work], nextCursor: null })).mockResolvedValueOnce(envelope({ version: 2, questions: [] }))
    await listClassroomWork('class-id', true)
    expect(api.get).toHaveBeenCalledTimes(2)
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Access denied'))
    await expect(listClassroomWork('class-id', false)).rejects.toThrow('Access denied')
  })

  it('rejects activity links whose classroom does not match before fetching answers', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(envelope(work))
    await expect(loadClassroomWork('another-class', work.id, false)).rejects.toThrow('not available in this classroom')
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('sends versioned writes through the cookie/CSRF mutation helper and surfaces the cutoff error', async () => {
    vi.mocked(mutateApiWithCsrf).mockRejectedValueOnce(new Error('CLASSWORK_CLOSED'))
    await expect(submitClassworkResponse(work.id, 4)).rejects.toThrow('CLASSWORK_CLOSED')
    expect(mutateApiWithCsrf).toHaveBeenCalledWith('POST', '/api/v1/classwork/work-id/submissions/me/submit', { expectedVersion: 4 })
    vi.mocked(mutateApiWithCsrf).mockRejectedValueOnce(new Error('Save failed'))
    await expect(saveClassworkResponse(work.id, 3, 'Answer', [])).rejects.toThrow('Save failed')
    expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('PUT', '/api/v1/classwork/work-id/submissions/me', { expectedVersion: 3, textAnswer: 'Answer', choiceAnswers: [] })
  })
})
