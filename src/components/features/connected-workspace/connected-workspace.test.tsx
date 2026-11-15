import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthSessionContext, type AuthSessionContextValue } from '@/components/features/auth/auth-session-context'
import { getPersonalNotes, getPersonalSubjects, getPersonalTasks, savePersonalNote, togglePersonalTask } from '@/services/api/personal-workspace.service'
import { PersonalNotes, PersonalTasks } from './personal-workspace'
import { ApiWorkspaceContent } from './api-workspace-content'
import { useAccountRecords } from './use-account-records'

vi.mock('@/services/api/personal-workspace.service', () => ({ getPersonalNotes: vi.fn(), getPersonalSubjects: vi.fn(), getPersonalTasks: vi.fn(), getNotifications: vi.fn(), savePersonalNote: vi.fn(), savePersonalSubject: vi.fn(), savePersonalTask: vi.fn(), togglePersonalTask: vi.fn(), archivePersonalSubject: vi.fn(), deletePersonalNote: vi.fn(), markNotificationRead: vi.fn() }))
const id = '11111111-1111-4111-8111-111111111111'
const session: AuthSessionContextValue = { user: { id, name: 'Test', email: 'test@example.test', roles: ['STUDENT'], status: 'ACTIVE', emailVerifiedAt: '2026-11-14T00:00:00Z', createdAt: '2026-11-14T00:00:00Z' }, status: 'authenticated', error: null, signIn: vi.fn(), signOut: vi.fn(), refreshCurrentUser: vi.fn() }
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getPersonalSubjects).mockResolvedValue([]); vi.mocked(getPersonalNotes).mockResolvedValue([]); vi.mocked(getPersonalTasks).mockResolvedValue([]) })
afterEach(cleanup)
function open(path: string, content: React.ReactNode) {
  return render(<MemoryRouter initialEntries={[path]}><AuthSessionContext.Provider value={session}>{content}</AuthSessionContext.Provider></MemoryRouter>)
}

describe('restored workspace layouts and separate account records', () => {
  it.each(['/students', '/students/schedule', '/students/subjects', '/students/tasks', '/students/notes', '/students/study-spaces?preview=1', '/students/materials', '/tutors/learning-plans', '/esl/lessons', '/educators/attendance', '/students/classrooms/meeting-room'])('mounts the original page at %s', path => {
    const child = vi.fn(() => <p>Original workspace layout</p>)
    const Child = child
    open(path, <ApiWorkspaceContent><Child /></ApiWorkspaceContent>)
    expect(screen.getByText('Original workspace layout')).toBeTruthy()
    expect(child).toHaveBeenCalled()
    expect(screen.queryByText('This workspace is not available yet.')).toBeNull()
    expect(getPersonalSubjects).not.toHaveBeenCalled()
    expect(getPersonalTasks).not.toHaveBeenCalled()
    expect(getPersonalNotes).not.toHaveBeenCalled()
  })
  it('opens account notes separately and returns to the original editor without changing device records', async () => {
    localStorage.setItem('owlio-personal-notes-v1', JSON.stringify([{ title: 'Old local note' }]))
    open('/students/notes?label=study', <ApiWorkspaceContent><p>Original notes editor</p></ApiWorkspaceContent>)
    const accountLink = screen.getByRole('link', { name: 'Account records' })
    expect(accountLink.getAttribute('href')).toBe('/students/notes?label=study&source=account')
    fireEvent.click(accountLink)
    expect(await screen.findByText('No notes yet.')).toBeTruthy()
    expect(screen.queryByText('Original notes editor')).toBeNull()
    fireEvent.click(screen.getByRole('link', { name: 'On this device' }))
    expect(screen.getByText('Original notes editor')).toBeTruthy()
    expect(localStorage.getItem('owlio-personal-notes-v1')).toContain('Old local note')
    localStorage.removeItem('owlio-personal-notes-v1')
  })
  it('keeps account subject links in the account collection', async () => {
    vi.mocked(getPersonalSubjects).mockResolvedValue([{ id, name: 'Account subject', description: '', archivedAt: null, version: 0 }])
    open('/students/subjects?source=account', <ApiWorkspaceContent><p>Device subjects</p></ApiWorkspaceContent>)
    expect((await screen.findByRole('link', { name: 'Account subject' })).getAttribute('href')).toBe('/students/subjects/' + id + '?source=account')
    expect(screen.queryByText('Device subjects')).toBeNull()
  })
  it('preserves pre-existing local records while showing account data only', async () => {
    localStorage.setItem('owlio-personal-notes-v1', JSON.stringify([{ title: 'Old local note' }]))
    open('/students/notes', <PersonalNotes />)
    expect(await screen.findByText('No notes yet.')).toBeTruthy()
    expect(screen.queryByText('Old local note')).toBeNull()
    expect(localStorage.getItem('owlio-personal-notes-v1')).toContain('Old local note')
    localStorage.removeItem('owlio-personal-notes-v1')
  })
  it('keeps the note draft after a rejected save and adds only a confirmed record', async () => {
    vi.mocked(savePersonalNote).mockRejectedValueOnce(new Error('Save unavailable')).mockResolvedValueOnce({ id, subjectId: null, title: 'A draft', content: 'Keep my text', version: 0 })
    open('/students/notes', <PersonalNotes />)
    await screen.findByRole('form', { name: 'Note editor' })
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A draft' } })
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Keep my text' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Save unavailable')
    expect((screen.getByLabelText('Content') as HTMLTextAreaElement).value).toBe('Keep my text')
    expect(screen.queryByRole('heading', { name: 'A draft' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Save note' }))
    expect(await screen.findByRole('heading', { name: 'A draft' })).toBeTruthy()
    expect((screen.getByLabelText('Content') as HTMLTextAreaElement).value).toBe('')
    expect(savePersonalNote).toHaveBeenCalledWith({ title: 'A draft', content: 'Keep my text', subjectId: null }, undefined)
  })
  it('retains the last confirmed task state when a versioned transition fails', async () => {
    const task = { id, title: 'My task', dueAt: null, completedAt: null, version: 3 }
    vi.mocked(getPersonalTasks).mockResolvedValue([task]); vi.mocked(togglePersonalTask).mockRejectedValue(new Error('Task changed. Reload first.'))
    open('/students/tasks', <PersonalTasks />)
    fireEvent.click(await screen.findByRole('button', { name: 'Mark complete' }))
    await screen.findByRole('alert')
    expect(screen.getByText('To do')).toBeTruthy()
    expect(togglePersonalTask).toHaveBeenCalledOnce()
  })
  it('shows a load error rather than an empty or local collection', async () => {
    vi.mocked(getPersonalNotes).mockRejectedValue(new Error('Server unavailable'))
    open('/students/notes', <PersonalNotes />)
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Server unavailableTry again')
    expect(screen.queryByText('No notes yet.')).toBeNull()
  })
})

describe('account read lifecycle', () => {
  it('cancels an old account read and ignores its late completion after remount', async () => {
    let finish!: (value: string[]) => void
    const first = vi.fn<(signal?: AbortSignal) => Promise<string[]>>().mockImplementation(() => new Promise<string[]>(resolve => { finish = resolve }))
    const second = vi.fn<(signal?: AbortSignal) => Promise<string[]>>().mockResolvedValue(['New account'])
    function Records({ load }: { load: (signal?: AbortSignal) => Promise<string[]> }) {
      const state = useAccountRecords(load)
      return <p>{state.records.join(',')}</p>
    }
    const view = render(<Records key="first" load={first} />)
    const signal = first.mock.calls[0][0]
    view.rerender(<Records key="second" load={second} />)
    await screen.findByText('New account')
    expect(signal?.aborted).toBe(true)
    await act(async () => finish(['Old private record']))
    await waitFor(() => expect(screen.queryByText('Old private record')).toBeNull())
  })
})
