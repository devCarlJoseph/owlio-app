import { beforeEach, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { mutateApiWithCsrf } from './auth.service'
import { getClassworkEvaluation, releaseClassworkEvaluation, saveClassworkEvaluation } from './classwork-grading.service'

vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('./auth.service', () => ({ mutateApiWithCsrf: vi.fn() }))
const at = '2030-01-01T10:00:00Z'
const evaluation = { id: 'grade', submissionId: 'submission', maxPoints: 2, score: 1, feedback: 'Review question 2.', status: 'DRAFT', version: 4, createdById: 'owner', updatedById: 'owner', releasedById: null, createdAt: at, updatedAt: at, releasedAt: null }
beforeEach(() => vi.resetAllMocks())

it('reads the authorized evaluation with cancellation and preserves unreleased null results', async () => {
  const controller = new AbortController()
  vi.mocked(api.get).mockResolvedValueOnce({ data: { status: 'success', data: null } })
  expect(await getClassworkEvaluation('submission', controller.signal)).toBeNull()
  expect(api.get).toHaveBeenCalledWith('/api/v1/submissions/submission/evaluation', { params: undefined, signal: controller.signal })
})

it('saves and releases through CSRF helpers with observed concurrency versions', async () => {
  vi.mocked(mutateApiWithCsrf).mockResolvedValueOnce(evaluation).mockResolvedValueOnce({ ...evaluation, status: 'RELEASED', version: 5, releasedAt: at })
  const saved = await saveClassworkEvaluation('submission', { score: 1, feedback: evaluation.feedback, expectedVersion: 3 })
  await releaseClassworkEvaluation('submission', saved.version)
  expect(mutateApiWithCsrf).toHaveBeenNthCalledWith(1, 'PUT', '/api/v1/submissions/submission/evaluation', { score: 1, feedback: evaluation.feedback, expectedVersion: 3 })
  expect(mutateApiWithCsrf).toHaveBeenNthCalledWith(2, 'POST', '/api/v1/submissions/submission/evaluation/release', { expectedVersion: 4 })
})

it('propagates denied or stale grade writes without pretending success or releasing', async () => {
  vi.mocked(mutateApiWithCsrf).mockRejectedValueOnce(new Error('STALE_EVALUATION'))
  await expect(saveClassworkEvaluation('submission', { score: 1, feedback: '', expectedVersion: 0 })).rejects.toThrow('STALE_EVALUATION')
  expect(mutateApiWithCsrf).toHaveBeenCalledTimes(1)
})
