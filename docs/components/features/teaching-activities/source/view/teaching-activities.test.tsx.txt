import type { ReactNode } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EducatorClassworkPage from '@/pages/dashboard/educators/classwork'
import EslClassworkPage from '@/pages/dashboard/esl/classwork'
import TutorClassworkPage from '@/pages/dashboard/tutors/classwork'
import { ClassroomPreviewProvider } from '@/components/features/classrooms/classroom-preview-provider'
import { ClassroomPrototypeContext, useClassroomPrototype, type ClassroomPrototypeContextValue } from '@/components/features/classrooms/classroom-prototype-context'
import { classroomPreviewStore } from '@/components/features/classrooms/classroom-preview-store'
import type { ClassroomSubmission } from '@/components/features/classrooms/classroom-types'
import { activityEntries, filterActivities, ownedPreviewClasses, workspaceCopy, type TeachingRole } from './activity-workspace-model'

const pages = { educators: <EducatorClassworkPage />, esl: <EslClassworkPage />, tutors: <TutorClassworkPage /> }
function Override({ children, changes }: { children: ReactNode; changes: Partial<ClassroomPrototypeContextValue> }) {
  const context = useClassroomPrototype()
  return <ClassroomPrototypeContext.Provider value={{ ...context, ...changes }}>{children}</ClassroomPrototypeContext.Provider>
}
function show(role: TeachingRole = 'educators', changes?: Partial<ClassroomPrototypeContextValue>) {
  return render(<MemoryRouter initialEntries={[`/${role}/classwork`]}><ClassroomPreviewProvider>{changes ? <Override changes={changes}>{pages[role]}</Override> : pages[role]}</ClassroomPreviewProvider></MemoryRouter>)
}
const submission: ClassroomSubmission = { id: 'response-one', learnerId: 'preview-learner', learnerName: 'Alex Rivera', response: 'My explanation uses an example from the lesson.', submittedAt: '2026-10-31T10:00:00.000Z', status: 'Submitted', released: false, score: 7 }
function addResponse() {
  classroomPreviewStore.update('algebra-coaching', 'tutors', classroom => ({ ...classroom, activities: classroom.activities.map((activity, index) => index === 0 ? { ...activity, submissions: [submission] } : activity) }), true)
}
beforeEach(() => classroomPreviewStore.reset())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('shared teaching activity workspace', () => {
  it.each(['educators', 'esl', 'tutors'] as const)('keeps %s records and labels scoped to that teaching role', role => {
    show(role)
    expect(screen.getByRole('heading', { name: workspaceCopy[role].title })).toBeTruthy()
    expect(screen.getByText(/Sample content and changes stay in this tab/)).toBeTruthy()
    const classLinks = screen.getAllByRole('link').filter(link => link.getAttribute('href')?.includes('/classrooms/'))
    expect(classLinks.length).toBeGreaterThan(0)
    expect(classLinks.every(link => link.getAttribute('href')?.startsWith(`/${role}/classrooms/`))).toBe(true)
    if (role !== 'esl') expect(screen.queryByRole('region', { name: 'Everyday English' })).toBeNull()
    if (role !== 'tutors') expect(screen.queryByRole('region', { name: 'Algebra coaching circle' })).toBeNull()
    if (role !== 'educators') expect(screen.queryByRole('region', { name: 'Human Computer Interaction · BSIT 3A' })).toBeNull()
  })

  it('combines search, group, type, and state filters across grid/list views', async () => {
    const user = userEvent.setup()
    show('esl')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Learning group' }), 'everyday-english')
    await user.click(screen.getByRole('tab', { name: 'Drafts' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Activity type' }), 'Reading activity')
    await user.click(screen.getByRole('button', { name: 'List view' }))
    expect(screen.getAllByRole('button', { name: 'Open activity Next session preparation · teacher draft' })).toHaveLength(1)
    await user.type(screen.getByRole('searchbox', { name: 'Search activities' }), 'not a match')
    expect(screen.getByRole('heading', { name: 'No activities match this view' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect((screen.getByRole('searchbox', { name: 'Search activities' }) as HTMLInputElement).value).toBe('')
    expect(screen.getByRole('region', { name: 'English writing workshop' })).toBeTruthy()
  })

  it('creates in the selected owned preview group and keeps the shared classroom source updated', async () => {
    const user = userEvent.setup()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    show('tutors')
    await user.click(screen.getByRole('button', { name: 'Create preview activity' }))
    const form = within(screen.getByRole('dialog'))
    await user.selectOptions(form.getByLabelText('Learner / group'), 'coding-studio')
    await user.type(form.getByLabelText('Activity title'), 'Explain a debugging strategy')
    await user.type(form.getByLabelText('Learner instructions'), 'Choose a bug and explain how you isolated it.')
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    const entry = classroomPreviewStore.getSnapshot().find(item => item.id === 'coding-studio')!.activities[0]
    expect(entry).toMatchObject({ title: 'Explain a debugging strategy', status: 'Published', responseType: 'Text' })
    expect(classroomPreviewStore.getSnapshot().find(item => item.id === 'algebra-coaching')!.activities.some(item => item.title === entry.title)).toBe(false)
    expect(screen.getByRole('button', { name: 'Open activity Explain a debugging strategy' })).toBeTruthy()
    expect(writes).not.toHaveBeenCalled()
  })

  it('validates required instructions, quiz options and timer settings before creating a preview', async () => {
    const user = userEvent.setup()
    show('educators')
    await user.click(screen.getByRole('button', { name: 'Create preview activity' }))
    const form = within(screen.getByRole('dialog'))
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(await form.findByText('Use at least 3 characters for the title.')).toBeTruthy()
    await user.type(form.getByLabelText('Activity title'), 'Concept check')
    await user.type(form.getByLabelText('Learner instructions'), 'Select the best answer.')
    await user.selectOptions(form.getByLabelText('Activity type'), 'Quiz')
    await user.type(form.getByLabelText('Question prompt'), 'Which explanation is correct?')
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(await form.findByText('Add at least two comma-separated options.')).toBeTruthy()
    await user.type(form.getByLabelText('Answer options, separated by commas'), 'First, Second')
    fireEvent.change(form.getByLabelText('Duration (minutes)'), { target: { value: '0' } })
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(form.getByRole('alert').textContent).toContain('1')
    fireEvent.change(form.getByLabelText('Duration (minutes)'), { target: { value: '20' } })
    await user.click(form.getByRole('checkbox', { name: /Show leaderboard to students/ }))
    await user.click(form.getByRole('button', { name: 'Add to preview' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    const created = classroomPreviewStore.getSnapshot().flatMap(item => item.activities).find(item => item.title === 'Concept check')!
    expect(created.responseType).toBe('Quiz')
    expect(created.questions[0].options).toEqual(['First', 'Second'])
    expect(created.timing?.durationMinutes).toBe(20)
    expect(created.showLeaderboard).toBe(true)
  })

  it('does not create anything when the composer is canceled', async () => {
    const user = userEvent.setup()
    show('esl')
    const before = classroomPreviewStore.getSnapshot()
    await user.click(screen.getByRole('button', { name: 'Create preview activity' }))
    expect((within(screen.getByRole('dialog')).getByLabelText('Activity type') as HTMLSelectElement).value).toBe('Speaking practice')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(classroomPreviewStore.getSnapshot()).toBe(before)
  })

  it('shows instructions and owning-context links without inventing submissions', async () => {
    const user = userEvent.setup()
    show('esl')
    const group = within(screen.getByRole('region', { name: 'Everyday English' }))
    await user.click(group.getByRole('button', { name: 'Open activity Introduce your favorite place' }))
    const detail = within(screen.getByRole('dialog'))
    expect(detail.getByText(/Choose one idea from our speaking/)).toBeTruthy()
    expect(detail.getByRole('link', { name: 'Open full activity' }).getAttribute('href')).toBe('/esl/classrooms/everyday-english/classwork/everyday-english-activity')
    await user.click(detail.getByRole('tab', { name: /Responses/ }))
    expect(detail.getByRole('heading', { name: 'No preview responses yet' })).toBeTruthy()
    expect(detail.queryByRole('button', { name: 'Release preview feedback' })).toBeNull()
  })

  it('releases feedback only after the teacher acts, preserving the existing score and unrelated records', async () => {
    const user = userEvent.setup()
    addResponse()
    const untouched = classroomPreviewStore.getSnapshot().find(item => item.id === 'coding-studio')!
    show('tutors')
    await user.click(screen.getByRole('tab', { name: 'To review' }))
    await user.click(screen.getByRole('button', { name: 'Open activity Guided practice reflection' }))
    const detail = within(screen.getByRole('dialog'))
    expect(detail.getByText('My explanation uses an example from the lesson.')).toBeTruthy()
    await user.type(detail.getByLabelText('Tutor evaluation'), 'Clear reasoning')
    await user.type(detail.getByLabelText('Learner-visible feedback'), 'Add another worked example next time.')
    const original = classroomPreviewStore.getSnapshot().find(item => item.id === 'algebra-coaching')!.activities[0].submissions[0]
    expect(original.released).toBe(false)
    await user.click(detail.getByRole('button', { name: 'Release preview feedback' }))
    const released = classroomPreviewStore.getSnapshot().find(item => item.id === 'algebra-coaching')!.activities[0].submissions[0]
    expect(released).toMatchObject({ released: true, score: 7, evaluation: 'Clear reasoning', feedback: 'Add another worked example next time.' })
    expect(classroomPreviewStore.getSnapshot().find(item => item.id === 'coding-studio')).toBe(untouched)
    expect(detail.getByRole('status').textContent).toContain('preview only')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('heading', { name: 'No preview responses to review' })).toBeTruthy()
  })

  it('does not fall back to sample records or zero counts when connected activity services are unavailable', () => {
    show('educators', { connectedModeEnabled: true })
    expect(screen.getByRole('heading', { name: 'Activity service not connected' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Open activity/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Create preview activity' }).hasAttribute('disabled')).toBe(true)
    expect(within(screen.getByRole('group', { name: 'Preview activity summary' })).getAllByText('—')).toHaveLength(4)
  })

  it('offers retry without printing backend error details', async () => {
    const retry = vi.fn()
    show('esl', { classroomsError: 'raw sensitive server error', reloadClassrooms: retry })
    expect(screen.queryByText('raw sensitive server error')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading groups' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})

describe('activity filtering and ownership', () => {
  it('does not expose other roles, non-owner classes or connected records as classroom previews', () => {
    const source = classroomPreviewStore.getSnapshot()
    const outsider = { ...source[0], access: 'student' as const }
    const connected = { ...source[0], isMock: false }
    expect(ownedPreviewClasses([outsider, connected, source.find(item => item.ownerWorkspace === 'tutors')!], 'educators')).toEqual([])
  })
  it('filters due dates using local calendar days and places undated activities last', () => {
    const classroom = classroomPreviewStore.getSnapshot()[0]
    const activity = classroom.activities[0]
    const entries = activityEntries([{ ...classroom, activities: [{ ...activity, id: 'past', dueDate: '2026-10-30' }, { ...activity, id: 'next', dueDate: '2026-11-02' }, { ...activity, id: 'undated', dueDate: '' }] }])
    const filters = { query: '', context: 'all', type: 'all', status: 'all' as const, due: 'all' as const, sort: 'due' as const }
    expect(filterActivities(entries, { ...filters, due: 'upcoming' }, new Date(2026, 9, 31, 12)).map(item => item.activity.id)).toEqual(['next'])
    expect(filterActivities(entries, { ...filters, due: 'past' }, new Date(2026, 9, 31, 12)).map(item => item.activity.id)).toEqual(['past'])
    expect(filterActivities(entries, filters).at(-1)?.activity.id).toBe('undated')
  })
})
