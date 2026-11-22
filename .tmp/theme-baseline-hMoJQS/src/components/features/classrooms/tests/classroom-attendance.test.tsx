import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ClassroomAttendanceView, SessionAttendanceRegister } from '../view/classroom-attendance-view'
import type { Classroom } from '../types/classroom-types'
import type { ScheduledSession } from '@/services/api/meeting.service'
import { getAttendanceRoster, getOwnAttendance, getSessionAttendance, saveAttendance } from '@/services/api/attendance.service'

const auth = vi.hoisted(() => ({ user: { id: 'student', roles: ['STUDENT'] } }))
vi.mock('@/components/features/auth/context/auth-session-context', () => ({ useAuthSession: () => auth }))
vi.mock('@/services/api/attendance.service', async importOriginal => ({ ...await importOriginal<typeof import('@/services/api/attendance.service')>(), getAttendanceRoster: vi.fn(), getOwnAttendance: vi.fn(), getSessionAttendance: vi.fn(), saveAttendance: vi.fn() }))
const session: ScheduledSession = { id: 'session', title: 'English class', startsAt: '2026-11-18T01:00:00Z', endsAt: '2026-11-18T02:00:00Z', mode: 'ONLINE', status: 'SCHEDULED', version: 0 }
beforeEach(() => {
  auth.user = { id: 'student', roles: ['STUDENT'] }
  vi.mocked(getAttendanceRoster).mockResolvedValue([{ studentId: 'one', name: 'Alex Lee', joinedAt: '' }, { studentId: 'two', name: 'Sam Tan', joinedAt: '' }])
  vi.mocked(getSessionAttendance).mockResolvedValue([{ studentId: 'one', status: 'PRESENT', version: 2 }])
})
afterEach(() => { cleanup(); vi.resetAllMocks() })

describe('shared classroom and meeting attendance register', () => {
  it('keeps missing records unrecorded and saves corrections with the observed version', async () => {
    vi.mocked(saveAttendance).mockResolvedValue({ studentId: 'one', status: 'LATE', version: 3 })
    render(<SessionAttendanceRegister classroomId="class" session={session} />)
    await screen.findByText('Alex Lee')
    expect(screen.getByRole('combobox', { name: 'Attendance for Sam Tan' }).textContent).toContain('Not recorded')
    await userEvent.click(screen.getByRole('combobox', { name: 'Attendance for Alex Lee' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Late' }))
    await screen.findByText(/Attendance saved for Alex/)
    expect(saveAttendance).toHaveBeenCalledWith('session', 'one', 'LATE', 2)
    expect(screen.getByRole('combobox', { name: 'Attendance for Alex Lee' }).textContent).toContain('Late')
    await userEvent.type(screen.getByRole('textbox', { name: 'Search learner' }), 'Sam')
    expect(screen.queryByText('Alex Lee')).toBeNull()
    expect(screen.getByText('Sam Tan')).toBeTruthy()
  })
  it('reports conflicting saves and reloads instead of claiming success', async () => {
    vi.mocked(saveAttendance).mockRejectedValue(new Error('Attendance record changed.'))
    render(<SessionAttendanceRegister classroomId="class" session={session} />)
    await userEvent.click(await screen.findByRole('combobox', { name: 'Attendance for Sam Tan' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Absent' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Attendance record changed.')
    expect(screen.queryByText(/Attendance saved for/)).toBeNull()
    expect(getSessionAttendance).toHaveBeenCalledTimes(2)
  })
  it('keeps cancelled sessions read only', async () => {
    render(<SessionAttendanceRegister classroomId="class" session={{ ...session, status: 'CANCELLED' }} />)
    const control = await screen.findByRole('combobox', { name: 'Attendance for Alex Lee' })
    expect(control.hasAttribute('disabled')).toBe(true)
    expect(saveAttendance).not.toHaveBeenCalled()
  })
  it('loads only the current learner’s own records', async () => {
    vi.mocked(getOwnAttendance).mockResolvedValue([{ sessionId: 'session', status: 'EXCUSED', startsAt: session.startsAt }])
    render(<ClassroomAttendanceView classroom={{ id: 'class', ownerId: 'teacher', access: 'student' } as Classroom} />)
    expect(await screen.findByText('Excused')).toBeTruthy()
    expect(getAttendanceRoster).not.toHaveBeenCalled()
    expect(getSessionAttendance).not.toHaveBeenCalled()
    expect(within(screen.getByRole('list')).queryByRole('combobox')).toBeNull()
  })
})
