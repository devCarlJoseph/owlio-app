import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Classroom } from '@/components/features/classrooms/classroom-types'
import { listClasswork } from './academic.service'
import { collectOperation, requestOperation } from './contract-client'
import { loadTeachingOverview } from './teaching-overview.service'

vi.mock('./academic.service', () => ({ listClasswork: vi.fn() }))
vi.mock('./contract-client', () => ({ collectOperation: vi.fn(), requestOperation: vi.fn() }))

const classroom: Classroom = {
  id: 'class', name: 'Math', subject: '', description: '', instructorName: '',
  ownerWorkspace: 'educators', joinCode: null, meetingId: null, access: 'owner',
  members: [], memberRequests: [], enrolledLearnerIds: [], posts: [], chatMessages: [],
  materials: [], sessions: [], attendance: [], activities: [], progress: [], isMock: false,
}
const published = {
  id: 'work', classroomId: 'class', title: 'Reading', instructions: 'Read chapter one',
  dueAt: null, maxPoints: 10, status: 'PUBLISHED' as const,
  publishedAt: '2026-11-15T00:00:00Z', createdAt: '', updatedAt: '',
}
beforeEach(() => vi.resetAllMocks())

describe('owner teaching overview data adapter', () => {
  it('uses actual saved responses, roster names, attachments and grading fields', async () => {
    vi.mocked(listClasswork).mockResolvedValue([published])
    vi.mocked(collectOperation)
      .mockResolvedValueOnce([{ studentId: 'student', name: 'Fixture learner', joinedAt: '' }])
      .mockResolvedValueOnce([{ id: 'submission', studentId: 'student' }])
    vi.mocked(requestOperation)
      .mockResolvedValueOnce({ id: 'submission', studentId: 'student', textAnswer: 'Saved response', files: [{ fileName: 'answer.pdf' }], submittedAt: '2026-11-15T01:00:00Z' })
      .mockResolvedValueOnce({ status: 'RELEASED', score: 0, feedback: 'Try again' })
    const controller = new AbortController()
    const result = await loadTeachingOverview([classroom], controller.signal)
    expect(result[0].activities[0].submissions).toEqual([{
      id: 'submission', learnerId: 'student', learnerName: 'Fixture learner',
      response: 'Saved response', fileName: 'answer.pdf', submittedAt: '2026-11-15T01:00:00Z',
      status: 'Returned', feedback: 'Try again', score: 0, released: true,
    }])
    expect(requestOperation).toHaveBeenCalledWith('GET /api/v1/submissions/{submissionId}', {
      params: { submissionId: 'submission' }, signal: controller.signal,
    })
  })

  it('does not invent submissions for drafts', async () => {
    vi.mocked(listClasswork).mockResolvedValue([{ ...published, status: 'DRAFT', version: 2 }])
    expect((await loadTeachingOverview([classroom]))[0].activities[0].submissions).toEqual([])
    expect(collectOperation).not.toHaveBeenCalled()
    expect(requestOperation).not.toHaveBeenCalled()
  })

  it('propagates denied or failed reads instead of substituting sample records', async () => {
    vi.mocked(listClasswork).mockRejectedValue(new Error('NOT_FOUND'))
    await expect(loadTeachingOverview([classroom])).rejects.toThrow('NOT_FOUND')
    expect(collectOperation).not.toHaveBeenCalled()
  })
})
