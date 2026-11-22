import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ClassworkSubmissionReview } from '../view/classwork-submission-review'
import type { Classwork, Submission } from '@/services/api/academic.service'
import { getClassworkSubmission, type ClassworkQuestion } from '@/services/api/classwork-workspace.service'
import * as grading from '@/services/api/classwork-grading.service'
import * as workspace from '@/services/api/classwork-workspace.service'
import { ClassworkDetail } from '../view/classwork-detail'
import { ClassworkReviewProvider } from '../context/classwork-review-provider'

vi.mock('@/services/api/classwork-workspace.service', () => ({ getClassworkSubmission: vi.fn(), loadClassroomWork: vi.fn(), listClassworkLearners: vi.fn(), listClassworkSubmissions: vi.fn() }))
vi.mock('@/services/api/classwork-grading.service', () => ({ getClassworkAnswerScore: vi.fn(), getClassworkEvaluation: vi.fn(), getClassworkRubric: vi.fn(), saveClassworkEvaluation: vi.fn(), releaseClassworkEvaluation: vi.fn() }))
const at = '2030-01-01T10:00:00Z'
const work: Classwork = { id: 'work', classroomId: 'class', title: 'Sensor quiz', instructions: 'Choose one.', maxPoints: 2, dueAt: at, status: 'PUBLISHED', publishedAt: at, createdAt: at, updatedAt: at }
const submission: Submission = { id: 'submission', classworkId: 'work', studentId: 'learner', status: 'SUBMITTED', attempt: 1, previousAttemptId: null, returnedAt: null, returnReason: null, textAnswer: '', choiceAnswers: [{ questionId: 'one', optionIndex: 0 }, { questionId: 'two', optionIndex: 0 }], version: 3, submittedAt: at, isLate: false, createdAt: at, updatedAt: at, files: [], pendingUploadCount: 0 }
const questions: ClassworkQuestion[] = [{ id: 'one', position: 1, prompt: 'First question', options: ['Yes', 'No'], answerIndex: 0 }, { id: 'two', position: 2, prompt: 'Second question', options: ['Yes', 'No'], answerIndex: 1 }]
const evaluation: grading.ClassworkEvaluation = { id: 'evaluation', submissionId: 'submission', status: 'DRAFT', maxPoints: 2, score: 1, feedback: 'Review the second question.', version: 5, createdById: 'owner', updatedById: 'owner', releasedById: null, createdAt: at, updatedAt: at, releasedAt: null }
const selection = { id: 'submission', studentId: 'learner', name: 'Learner One' }
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getClassworkSubmission).mockResolvedValue(submission)
  vi.mocked(grading.getClassworkEvaluation).mockResolvedValue(null)
  vi.mocked(grading.getClassworkAnswerScore).mockResolvedValue({ id: 'submission', total: 2, correct: 1 })
  vi.mocked(grading.getClassworkRubric).mockResolvedValue({ version: 4, criteria: null })
  vi.mocked(grading.saveClassworkEvaluation).mockResolvedValue(evaluation)
  vi.mocked(grading.releaseClassworkEvaluation).mockResolvedValue({ ...evaluation, status: 'RELEASED', version: 6, releasedAt: at, releasedById: 'owner' })
})
afterEach(cleanup)
const open = (item = work) => render(<ClassworkSubmissionReview work={item} questions={questions} selection={selection} onClose={vi.fn()} />)

it('compares answers, saves an explicitly reviewed grade, and releases only the saved version', async () => {
  open()
  await screen.findByText('Answer-key check: 1 of 2 correct')
  expect(screen.getByText('Correct')).toBeTruthy()
  expect(screen.getByText('Incorrect')).toBeTruthy()
  await userEvent.click(screen.getByRole('button', { name: /Use answer-key count/ }))
  await userEvent.type(screen.getByRole('textbox', { name: 'Feedback for the student' }), evaluation.feedback)
  expect((screen.getByRole('button', { name: 'Release grade to student' }) as HTMLButtonElement).disabled).toBe(true)
  await userEvent.click(screen.getByRole('button', { name: 'Save grade draft' }))
  await screen.findByText('Grade draft saved. It is private until released.')
  expect(grading.saveClassworkEvaluation).toHaveBeenCalledWith('submission', { score: 1, feedback: evaluation.feedback, expectedVersion: 0 })
  expect(grading.releaseClassworkEvaluation).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Release grade to student' }))
  await screen.findByText('Grade released to the student.')
  expect(grading.releaseClassworkEvaluation).toHaveBeenCalledWith('submission', 5)
  expect((screen.getByRole('spinbutton', { name: 'Score out of 2' }) as HTMLInputElement).disabled).toBe(true)
})

it('keeps grade edits after a failed save and prevents release of unsaved changes', async () => {
  vi.mocked(grading.getClassworkEvaluation).mockResolvedValue(evaluation)
  vi.mocked(grading.saveClassworkEvaluation).mockRejectedValue(new Error('Stale grade. Reload before saving.'))
  open()
  const feedback = await screen.findByRole('textbox', { name: 'Feedback for the student' })
  await userEvent.type(feedback, ' New feedback')
  expect((screen.getByRole('button', { name: 'Release grade to student' }) as HTMLButtonElement).disabled).toBe(true)
  await userEvent.click(screen.getByRole('button', { name: 'Save grade draft' }))
  await screen.findByText('Stale grade. Reload before saving.')
  expect((feedback as HTMLTextAreaElement).value).toContain('New feedback')
  expect(grading.releaseClassworkEvaluation).not.toHaveBeenCalled()
})

it('keeps feedback-only published work free of invented numeric grades', async () => {
  open({ ...work, maxPoints: null })
  await screen.findByText(/published as feedback-only/)
  expect(screen.queryByRole('spinbutton')).toBeNull()
  await userEvent.type(screen.getByRole('textbox', { name: 'Feedback for the student' }), 'One of two answers was correct.')
  await userEvent.click(screen.getByRole('button', { name: 'Save grade draft' }))
  expect(grading.saveClassworkEvaluation).toHaveBeenCalledWith('submission', { score: null, feedback: 'One of two answers was correct.', expectedVersion: 0 })
})

it('conceals grading controls when the submission belongs to another activity', async () => {
  vi.mocked(getClassworkSubmission).mockResolvedValue({ ...submission, classworkId: 'other' })
  open()
  await screen.findByText(/not available for review in this activity/)
  expect(screen.queryByRole('button', { name: 'Save grade draft' })).toBeNull()
  expect(grading.saveClassworkEvaluation).not.toHaveBeenCalled()
})

it('preserves released results as read-only and does not offer save or release again', async () => {
  vi.mocked(grading.getClassworkEvaluation).mockResolvedValue({ ...evaluation, status: 'RELEASED', releasedAt: at })
  open()
  await screen.findByText('Released grade')
  expect(screen.queryByRole('button', { name: 'Save grade draft' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Release grade to student' })).toBeNull()
})

it('keeps the selected student and unsaved grade edits when switching between form and student work', async () => {
  vi.mocked(workspace.loadClassroomWork).mockResolvedValue({ work, questions: { version: 4, questions }, submission: null })
  vi.mocked(workspace.listClassworkLearners).mockResolvedValue([{ studentId: 'learner', name: 'Learner One', joinedAt: at }])
  vi.mocked(workspace.listClassworkSubmissions).mockResolvedValue([submission])
  render(<ClassworkReviewProvider><ClassworkDetail classroomId="class" id="work" owned onBack={vi.fn()} /></ClassworkReviewProvider>)
  await userEvent.click(await screen.findByRole('tab', { name: 'Student work' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Review Learner One, attempt 1' }))
  await userEvent.type(await screen.findByRole('textbox', { name: 'Feedback for the student' }), 'Keep this review draft.')
  await userEvent.click(screen.getByRole('tab', { name: 'Quiz form' }))
  expect(screen.getByRole('tab', { name: 'Quiz form', selected: true })).toBeTruthy()
  await userEvent.click(screen.getByRole('tab', { name: 'Student work' }))
  expect((screen.getByRole('textbox', { name: 'Feedback for the student' }) as HTMLTextAreaElement).value).toBe('Keep this review draft.')
  expect(screen.getByRole('button', { name: 'All submissions' })).toBeTruthy()
  expect(grading.saveClassworkEvaluation).not.toHaveBeenCalled()
})

it('requires completed rubric criteria to match the total before releasing', async () => {
  const criterion = { id: 'criterion', label: 'Explanation', maxPoints: 2 }
  vi.mocked(grading.getClassworkEvaluation).mockResolvedValue({ ...evaluation, rubric: [criterion], criterionScores: [] })
  vi.mocked(grading.saveClassworkEvaluation).mockResolvedValue({ ...evaluation, rubric: [criterion], criterionScores: [{ criterionId: criterion.id, points: 2 }], version: 7 })
  open()
  const points = await screen.findByRole('spinbutton', { name: 'Explanation · out of 2' })
  await userEvent.type(points, '2')
  await userEvent.click(screen.getByRole('button', { name: 'Save grade draft' }))
  await screen.findByText('Grade draft saved. It is private until released.')
  await userEvent.click(screen.getByRole('button', { name: 'Release grade to student' }))
  await screen.findByText('Complete rubric scores must add up to the grade before release.')
  expect(grading.releaseClassworkEvaluation).not.toHaveBeenCalled()
})
