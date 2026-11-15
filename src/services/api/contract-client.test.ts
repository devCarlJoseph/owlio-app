import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { mutateApiWithCsrf } from './auth.service'
import { collectOperation, requestOperation } from './contract-client'
import { getClasswork, listClasswork, uploadClassworkFile, uploadSubmissionFile, type Submission } from './academic.service'

vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('./auth.service', () => ({ mutateApiWithCsrf: vi.fn() }))
const id = '11111111-1111-4111-8111-111111111111'
const cursor = '22222222-2222-4222-8222-222222222222'
const at = '2026-11-15T00:00:00Z'
const envelope = (data: unknown) => ({ data: { status: 'success', data } })
const classwork = { id, classroomId: cursor, title: 'Reading', instructions: 'Read the chapter', maxPoints: 10, dueAt: null, status: 'PUBLISHED', publishedAt: at, createdAt: at, updatedAt: at }
const file = { id, classworkId: cursor, fileName: 'reading.pdf', contentType: 'application/pdf', sizeBytes: 5, createdAt: at }
const upload = { fileId: id, uploadUrl: 'https://storage.example.test/signed-upload', uploadExpiresAt: at, completeBefore: at, headers: { 'Content-Type': 'application/pdf' } }
beforeEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals() })

describe('browser API contract boundary', () => {
  it('encodes path selectors and forwards query and cancellation to the credentialed API client', async () => {
    vi.mocked(api.get).mockResolvedValue(envelope({ id, name: 'Space', description: '', role: 'MEMBER' }))
    const controller = new AbortController()
    await requestOperation('GET /api/v1/study-spaces/{spaceId}', { params: { spaceId: 'a/b?#' }, signal: controller.signal })
    expect(api.get).toHaveBeenCalledWith('/api/v1/study-spaces/a%2Fb%3F%23', { params: undefined, signal: controller.signal })
  })
  it('rejects non-API and malformed success responses', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: '<html>Sign in</html>' }).mockResolvedValueOnce(envelope({ id, name: 42 }))
    await expect(requestOperation('GET /api/v1/study-spaces/{spaceId}', { params: { spaceId: id } })).rejects.toThrow()
    await expect(requestOperation('GET /api/v1/study-spaces/{spaceId}', { params: { spaceId: id } })).rejects.toThrow()
  })
  it('sends PUT mutations through the existing CSRF helper with observed versions', async () => {
    vi.mocked(mutateApiWithCsrf).mockResolvedValue({ studentId: id, status: 'PRESENT', version: 5 })
    await requestOperation('PUT /api/v1/sessions/{sessionId}/attendance/{studentId}', { params: { sessionId: cursor, studentId: id }, body: { expectedVersion: 4, status: 'PRESENT', reasonCode: 'TEACHER_CORRECTION' } })
    expect(mutateApiWithCsrf).toHaveBeenCalledWith('PUT', `/api/v1/sessions/${cursor}/attendance/${id}`, { expectedVersion: 4, status: 'PRESENT', reasonCode: 'TEACHER_CORRECTION' })
  })
  it('propagates conflicts without retrying a mutation', async () => {
    vi.mocked(mutateApiWithCsrf).mockRejectedValue(new Error('STALE_ATTENDANCE'))
    await expect(requestOperation('PUT /api/v1/sessions/{sessionId}/attendance/{studentId}', { params: { sessionId: cursor, studentId: id }, body: { expectedVersion: 4, status: 'PRESENT', reasonCode: 'TEACHER_CORRECTION' } })).rejects.toThrow('STALE_ATTENDANCE')
    expect(mutateApiWithCsrf).toHaveBeenCalledOnce()
  })
  it('follows every collection cursor and rejects cursor loops', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(envelope({ items: [{ id, title: 'A', url: 'https://example.test/a' }], nextCursor: cursor })).mockResolvedValueOnce(envelope({ items: [{ id: cursor, title: 'B', url: 'https://example.test/b' }], nextCursor: null }))
    expect(await collectOperation('GET /api/v1/users/me/materials')).toHaveLength(2)
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/users/me/materials', { params: { limit: 50, cursor }, signal: undefined })
    vi.mocked(api.get).mockResolvedValue(envelope({ items: [], nextCursor: cursor }))
    await expect(collectOperation('GET /api/v1/users/me/materials')).rejects.toThrow('repeated page cursor')
  })
  it('does not start an aborted read', async () => {
    const controller = new AbortController(); controller.abort()
    await expect(requestOperation('GET /api/v1/users/me/settings', { signal: controller.signal })).rejects.toThrow('aborted')
    expect(api.get).not.toHaveBeenCalled()
  })
  it('accepts the source-backed published classwork projection without a draft version', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(envelope(classwork)).mockResolvedValueOnce(envelope({ items: [classwork], nextCursor: null }))
    expect(await getClasswork(id)).toMatchObject(classwork)
    expect(await listClasswork(cursor)).toEqual([classwork])
  })
})

describe('private file finalization', () => {
  it('transfers bytes without API credentials and finalizes only after storage succeeds', async () => {
    vi.mocked(mutateApiWithCsrf).mockResolvedValueOnce(upload).mockResolvedValueOnce(file)
    const transfer = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal('fetch', transfer)
    const bytes = new File(['%PDF-'], 'reading.pdf', { type: 'application/pdf' })
    await expect(uploadClassworkFile(cursor, bytes)).resolves.toEqual(file)
    expect(transfer).toHaveBeenCalledWith(new URL(upload.uploadUrl), { method: 'PUT', credentials: 'omit', headers: upload.headers, body: bytes, referrerPolicy: 'no-referrer' })
    expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('POST', `/api/v1/classwork/${cursor}/files/${id}/complete`, {})
  })
  it('never finalizes failed transfers or reports them as ready', async () => {
    vi.mocked(mutateApiWithCsrf).mockResolvedValue(upload)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(uploadClassworkFile(cursor, new File(['%PDF-'], 'reading.pdf', { type: 'application/pdf' }))).rejects.toThrow('not been finalized')
    expect(mutateApiWithCsrf).toHaveBeenCalledOnce()
  })
  it('rejects unsupported bytes metadata before requesting a signed URL', async () => {
    await expect(uploadClassworkFile(cursor, new File(['abc'], 'script.js', { type: 'application/javascript' }))).rejects.toThrow('PDF, PNG, or JPEG')
    await expect(uploadClassworkFile(cursor, new File([], 'empty.pdf', { type: 'application/pdf' }))).rejects.toThrow('5 MB')
    expect(mutateApiWithCsrf).not.toHaveBeenCalled()
  })
  it('uses the upload reservation version when finalizing a submission attachment', async () => {
    const submission: Submission = { id, classworkId: cursor, studentId: id, status: 'DRAFT', attempt: 1, previousAttemptId: null, returnedAt: null, returnReason: null, textAnswer: '', choiceAnswers: [], version: 3, submittedAt: null, isLate: false, createdAt: at, updatedAt: at, files: [], pendingUploadCount: 0 }
    vi.mocked(mutateApiWithCsrf).mockResolvedValueOnce({ ...upload, version: 4 }).mockResolvedValueOnce({ ...submission, version: 5, files: [file] })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    expect((await uploadSubmissionFile(cursor, submission, new File(['%PDF-'], 'reading.pdf', { type: 'application/pdf' }))).version).toBe(5)
    expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('POST', `/api/v1/classwork/${cursor}/submissions/me/files/${id}/complete`, { expectedVersion: 4 })
  })
})
