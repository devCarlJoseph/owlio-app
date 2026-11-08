import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createClassroom, getClassrooms, joinClassroomByCode } from '@/services/api/classroom.service'
import { ClassroomsView } from './classrooms-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, student, teacher } from './classroom-test-data'

vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getClassrooms).mockResolvedValue([]) })
describe('API classroom list', () => {
  it('has no sample classes when the API returns empty', async () => {
    render(<TestSession><ClassroomsView /></TestSession>)
    expect(await screen.findByText('No classes joined yet')).toBeTruthy()
    expect(screen.queryByText('Biology 101')).toBeNull()
    expect(screen.queryByText(/demo previews/i)).toBeNull()
  })
  it('loads only API classrooms', async () => {
    vi.mocked(getClassrooms).mockResolvedValue([classroom])
    render(<TestSession><ClassroomsView /></TestSession>)
    expect(await screen.findByText(classroom.name)).toBeTruthy()
  })
  it('keeps grid and list views backed by the same server records', async () => {
    vi.mocked(getClassrooms).mockResolvedValue([classroom])
    const user = userEvent.setup()
    render(<TestSession><ClassroomsView /></TestSession>)
    await screen.findByText(classroom.name)
    await user.click(screen.getByRole('button', { name: /list view/i }))
    expect(screen.getByRole('table', { name: 'Classes' })).toBeTruthy()
    expect(screen.getByText(classroom.name)).toBeTruthy()
  })
  it('shows an error instead of sample data on a failed load', async () => {
    vi.mocked(getClassrooms).mockRejectedValue(new Error('Service unavailable'))
    render(<TestSession><ClassroomsView /></TestSession>)
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('Service unavailable'))
    expect(screen.queryByText('No classes joined yet')).toBeNull()
    expect(screen.queryByText('Biology 101')).toBeNull()
  })
  it.each(['ESL', 'TUTOR'] as const)('lets %s create through the API', async role => {
    const account = { ...teacher, roles: [role] }
    vi.mocked(createClassroom).mockResolvedValue({ classroom, joinCode: 'a'.repeat(43) })
    const user = userEvent.setup()
    render(<TestSession user={account} path={role === 'ESL' ? '/esl/classrooms' : '/tutors/classrooms'}><ClassroomsView /></TestSession>)
    await screen.findByText('No classrooms yet')
    await user.click(screen.getByRole('button', { name: 'Create class' }))
    await user.type(screen.getByLabelText('Classroom name'), classroom.name)
    expect(screen.queryByLabelText('Subject or learning focus')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Create classroom' }))
    await waitFor(() => expect(createClassroom).toHaveBeenCalledWith({ name: classroom.name, description: '' }))
    expect(await screen.findByText(/was created/)).toBeTruthy()
  })
  it('does not claim creation succeeded if the API rejects it', async () => {
    vi.mocked(createClassroom).mockRejectedValue(new Error('Creation denied'))
    const user = userEvent.setup()
    render(<TestSession user={teacher} path="/educators/classrooms"><ClassroomsView /></TestSession>)
    await user.click(screen.getByRole('button', { name: 'Create class' }))
    await user.type(screen.getByLabelText('Classroom name'), 'Math')
    await user.click(screen.getByRole('button', { name: 'Create classroom' }))
    expect(await screen.findByText('Creation denied')).toBeTruthy()
    expect(screen.queryByText(/was created/)).toBeNull()
  })
  it('waits for server enrollment and prevents duplicate submissions', async () => {
    let resolve!: (value: typeof classroom) => void
    vi.mocked(joinClassroomByCode).mockReturnValue(new Promise(done => { resolve = done }))
    const user = userEvent.setup()
    render(<TestSession><ClassroomsView /></TestSession>)
    await user.click(screen.getByRole('button', { name: 'Join a class' }))
    await user.type(screen.getByLabelText('Classroom invite code'), 'a'.repeat(43))
    await user.click(screen.getByRole('button', { name: 'Join class' }))
    expect((screen.getByRole('button', { name: 'Joining…' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByText(/was added/)).toBeNull()
    expect(joinClassroomByCode).toHaveBeenCalledTimes(1)
    resolve(classroom)
    expect(await screen.findByText(/was added to your class list/)).toBeTruthy()
  })
  it('ignores the old account request when it finishes after account switching', async () => {
    let resolveOld!: (value: typeof classroom[]) => void
    vi.mocked(getClassrooms).mockReturnValueOnce(new Promise(done => { resolveOld = done }))
    const view = render(<TestSession user={student}><ClassroomsView /></TestSession>)
    const differentClass = { ...classroom, name: 'New account class' }
    vi.mocked(getClassrooms).mockResolvedValueOnce([differentClass])
    view.rerender(<TestSession user={{ ...student, id: 'different-id' }}><ClassroomsView /></TestSession>)
    await screen.findByText(differentClass.name)
    await act(async () => { resolveOld([classroom]) })
    expect(screen.queryByText(classroom.name)).toBeNull()
    expect(screen.getByText(differentClass.name)).toBeTruthy()
  })
  it('clears the previous account classes and ignores late responses', async () => {
    vi.mocked(getClassrooms).mockResolvedValueOnce([classroom])
    const nextClass = { ...classroom, id: 'other-class', name: 'Other account class' }
    const view = render(<TestSession user={student}><ClassroomsView /></TestSession>)
    await screen.findByText(classroom.name)
    let resolve!: (value: typeof classroom[]) => void
    vi.mocked(getClassrooms).mockReturnValueOnce(new Promise(done => { resolve = done }))
    view.rerender(<TestSession user={{ ...student, id: 'different-user' }}><ClassroomsView /></TestSession>)
    expect(screen.queryByText(classroom.name)).toBeNull()
    resolve([nextClass])
    expect(await screen.findByText(nextClass.name)).toBeTruthy()
    view.rerender(<TestSession user={null}><ClassroomsView /></TestSession>)
    expect(screen.queryByText(nextClass.name)).toBeNull()
  })
})
