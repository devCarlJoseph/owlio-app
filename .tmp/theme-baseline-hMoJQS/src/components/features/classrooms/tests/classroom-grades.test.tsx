import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { mutateApiWithCsrf } from '@/services/api/auth.service'
import { getClassroomGradebook } from '@/services/api/classroom-gradebook.service'
import { getClassrooms } from '@/services/api/classroom.service'
import { ClassroomDetailView } from '../view/classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, student, teacher } from './classroom-test-data'

vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('@/services/api/auth.service', async importOriginal => ({
  ...await importOriginal<typeof import('@/services/api/auth.service')>(),
  mutateApiWithCsrf: vi.fn(),
}))
vi.mock('@/services/api/classroom.service', () => ({
  getClassrooms: vi.fn(), getClassroomMembers: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn(),
}))

const at = '2026-11-19T08:00:00Z'
const released = { id: 'released', title: 'Functions quiz', maxPoints: 20, dueAt: null, publishedAt: at }
const pending = { ...released, id: 'pending', title: 'Graphing worksheet' }
const learner = { id: student.id, name: student.name }
const result = { submissionId: 'first', score: 0, maxPoints: 20, feedback: 'Review the graph scales.', releasedAt: at }
const releasedCell = { classworkId: released.id, submissionId: result.submissionId, submittedAt: at, isLate: false,
  isOverdue: false, score: result.score, maxPoints: 20, status: 'RELEASED', releasedAt: at }
const pendingCell = { ...releasedCell, classworkId: pending.id, submissionId: 'second', score: null, releasedAt: null }
const studentBook = { classroom, student: learner, asOf: at, items: [
  { classwork: released, result: releasedCell },
  { classwork: pending, result: { ...pendingCell, status: 'AWAITING_RESULT', score: 19 } },
], page: { nextClassworkCursor: null } }
const ownerBook = { classroom, asOf: at, columns: [released, pending], rows: [
  { student: learner, cells: [releasedCell, { ...pendingCell, status: 'EVALUATION_DRAFT', score: 19 }] },
], page: { nextClassworkCursor: null, nextStudentCursor: null } }
const ownerEvaluation = { ...result, id: 'evaluation', version: 1, status: 'RELEASED',
  createdById: teacher.id, updatedById: teacher.id, releasedById: teacher.id, createdAt: at, updatedAt: at }
const respond = (data: unknown) => ({ data: { status: 'success', data } })
const prefix = '/api/v1/classrooms/class-id/gradebook'
const commentsPath = '/api/v1/submissions/first/grade-comments'
const preview = { period: 'PRELIM', earned: 0, possible: 20, pending: 0, open: 0, percentage: 0, released: null }
const savedPrelim = { period: 'PRELIM', earned: 0, possible: 20, percentage: 0, releasedAt: at }

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getClassrooms).mockResolvedValue([{ ...classroom, ownerWorkspace: 'educators' }])
})
afterEach(cleanup)

function openGrades(owner = false) {
  render(<TestSession user={owner ? teacher : student} path={`/${owner ? 'educators' : 'students'}/classrooms/${classroom.id}?tab=progress`}>
    <Routes><Route path="/:role/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes>
  </TestSession>)
}

function mockGradebook() {
  const data: Record<string, unknown> = {
    [`${prefix}/me`]: studentBook,
    [prefix]: ownerBook,
    [`${prefix}/period-grades/me`]: { classroomId: classroom.id, studentId: student.id, items: [savedPrelim] },
    [`${prefix}/period-grades/students/${student.id}`]: { classroomId: classroom.id, studentId: student.id, items: [preview] },
    '/api/v1/submissions/first/result': result,
    '/api/v1/submissions/first/evaluation': ownerEvaluation,
    '/api/v1/submissions/second/evaluation': { ...ownerEvaluation, status: 'DRAFT', submissionId: 'second',
      score: 19, feedback: 'Draft worksheet feedback.', releasedAt: null, releasedById: null },
    [commentsPath]: { items: [], nextCursor: null },
  }
  vi.mocked(api.get).mockImplementation(async path => {
    if (!(path in data)) throw new Error('Unexpected read: ' + path)
    return respond(data[path])
  })
}

it('shows students their Classwork release and suppresses pending scores and feedback reads', async () => {
  mockGradebook()
  openGrades()
  await screen.findByText(result.feedback)
  expect(screen.getByRole('button', { name: /Functions quiz/ }).textContent).toContain('0 / 20')
  expect(screen.queryByText('19 / 20')).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: /Graphing worksheet/ }))
  expect(screen.queryByText(result.feedback)).toBeNull()
  expect(within(screen.getByRole('complementary', { name: 'Grade details' })).getByText('Awaiting grade')).toBeTruthy()
  expect(screen.getByText('0.00%')).toBeTruthy()
  expect(vi.mocked(api.get).mock.calls.map(([path]) => path)).not.toContain('/api/v1/submissions/second/result')
})

it('lets the classroom owner inspect grade drafts alongside released results', async () => {
  mockGradebook()
  openGrades(true)
  expect(await screen.findByRole('button', { name: 'Edit released feedback' })).toBeTruthy()
  expect(screen.getByRole('combobox', { name: 'Student' })).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: /Graphing worksheet/ }))
  expect(await screen.findByText('Draft worksheet feedback.')).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Review in Classwork' }).getAttribute('href'))
    .toBe('/educators/classrooms/class-id/classwork/pending')
  expect(vi.mocked(api.get).mock.calls.map(([path]) => path)).toContain('/api/v1/submissions/second/evaluation')
})

it('sends a private student comment for the selected released submission', async () => {
  mockGradebook()
  const body = 'Could we review my scale?'
  vi.mocked(mutateApiWithCsrf).mockResolvedValueOnce({ id: 'message', actorId: student.id, body, createdAt: at })
  openGrades()
  await userEvent.type(await screen.findByRole('textbox', { name: 'Private comment' }), body)
  await userEvent.click(screen.getByRole('button', { name: 'Send comment' }))
  expect(await screen.findByText(body)).toBeTruthy()
  expect(mutateApiWithCsrf).toHaveBeenCalledWith('POST', commentsPath, { body, requestId: expect.any(String) })
})

it('revises only written feedback and explicitly confirms an official period release', async () => {
  mockGradebook()
  const feedback = 'The scale was marked correctly.'
  vi.mocked(mutateApiWithCsrf)
    .mockResolvedValueOnce({ ...ownerEvaluation, feedback, version: 2 })
    .mockResolvedValueOnce(savedPrelim)
  openGrades(true)
  await userEvent.click(await screen.findByRole('button', { name: 'Edit released feedback' }))
  const field = screen.getByRole('textbox', { name: 'Feedback for the student' })
  await userEvent.clear(field)
  await userEvent.type(field, feedback)
  await userEvent.click(screen.getByRole('button', { name: 'Update feedback' }))
  expect(await screen.findByText(feedback)).toBeTruthy()
  expect(mutateApiWithCsrf).toHaveBeenNthCalledWith(1, 'PATCH', '/api/v1/submissions/first/evaluation/feedback', { feedback, expectedVersion: 1 })

  await userEvent.click(await screen.findByRole('button', { name: 'Release Prelim grade' }))
  expect(mutateApiWithCsrf).toHaveBeenCalledTimes(1)
  await userEvent.click(screen.getByRole('button', { name: 'Confirm release' }))
  expect(await screen.findByText('0.00%')).toBeTruthy()
  expect(mutateApiWithCsrf).toHaveBeenNthCalledWith(2, 'POST', `${prefix}/period-grades/students/${student.id}`, {
    period: 'PRELIM', expectedEarned: 0, expectedPossible: 20,
  })
})

it('forwards the activity cursor and rejects results scoped to another student', async () => {
  vi.mocked(api.get).mockResolvedValueOnce(respond({ ...studentBook, student: { ...learner, id: 'another-student' } }))
  const signal = new AbortController().signal
  await expect(getClassroomGradebook({ classroomId: classroom.id, studentId: learner.id }, { activity: 'next' }, signal))
    .rejects.toThrow('different classroom or student')
  expect(api.get).toHaveBeenCalledWith('/api/v1/classrooms/class-id/gradebook/me', {
    params: { classworkLimit: 10, classworkCursor: 'next' }, signal,
  })
})
