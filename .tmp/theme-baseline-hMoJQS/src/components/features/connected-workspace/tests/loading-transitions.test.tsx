import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getPersonalNotes, getPersonalSubjects, getPersonalTasks } from '@/services/api/personal-workspace.service'
import { PersonalNotes, PersonalSubjects, PersonalTasks } from '../view/personal-workspace'

vi.mock('@/services/api/personal-workspace.service', () => ({
  getPersonalNotes: vi.fn(), getPersonalSubjects: vi.fn(), getPersonalTasks: vi.fn(),
  archivePersonalSubject: vi.fn(), deletePersonalNote: vi.fn(), savePersonalNote: vi.fn(),
  savePersonalSubject: vi.fn(), savePersonalTask: vi.fn(), togglePersonalTask: vi.fn(),
}))

afterEach(cleanup)
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getPersonalSubjects).mockResolvedValue([]) })

describe('account loading lifecycle', () => {
  it.each([
    { View: PersonalSubjects, load: getPersonalSubjects, form: 'Subject editor', empty: 'No subjects yet. Add your first subject above.' },
    { View: PersonalTasks, load: getPersonalTasks, form: 'Task editor', empty: 'No tasks yet.' },
    { View: PersonalNotes, load: getPersonalNotes, form: 'Note editor', empty: 'No notes yet.' },
  ])('replaces the skeleton with the $form after the request completes', async ({ View, load, form, empty }) => {
    let finish!: () => void
    vi.mocked(load).mockImplementation(() => new Promise<never[]>(resolve => { finish = () => resolve([]) }))
    render(<MemoryRouter><View /></MemoryRouter>)
    expect(screen.getByRole('status', { name: 'Loading your records…' })).toBeTruthy()
    expect(screen.queryByRole('form', { name: form })).toBeNull()
    expect(screen.queryByText(empty)).toBeNull()
    await act(async () => finish())
    expect(screen.queryByRole('status', { name: 'Loading your records…' })).toBeNull()
    expect(screen.getByRole('form', { name: form })).toBeTruthy()
    expect(screen.getByText(empty)).toBeTruthy()
  })

  it('leaves loading on failure and restores the skeleton while retrying', async () => {
    let finish!: () => void
    // The initial request fails; the next request stays pending until explicitly completed.
    vi.mocked(getPersonalTasks)
      .mockRejectedValueOnce(new Error('Task service unavailable'))
      .mockImplementationOnce(() => new Promise(resolve => { finish = () => resolve([]) }))
    render(<MemoryRouter><PersonalTasks /></MemoryRouter>)
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Task service unavailableTry again')
    expect(screen.queryByRole('status', { name: 'Loading your records…' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByRole('status', { name: 'Loading your records…' })).toBeTruthy()
    await act(async () => finish())
    expect(screen.getByRole('form', { name: 'Task editor' })).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
