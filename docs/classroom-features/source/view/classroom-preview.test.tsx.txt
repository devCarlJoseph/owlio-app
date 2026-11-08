import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ClassroomPrototypeProvider } from './classroom-prototype-provider'
import { ClassroomsView } from './classrooms-view'
import { ClassroomDetailView } from './classroom-detail-view'
import { ClassroomActivityView } from './classroom-activity-view'
import { classroomForPreviewRole, classroomPreviewStore } from './classroom-preview-store'
import { PREVIEW_LEARNER_ID } from './classroom-preview-data'
import { AuthSessionContext } from '@/components/features/auth/auth-session-context'
import { getClassrooms } from '@/services/api/classroom.service'

vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: false }))
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
beforeEach(() => { classroomPreviewStore.reset(); vi.clearAllMocks() })
afterEach(cleanup)

function PreviewLocation() {
  const location = useLocation()
  return <output aria-label="Current preview URL">{location.pathname + location.search}</output>
}

function preview(path = '/students/classrooms') {
  return render(<MemoryRouter initialEntries={[path]}><AuthSessionContext.Provider value={{ user: null, status: 'anonymous', error: null,
    signIn: async () => { throw new Error('Preview only') }, signOut: async () => {}, refreshCurrentUser: async () => {} }}><ClassroomPrototypeProvider>
    <PreviewLocation /><Routes>{['students', 'educators', 'tutors', 'esl'].map(role => <Route key={role} path={`/${role}/classrooms`}>
      <Route index element={<ClassroomsView />} /><Route path=":classroomId" element={<ClassroomDetailView />} /><Route path=":classroomId/classwork/:activityId" element={<ClassroomActivityView />} />
    </Route>)}</Routes>
  </ClassroomPrototypeProvider></AuthSessionContext.Provider></MemoryRouter>)
}

describe('shared classroom preview', () => {
  it('filters student enrollments by teaching category, supports search and list layout, and never calls the API', async () => {
    const user = userEvent.setup()
    preview()
    expect(screen.getAllByRole('link', { name: /^View class / })).toHaveLength(7)
    expect(screen.queryByText('English conversation club')).toBeNull()
    await user.click(screen.getByRole('button', { name: /^Tutoring/ }))
    expect(screen.getAllByRole('link', { name: /^View class / })).toHaveLength(2)
    await user.type(screen.getByRole('searchbox', { name: 'Search classes' }), 'coding')
    expect(screen.getAllByRole('link', { name: /^View class / })).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'List view' }))
    expect(within(screen.getByRole('table', { name: 'Classes' })).getByText('The coding studio')).toBeTruthy()
    expect(getClassrooms).not.toHaveBeenCalled()
  })

  it('enrolls the student in the same ESL record and exposes it in the ESL filter', async () => {
    const user = userEvent.setup()
    preview()
    await user.click(screen.getByRole('button', { name: 'Join a class' }))
    await user.type(screen.getByLabelText('Classroom invite code'), 'owl-conversation')
    await user.click(screen.getByRole('button', { name: 'Join class' }))
    expect(await screen.findByText('English conversation club')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /^ESL/ }))
    expect(screen.getAllByRole('link', { name: /^View class / })).toHaveLength(3)
    expect(classroomPreviewStore.getSnapshot().filter(item => item.id === 'conversation-club')).toHaveLength(1)
    expect(classroomPreviewStore.getSnapshot().find(item => item.id === 'conversation-club')?.enrolledLearnerIds).toContain(PREVIEW_LEARNER_ID)
  })

  it('keeps a teacher announcement and learner reply shared across workspace navigation', async () => {
    const user = userEvent.setup()
    preview('/tutors/classrooms/algebra-coaching')
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Discussion')
    await user.selectOptions(screen.getByLabelText('Post type'), 'announcement')
    await user.type(screen.getByLabelText('Write a class post'), 'Please bring your practice notebook.')
    await user.click(screen.getByRole('button', { name: 'Post to class' }))
    await user.click(screen.getByRole('link', { name: 'Student preview' }))
    const featured = screen.getByRole('region', { name: 'Featured announcements' })
    expect(within(featured).getByText('Please bring your practice notebook.')).toBeTruthy()
    expect(screen.queryByLabelText('Post type')).toBeNull()
    const article = within(featured).getByText('Please bring your practice notebook.').closest('article')!
    await user.click(within(article).getByRole('button', { name: 'Reply' }))
    await user.type(within(article).getByLabelText('Reply to Daniel Cruz'), 'Ready for the next session!')
    await user.click(within(article).getByRole('button', { name: 'Submit' }))
    await user.click(screen.getByRole('link', { name: 'Tutor preview' }))
    const updated = screen.getByText('Please bring your practice notebook.').closest('article')!
    await user.click(within(updated).getByRole('button', { name: /1 reply/ }))
    expect(within(updated).getByText('Ready for the next session!')).toBeTruthy()
  })

  it('excludes drafts, unreleased feedback, other learner results, and join codes from the student projection', () => {
    const classroom = classroomPreviewStore.getSnapshot()[0]
    const student = classroomForPreviewRole(classroom, 'students')!
    expect(student.joinCode).toBeNull()
    expect(student.activities.every(item => item.status === 'Published')).toBe(true)
    expect(student.progress).toHaveLength(1)
    expect(student.progress.every(item => item.learnerId === PREVIEW_LEARNER_ID && item.released)).toBe(true)
    expect(classroomForPreviewRole(classroomPreviewStore.getSnapshot().find(item => item.id === 'conversation-club')!, 'students')).toBeUndefined()
    expect(classroomForPreviewRole(classroom, 'tutors')).toBeUndefined()
    expect(() => classroomPreviewStore.update(classroom.id, 'students', item => item, true)).toThrow()
  })

  it('shares a student submission with the teacher and only returns deliberately released feedback', async () => {
    const user = userEvent.setup()
    preview('/students/classrooms/algebra-coaching/classwork/algebra-coaching-activity')
    await user.type(screen.getByLabelText('Your response'), 'I used a balance to explain both sides of an equation.')
    await user.click(screen.getByRole('button', { name: 'Submit preview response' }))
    expect(screen.getByText('Your instructor has not released feedback yet.')).toBeTruthy()
    await user.click(screen.getByRole('link', { name: 'Tutor preview' }))
    await user.click(screen.getByRole('tab', { name: 'Classwork' }))
    await user.click(screen.getAllByRole('link', { name: /Review activity/ })[0])
    await user.type(screen.getByLabelText('Evaluation'), 'Reviewed')
    await user.type(screen.getByLabelText('Learner-visible feedback'), 'Your balance example explains the idea well.')
    await user.click(screen.getByRole('button', { name: 'Release preview feedback' }))
    await user.click(screen.getByRole('link', { name: 'Student preview' }))
    await user.click(screen.getByRole('tab', { name: 'Progress & Feedback' }))
    expect(screen.getByText('Your balance example explains the idea well.')).toBeTruthy()
    expect(screen.queryByText('Teacher review in progress')).toBeNull()
    expect(screen.queryByText('Private feedback for another learner.')).toBeNull()
  })

  it('keeps the classroom route and unrelated query parameters when selecting tabs', () => {
    preview('/students/classrooms/everyday-english?tab=materials&context=lesson')
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Materials')
    fireEvent.click(screen.getByRole('tab', { name: 'Schedule' }))
    expect(screen.getByText('Class schedule')).toBeTruthy()
    expect(screen.getByLabelText('Current preview URL').textContent).toBe('/students/classrooms/everyday-english?tab=schedule&context=lesson')
  })

  it('creates an empty tutor class, then enrolls the student using its preview code', async () => {
    const user = userEvent.setup()
    preview('/tutors/classrooms')
    await user.click(screen.getByRole('button', { name: 'Create class' }))
    await user.type(screen.getByLabelText('Classroom name'), 'Geometry together')
    await user.click(screen.getByRole('button', { name: 'Create classroom' }))
    const created = classroomPreviewStore.getSnapshot().find(item => item.name === 'Geometry together')!
    expect(created.ownerWorkspace).toBe('tutors')
    expect(created.enrolledLearnerIds).toHaveLength(0)
    await user.click(screen.getByRole('link', { name: 'Student preview' }))
    expect(screen.queryByText('Geometry together')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Join a class' }))
    await user.type(screen.getByLabelText('Classroom invite code'), created.joinCode!)
    await user.click(screen.getByRole('button', { name: 'Join class' }))
    await user.click(screen.getByRole('button', { name: /^Tutoring/ }))
    expect(await screen.findByRole('link', { name: 'View class Geometry together' })).toHaveProperty('href', expect.stringContaining(created.id))
    expect(classroomPreviewStore.getSnapshot().filter(item => item.id === created.id)).toHaveLength(1)
  })

  it('shares reaction counts between roles without treating another member’s reaction as your own', async () => {
    const user = userEvent.setup()
    preview('/students/classrooms/everyday-english')
    const article = screen.getByText('Start here · welcome to our class').closest('article')!
    await user.click(within(article).getByRole('button', { name: 'Add reaction' }))
    const choice = within(article).getAllByRole('button', { name: /^Add .+ reaction$/ })[0]
    const label = choice.getAttribute('aria-label')!.replace(/^Add /, '').replace(/ reaction$/, '')
    await user.click(choice)
    expect(within(article).getByRole('button', { name: `${label}, 1 reaction` }).getAttribute('aria-pressed')).toBe('true')
    await user.click(screen.getByRole('link', { name: 'ESL teacher preview' }))
    const teacherArticle = screen.getByText('Start here · welcome to our class').closest('article')!
    expect(within(teacherArticle).getByRole('button', { name: `${label}, 1 reaction` }).getAttribute('aria-pressed')).toBe('false')
  })
})
