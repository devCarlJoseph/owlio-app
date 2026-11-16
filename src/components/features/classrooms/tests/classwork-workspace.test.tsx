import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Classroom } from '../types/classroom-types'
import type { Classwork, Submission } from '@/services/api/academic.service'
import * as service from '@/services/api/classwork-workspace.service'
import { ClassroomClassworkView } from '../view/classroom-classwork-view'
import { classworkClosed, classworkStatus } from '../utils/classwork-deadline'

vi.mock('@/services/api/classwork-workspace.service', () => ({
  listClassroomWork: vi.fn(), loadClassroomWork: vi.fn(), saveClassworkResponse: vi.fn(), submitClassworkResponse: vi.fn(),
  createClassroomWork: vi.fn(), addClassworkQuestion: vi.fn(), removeClassworkQuestion: vi.fn(),
  updateClassroomWork: vi.fn(), publishClassroomWork: vi.fn(), listClassworkLearners: vi.fn(), listClassworkSubmissions: vi.fn(), getClassworkSubmission: vi.fn(),
}))

const room: Classroom = { id: 'class-id', name: 'Biology', ownerId: 'teacher-id', description: '', subject: '', instructorName: '', ownerWorkspace: 'educators', joinCode: null, meetingId: null,
  access: 'student', members: [], memberRequests: [], enrolledLearnerIds: [], posts: [], chatMessages: [], materials: [], sessions: [], attendance: [], activities: [], progress: [], isMock: false }
const closing = new Date(Date.now() + 86_400_000).toISOString()
const work: Classwork = { id: 'work-id', classroomId: room.id, title: 'Internet of Things', instructions: 'Choose the best answer.', dueAt: closing, maxPoints: null, status: 'PUBLISHED', publishedAt: closing, createdAt: closing, updatedAt: closing }
const questions: service.ClassworkQuestions = { version: 3, questions: [{ id: 'question-id', position: 1, prompt: 'What is the primary purpose of sensors?', options: ['Store readings', 'Detect environment'] }] }
const draft: Submission = { id: 'submission-id', classworkId: work.id, studentId: 'student-id', status: 'DRAFT', attempt: 1, previousAttemptId: null, returnedAt: null, returnReason: null, textAnswer: '', choiceAnswers: [], version: 1, submittedAt: null, isLate: false, createdAt: closing, updatedAt: closing, files: [], pendingUploadCount: 0 }
const entry: service.ClassworkEntry = { work, questions, submission: null }

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(service.listClassroomWork).mockResolvedValue([entry])
  vi.mocked(service.loadClassroomWork).mockResolvedValue(entry)
  vi.mocked(service.listClassworkLearners).mockResolvedValue([])
  vi.mocked(service.listClassworkSubmissions).mockResolvedValue([])
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

async function open(owned = false) {
  render(<ClassroomClassworkView classroom={{ ...room, access: owned ? 'owner' : 'student' }} />)
  await userEvent.click(await within(await screen.findByRole('region', { name: 'Classwork' })).findByRole('button', { name: /Internet of Things/ }))
  await screen.findByRole('heading', { name: 'Internet of Things' })
}

describe('classwork deadlines', () => {
  it('closes exactly at the fixed timestamp and keeps accepted submissions submitted', () => {
    const deadline = Date.parse(closing)
    expect(classworkClosed(closing, deadline - 1)).toBe(false)
    expect(classworkClosed(closing, deadline)).toBe(true)
    expect(classworkStatus(work, null, deadline)).toBe('Missing')
    expect(classworkStatus(work, { status: 'DRAFT' }, deadline)).toBe('Missing')
    expect(classworkStatus(work, { status: 'SUBMITTED' }, deadline + 1)).toBe('Submitted')
    expect(classworkClosed(null, deadline)).toBe(false)
  })

  it('saves selected answers before finalizing with the returned version', async () => {
    const answer = { questionId: 'question-id', optionIndex: 1 }
    vi.mocked(service.saveClassworkResponse).mockResolvedValue({ ...draft, choiceAnswers: [answer], version: 7 })
    vi.mocked(service.submitClassworkResponse).mockResolvedValue({ ...draft, status: 'SUBMITTED', choiceAnswers: [answer], version: 8, submittedAt: closing })
    await open()
    expect(screen.queryByRole('button', { name: 'Create classwork' })).toBeNull()
    await userEvent.click(screen.getByRole('radio', { name: 'Detect environment' }))
    await userEvent.click(screen.getByRole('button', { name: 'Finish quiz' }))
    expect(service.saveClassworkResponse).toHaveBeenCalledWith(work.id, 0, '', [answer])
    expect(service.submitClassworkResponse).toHaveBeenCalledWith(work.id, 7)
    await screen.findByText('Your classwork was submitted.')
    expect(await screen.findByText('1 of 1 activities submitted')).toBeTruthy()
    expect(screen.getByText('1 of 1 answers saved')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Submitted' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('rejects empty quiz submissions and retains choices on a failed save', async () => {
    vi.mocked(service.saveClassworkResponse).mockRejectedValue(new Error('Save unavailable'))
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Finish quiz' }))
    await screen.findByText('Answer at least one question before finishing the quiz.')
    expect(service.saveClassworkResponse).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('radio', { name: 'Detect environment' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    await screen.findByText('Save unavailable')
    expect((screen.getByRole('radio', { name: 'Detect environment' }) as HTMLInputElement).checked).toBe(true)
    expect(service.submitClassworkResponse).not.toHaveBeenCalled()
  })

  it('locks an open quiz when the deadline passes and marks it missing', async () => {
    await open()
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse(closing))
    act(() => { fireEvent(window, new Event('focus')) })
    expect(await screen.findByText(/Missing activity/)).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Finish quiz' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('radio', { name: 'Detect environment' }) as HTMLInputElement).disabled).toBe(false)
    // Native fieldset disabling applies to descendants even without their own disabled attribute.
    expect(screen.getByRole('radio', { name: 'Detect environment' }).closest('fieldset')?.disabled).toBe(true)
    expect(service.submitClassworkResponse).not.toHaveBeenCalled()
  })

  it('keeps a draft saved if the cutoff occurs during its save and skips finalization', async () => {
    vi.mocked(service.saveClassworkResponse).mockImplementation(async () => {
      vi.spyOn(Date, 'now').mockReturnValue(Date.parse(closing))
      return draft
    })
    await open()
    await userEvent.click(screen.getByRole('radio', { name: 'Detect environment' }))
    await userEvent.click(screen.getByRole('button', { name: 'Finish quiz' }))
    await screen.findByText(/deadline passed before submission/)
    expect(service.submitClassworkResponse).not.toHaveBeenCalled()
  })

  it('honors a server cutoff even when the client clock is behind', async () => {
    vi.mocked(service.saveClassworkResponse).mockResolvedValue(draft)
    vi.mocked(service.submitClassworkResponse).mockRejectedValue({ isAxiosError: true, response: { data: { code: 'CLASSWORK_CLOSED', message: 'Deadline reached on the server.' } } })
    await open()
    await userEvent.click(screen.getByRole('radio', { name: 'Detect environment' }))
    await userEvent.click(screen.getByRole('button', { name: 'Finish quiz' }))
    await screen.findByText('Deadline reached on the server.')
    expect((screen.getByRole('button', { name: 'Finish quiz' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('submits a written assessment through the same versioned flow', async () => {
    const assessment = { ...entry, questions: { version: 0, questions: [] } }
    vi.mocked(service.listClassroomWork).mockResolvedValue([assessment])
    vi.mocked(service.loadClassroomWork).mockResolvedValue(assessment)
    vi.mocked(service.saveClassworkResponse).mockResolvedValue({ ...draft, textAnswer: 'My response' })
    vi.mocked(service.submitClassworkResponse).mockResolvedValue({ ...draft, textAnswer: 'My response', status: 'SUBMITTED', submittedAt: closing })
    await open()
    await userEvent.type(screen.getByRole('textbox', { name: 'Your response' }), 'My response')
    await userEvent.click(screen.getByRole('button', { name: 'Submit assessment' }))
    await screen.findByText('Your classwork was submitted.')
    expect(service.saveClassworkResponse).toHaveBeenCalledWith(work.id, 0, 'My response', [])
  })
})

describe('educator classwork', () => {
  it('publishes a reviewed draft and loads the roster only for owner review', async () => {
    vi.mocked(service.loadClassroomWork).mockResolvedValue({ ...entry, work: { ...work, status: 'DRAFT', version: 3 } })
    await open(true)
    expect(service.listClassworkLearners).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Publish to class' }))
    await screen.findByText('Classwork published to this classroom.')
    expect(service.publishClassroomWork).toHaveBeenCalledWith(work.id)
    await waitFor(() => expect(service.listClassworkLearners).toHaveBeenCalled())
  })

  it('shows the owner missing learners without inventing submissions', async () => {
    const past = new Date(Date.now() - 1000).toISOString()
    vi.mocked(service.loadClassroomWork).mockResolvedValue({ ...entry, work: { ...work, dueAt: past } })
    vi.mocked(service.listClassworkLearners).mockResolvedValue([{ studentId: 'student-id', name: 'Learner One', joinedAt: closing }])
    await open(true)
    await screen.findByText('Learner One')
    expect(screen.getByText('Missing')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Review Learner One' })).toBeNull()
  })

  it('does not recreate a draft when its first quiz question fails to save', async () => {
    const owner = { ...room, access: 'owner' as const }
    vi.mocked(service.listClassroomWork).mockResolvedValue([])
    vi.mocked(service.createClassroomWork).mockResolvedValue({ ...work, status: 'DRAFT', version: 0 })
    vi.mocked(service.addClassworkQuestion).mockRejectedValue(new Error('Question save failed'))
    vi.mocked(service.loadClassroomWork).mockResolvedValue({ ...entry, work: { ...work, status: 'DRAFT', version: 0 }, questions: { version: 0, questions: [] } })
    render(<ClassroomClassworkView classroom={owner} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Create classwork' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Classwork type' }), 'quiz')
    await userEvent.type(screen.getByRole('textbox', { name: 'Question' }), 'Which one?')
    for (let i = 1; i <= 4; i++) await userEvent.type(screen.getByRole('textbox', { name: `Choice ${i}` }), `Option ${i}`)
    await userEvent.click(screen.getByRole('button', { name: 'Save question' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), work.title)
    await userEvent.type(screen.getByRole('textbox', { name: 'Instructions' }), work.instructions)
    await userEvent.click(screen.getByLabelText('Closing date and time'))
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }))
    const nextMonth = new Date()
    nextMonth.setDate(1)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    await userEvent.click(screen.getByRole('button', { name: new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(nextMonth) }))
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    await userEvent.click(screen.getByRole('button', { name: 'Create draft' }))
    await screen.findByText(/draft was saved, but adding its first question could not be confirmed/)
    expect(service.createClassroomWork).toHaveBeenCalledTimes(1)
    expect(service.publishClassroomWork).not.toHaveBeenCalled()
  })
})
