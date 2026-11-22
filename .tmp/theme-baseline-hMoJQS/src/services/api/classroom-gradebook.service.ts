import { requestOperation } from './contract-client'
import type { OperationBody, OperationData } from './generated-contract'
import { getClassworkEvaluation, getClassworkReleasedResult } from './classwork-grading.service'

type StudentGradebook = OperationData<'GET /api/v1/classrooms/{classroomId}/gradebook/me'>
type EducatorGradebook = OperationData<'GET /api/v1/classrooms/{classroomId}/gradebook'>
export type GradebookActivity = StudentGradebook['items'][number]['classwork']
export type GradebookCell = StudentGradebook['items'][number]['result'] | EducatorGradebook['rows'][number]['cells'][number]

export type GradebookPage = {
  activities: GradebookActivity[]
  learners: { student: StudentGradebook['student']; cells: GradebookCell[] }[]
  nextActivity: string | null
  nextLearner: string | null
}

type GradebookScope = { classroomId: string; studentId?: string }
type GradebookCursors = { activity?: string; learner?: string }

export async function getClassroomGradebook(
  { classroomId, studentId }: GradebookScope,
  cursors: GradebookCursors,
  signal?: AbortSignal,
): Promise<GradebookPage> {
  const params = { classroomId }
  const query = { classworkLimit: 10, classworkCursor: cursors.activity }
  if (studentId !== undefined) {
    const page = await requestOperation('GET /api/v1/classrooms/{classroomId}/gradebook/me', { params, query, signal })
    if (page.classroom.id !== classroomId || page.student.id !== studentId) throw new Error('The gradebook belongs to a different classroom or student.')
    return {
      activities: page.items.map(item => item.classwork),
      learners: [{ student: page.student, cells: page.items.map(item => item.result) }],
      nextActivity: page.page.nextClassworkCursor,
      nextLearner: null,
    }
  }

  const page = await requestOperation('GET /api/v1/classrooms/{classroomId}/gradebook', {
    params, query: { ...query, studentLimit: 20, studentCursor: cursors.learner }, signal,
  })
  if (page.classroom.id !== classroomId) throw new Error('The gradebook belongs to a different classroom.')
  return {
    activities: page.columns,
    learners: page.rows,
    nextActivity: page.page.nextClassworkCursor,
    nextLearner: page.page.nextStudentCursor,
  }
}

export async function getGradebookFeedback(submissionId: string, owned: boolean, signal?: AbortSignal) {
  if (owned) {
    const evaluation = await getClassworkEvaluation(submissionId, signal)
    if (evaluation && evaluation.submissionId !== submissionId) throw new Error('The feedback belongs to a different submission.')
    return evaluation && { feedback: evaluation.feedback, evaluation }
  }
  const result = await getClassworkReleasedResult(submissionId, signal)
  return result && { feedback: result.feedback, evaluation: null }
}

export const reviseGradebookFeedback = (submissionId: string, feedback: string, expectedVersion: number) =>
  requestOperation('PATCH /api/v1/submissions/{submissionId}/evaluation/feedback', { params: { submissionId }, body: { feedback, expectedVersion } })

export type GradeCommentPage = OperationData<'GET /api/v1/submissions/{submissionId}/grade-comments'>
export const getGradeComments = (submissionId: string, cursor?: string, signal?: AbortSignal) =>
  requestOperation('GET /api/v1/submissions/{submissionId}/grade-comments', { params: { submissionId }, query: { cursor }, signal })
export const sendGradeComment = (submissionId: string, body: string, requestId: string) =>
  requestOperation('POST /api/v1/submissions/{submissionId}/grade-comments', { params: { submissionId }, body: { body, requestId } })

type PeriodReleaseOperation = 'POST /api/v1/classrooms/{classroomId}/gradebook/period-grades/students/{studentId}'
type PeriodRelease = OperationBody<PeriodReleaseOperation>
type ReleasedPeriodGrade = OperationData<PeriodReleaseOperation>
export type PeriodGrade = {
  period: PeriodRelease['period']
  released: ReleasedPeriodGrade | null
  preview?: { earned: number; possible: number; pending: number; open: number; percentage: number | null }
}

function assertPeriodScope(page: { classroomId: string; studentId: string }, classroomId: string, studentId: string) {
  if (page.classroomId !== classroomId || page.studentId !== studentId) throw new Error('The period grades belong to a different classroom or student.')
}

export async function getPeriodGrades(classroomId: string, studentId: string, owned: boolean, signal?: AbortSignal): Promise<PeriodGrade[]> {
  if (owned) {
    const page = await requestOperation('GET /api/v1/classrooms/{classroomId}/gradebook/period-grades/students/{studentId}', { params: { classroomId, studentId }, signal })
    assertPeriodScope(page, classroomId, studentId)
    return page.items.map(({ period, released, earned, possible, pending, open, percentage }) => ({
      period, released, preview: { earned, possible, pending, open, percentage },
    }))
  }
  const page = await requestOperation('GET /api/v1/classrooms/{classroomId}/gradebook/period-grades/me', { params: { classroomId }, signal })
  assertPeriodScope(page, classroomId, studentId)
  return page.items.map(released => ({ period: released.period, released }))
}

export const releasePeriodGrade = (classroomId: string, studentId: string, body: PeriodRelease) =>
  requestOperation('POST /api/v1/classrooms/{classroomId}/gradebook/period-grades/students/{studentId}', {
    params: { classroomId, studentId }, body,
  })
