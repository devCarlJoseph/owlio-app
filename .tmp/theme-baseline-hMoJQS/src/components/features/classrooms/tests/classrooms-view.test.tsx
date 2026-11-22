import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createClassroom, deleteEndedClassroom, endClassroom, getClassrooms, joinClassroomByCode } from '@/services/api/classroom.service'
import { ClassroomsView } from '../view/classrooms-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, student, teacher } from './classroom-test-data'

vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn(), endClassroom: vi.fn(), deleteEndedClassroom: vi.fn() }))
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
  it.each([['EDUCATOR', '/educators'], ['ESL', '/esl'], ['TUTOR', '/tutors']] as const)(
    'requires %s owners to confirm deletion and keeps a failed deletion visible', async (role, path) => {
      const account = { ...teacher, roles: [role] }
      vi.mocked(getClassrooms).mockResolvedValue([{ ...classroom, ownerId: account.id, archivedAt: '2026-11-20T00:00:00Z' }])
      vi.mocked(deleteEndedClassroom).mockRejectedValueOnce(new Error('Deletion unavailable'))
        .mockResolvedValueOnce({ id: classroom.id })
      const user = userEvent.setup()
      render(<TestSession user={account} path={path + '/classrooms'}><ClassroomsView /></TestSession>)
      const options = await screen.findByRole('button', { name: 'More options for ' + classroom.name })
      options.focus()
      fireEvent.keyDown(options, { key: 'ArrowDown' })
      await user.click(await screen.findByRole('menuitem', { name: 'Delete classroom' }))
      const cancel = within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel' })
      await waitFor(() => expect(document.activeElement).toBe(cancel))
      await user.click(cancel)
      expect(deleteEndedClassroom).not.toHaveBeenCalled()
      options.focus()
      fireEvent.keyDown(options, { key: 'ArrowDown' })
      await user.click(await screen.findByRole('menuitem', { name: 'Delete classroom' }))
      const dialog = within(await screen.findByRole('dialog', { name: 'Delete classroom for everyone?' }))
      await user.click(dialog.getByRole('button', { name: 'Delete classroom' }))
      expect((await dialog.findByRole('alert')).textContent).toContain('Deletion unavailable')
      await user.click(dialog.getByRole('button', { name: 'Delete classroom' }))
      expect(await screen.findByText(classroom.name + ' was deleted for everyone.')).toBeTruthy()
      expect(screen.queryByText(classroom.name)).toBeNull()
    },
  )
  it('requires an active classroom to end before showing the delete action', async () => {
    const current = { ...classroom, ownerId: teacher.id }
    vi.mocked(getClassrooms).mockResolvedValue([current])
    vi.mocked(endClassroom).mockResolvedValue({ id: current.id, archivedAt: '2026-11-20T00:00:00Z' })
    const user = userEvent.setup()
    render(<TestSession user={teacher} path="/educators/classrooms"><ClassroomsView /></TestSession>)
    const options = await screen.findByRole('button', { name: 'More options for ' + current.name })
    options.focus()
    fireEvent.keyDown(options, { key: 'ArrowDown' })
    const end = await screen.findByRole('menuitem', { name: 'End classroom' })
    expect(screen.queryByRole('menuitem', { name: 'Delete classroom' })).toBeNull()
    await user.click(end)
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'End classroom' }))
    expect(await screen.findByText('Ended classroom')).toBeTruthy()
    options.focus()
    fireEvent.keyDown(options, { key: 'ArrowDown' })
    expect(await screen.findByRole('menuitem', { name: 'Delete classroom' })).toBeTruthy()
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
