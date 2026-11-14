import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getClassrooms, joinClassroomByCode } from '@/services/api/classroom.service'
import { ClassroomsView } from './classrooms-view'
import { TestSession } from './classroom-test-fixtures'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getClassrooms).mockResolvedValue([]) })
describe('classroom join accessibility', () => {
  it('labels the dialog and restores focus after discard', async () => {
    const user = userEvent.setup()
    render(<TestSession><ClassroomsView /></TestSession>)
    const trigger = screen.getByRole('button', { name: 'Join a class' })
    await user.click(trigger)
    expect(await screen.findByRole('dialog', { name: 'Join a classroom' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })
  it('keeps invalid codes and focuses the field after an API rejection', async () => {
    vi.mocked(joinClassroomByCode).mockRejectedValue(new Error('Join code is invalid.'))
    const user = userEvent.setup()
    render(<TestSession><ClassroomsView /></TestSession>)
    await user.click(screen.getByRole('button', { name: 'Join a class' }))
    const input = screen.getByLabelText('Classroom invite code') as HTMLInputElement
    await user.type(input, 'invalid-code')
    await user.click(screen.getByRole('button', { name: 'Join class' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Join code is invalid.')
    expect(input.value).toBe('invalid-code')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(input))
  })
})
