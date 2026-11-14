import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getClassroomStudents } from '@/services/api/classroom.service'
import { ClassroomMembersView } from './classroom-members-view'
import type { Classroom } from './classroom-types'
vi.mock('@/services/api/classroom.service', () => ({ getClassroomStudents: vi.fn() }))
afterEach(() => { cleanup(); vi.resetAllMocks() })
const classroom = { id: 'class-id', access: 'owner' } as Classroom
describe('API classroom roster', () => {
  it('renders only students returned by the service', async () => {
    vi.mocked(getClassroomStudents).mockResolvedValue({ items: [{ studentId: 'real-id', name: 'Actual Student', joinedAt: '2026-01-01' }], nextCursor: null })
    render(<ClassroomMembersView classroom={classroom} role="educators" />)
    expect(await screen.findByText('Actual Student')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /remove|add|accept/i })).toBeNull()
  })
  it('does not request the owner-only roster for students', () => {
    render(<ClassroomMembersView classroom={{ ...classroom, access: 'student' }} role="students" />)
    expect(screen.getByText(/Only the classroom owner/)).toBeTruthy()
    expect(getClassroomStudents).not.toHaveBeenCalled()
  })
  it('distinguishes service errors from empty rosters', async () => {
    vi.mocked(getClassroomStudents).mockRejectedValue(new Error('Not authorized'))
    render(<ClassroomMembersView classroom={classroom} role="educators" />)
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('Not authorized'))
    expect(screen.queryByText('No students have joined yet.')).toBeNull()
  })
})
