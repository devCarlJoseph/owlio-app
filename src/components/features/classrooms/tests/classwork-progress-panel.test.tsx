import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ClassworkProgressPanel } from '../ui/classwork-progress-panel'
import { listClassworkLearners, listClassworkSubmissions, type ClassworkEntry } from '@/services/api/classwork-workspace.service'

vi.mock('@/services/api/classwork-workspace.service', () => ({ listClassworkLearners: vi.fn(), listClassworkSubmissions: vi.fn() }))
const at = '2030-01-01T10:00:00Z'
const entry: ClassworkEntry = {
  work: { id: 'work', classroomId: 'class', title: 'Sensor quiz', instructions: 'Choose one.', dueAt: at, maxPoints: null, status: 'PUBLISHED', publishedAt: at, createdAt: at, updatedAt: at },
  questions: { version: 1, questions: [] }, submission: null,
}
beforeEach(() => vi.resetAllMocks())
afterEach(cleanup)

it('shows learner deadlines and missing work without requesting the class roster', () => {
  render(<ClassworkProgressPanel items={[entry]} active={entry} owned={false} loading={false} error={false} now={Date.parse(at)} onSelect={vi.fn()} />)
  expect(screen.getByText('0 of 1 activities submitted')).toBeTruthy()
  expect(screen.getAllByText('Missing').length).toBeGreaterThan(0)
  expect(listClassworkLearners).not.toHaveBeenCalled()
  expect(listClassworkSubmissions).not.toHaveBeenCalled()
})

it('counts enrolled students once across submission attempts and switches pending to missing at cutoff', async () => {
  const learners = [{ studentId: 'one', name: 'One', joinedAt: at }, { studentId: 'two', name: 'Two', joinedAt: at }]
  const submission = { id: 'attempt', classworkId: 'work', studentId: 'one', submittedAt: at, isLate: false, createdAt: at, updatedAt: at, attempt: 1, returnedAt: null }
  vi.mocked(listClassworkLearners).mockResolvedValue(learners)
  vi.mocked(listClassworkSubmissions).mockResolvedValue([submission, { ...submission, id: 'second', attempt: 2 }, { ...submission, studentId: 'outsider' }])
  const props = { items: [entry], active: entry, owned: true, loading: false, error: false, onSelect: vi.fn() }
  const view = render(<ClassworkProgressPanel {...props} now={Date.parse(at) - 1000} />)
  expect(await screen.findByText('1 of 2 students submitted')).toBeTruthy()
  expect(screen.getByText('1 not submitted')).toBeTruthy()
  view.rerender(<ClassworkProgressPanel {...props} now={Date.parse(at)} />)
  expect(screen.getByText('1 missing')).toBeTruthy()
})

it('keeps unavailable counts as errors and supports explicit retry', async () => {
  vi.mocked(listClassworkLearners).mockRejectedValueOnce(new Error('Roster unavailable')).mockResolvedValueOnce([])
  vi.mocked(listClassworkSubmissions).mockResolvedValue([])
  render(<ClassworkProgressPanel items={[entry]} active={entry} owned loading={false} error={false} now={Date.parse(at)} onSelect={vi.fn()} />)
  await screen.findByText('Roster unavailable')
  expect(screen.queryByText('0 of 0 students submitted')).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: 'Refresh progress' }))
  expect(await screen.findByText('0 of 0 students submitted')).toBeTruthy()
})
