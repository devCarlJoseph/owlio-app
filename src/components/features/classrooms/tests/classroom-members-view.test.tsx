import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getClassroomMembers, getClassrooms } from '@/services/api/classroom.service'
import { ClassroomMembersView } from '../view/classroom-members-view'
import { TestSession } from './classroom-test-fixtures'
import type { Classroom } from '../types/classroom-types'
vi.mock('@/services/api/classroom.service', () => ({ getClassroomMembers: vi.fn(), getClassrooms: vi.fn() }))

afterEach(() => { cleanup(); vi.resetAllMocks() })
beforeEach(() => vi.mocked(getClassrooms).mockResolvedValue([]))
const classroom = { id: 'class-id', access: 'student' } as Classroom
const teacher = { id: 'teacher-id', name: 'Actual Teacher', role: 'owner' as const }
const learner = { id: 'student-id', name: 'Actual Student', role: 'student' as const }
const mount = () => render(<TestSession><ClassroomMembersView classroom={classroom} role="students" /></TestSession>)

describe('classroom participant directory', () => {
  it('lets students see only the owner and learners returned by the member endpoint', async () => {
    vi.mocked(getClassroomMembers).mockResolvedValue({ items: [teacher, learner], nextCursor: null })
    mount()
    expect(await screen.findByText('Actual Teacher')).toBeTruthy()
    expect(screen.getByText('Actual Student')).toBeTruthy()
    expect(screen.getByText('Class owner')).toBeTruthy()
    expect(getClassroomMembers).toHaveBeenCalledWith('class-id', undefined, expect.any(AbortSignal))
    expect(screen.queryByRole('button', { name: /remove|add|accept/i })).toBeNull()
  })
  it('paginates and deduplicates identities without requesting an owner-only roster', async () => {
    vi.mocked(getClassroomMembers).mockResolvedValueOnce({ items: [teacher], nextCursor: 'cursor' }).mockResolvedValueOnce({ items: [teacher, learner], nextCursor: null })
    mount()
    await userEvent.click(await screen.findByRole('button', { name: 'Load more members' }))
    expect(await screen.findByText('Actual Student')).toBeTruthy()
    expect(screen.getAllByText('Actual Teacher')).toHaveLength(1)
    expect(getClassroomMembers).toHaveBeenLastCalledWith('class-id', 'cursor', expect.any(AbortSignal))
  })
  it('shows a denied/error state instead of inventing an empty member list', async () => {
    vi.mocked(getClassroomMembers).mockRejectedValue(new Error('Classroom unavailable'))
    mount()
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('Classroom unavailable'))
    expect(screen.queryByText('No members to display.')).toBeNull()
  })
  it('aborts directory reads when leaving the classroom', async () => {
    vi.mocked(getClassroomMembers).mockImplementation(() => new Promise(() => {}))
    const view = mount()
    await waitFor(() => expect(getClassroomMembers).toHaveBeenCalled())
    const signal = vi.mocked(getClassroomMembers).mock.calls[0][2]!
    view.unmount()
    expect(signal.aborted).toBe(true)
  })
  it('rejects repeating pagination cursors', async () => {
    vi.mocked(getClassroomMembers).mockResolvedValue({ items: [teacher], nextCursor: 'same' })
    mount()
    await userEvent.click(await screen.findByRole('button', { name: 'Load more members' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('pagination could not continue'))
  })
  it('clears displayed identities when a later page denies classroom access', async () => {
    vi.mocked(getClassroomMembers).mockResolvedValueOnce({ items: [teacher], nextCursor: 'cursor' }).mockRejectedValueOnce(Object.assign(new Error('Classroom unavailable'), { isAxiosError: true, response: { status: 404 } }))
    mount()
    await screen.findByText('Actual Teacher')
    await userEvent.click(screen.getByRole('button', { name: 'Load more members' }))
    await screen.findByRole('alert')
    expect(screen.queryByText('Actual Teacher')).toBeNull()
  })
})
