import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { MeetingAttendance } from '../ui/meeting-attendance'
import { ClassroomAttendanceView } from '@/components/features/classrooms/view/classroom-attendance-view'
import type { Classroom } from '@/components/features/classrooms/types/classroom-types'
import { getClassrooms } from '@/services/api/classroom.service'
import { requestOperation } from '@/services/api/contract-client'
import { getClassroomSessions } from '@/services/api/meeting.service'
import { getAttendanceRoster, getSessionAttendance, saveAttendance, type AttendanceRecord } from '@/services/api/attendance.service'

vi.mock('@/components/features/auth/context/auth-session-context', () => ({ useAuthSession: () => ({ user: { id: 'teacher', roles: ['EDUCATOR'] } }) }))
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn() }))
vi.mock('@/services/api/contract-client', () => ({ requestOperation: vi.fn() }))
vi.mock('@/services/api/meeting.service', () => ({ getClassroomSessions: vi.fn() }))
vi.mock('@/services/api/attendance.service', async original => ({ ...await original<typeof import('@/services/api/attendance.service')>(), getAttendanceRoster: vi.fn(), getSessionAttendance: vi.fn(), saveAttendance: vi.fn() }))
afterEach(() => { cleanup(); vi.resetAllMocks() })

it('saves an online roll call and reads that record from the classroom tab', async () => {
  const startsAt = new Date().toISOString()
  const session = { id: 'session', title: 'Online lesson', startsAt, endsAt: startsAt, mode: 'ONLINE' as const, status: 'SCHEDULED' as const, version: 0 }
  let records: AttendanceRecord[] = []
  vi.mocked(getClassrooms).mockResolvedValue([{ id: 'class', ownerId: 'teacher', name: 'English', description: '', createdAt: startsAt }])
  vi.mocked(requestOperation).mockResolvedValue({ isHost: true, startsAt } as never)
  vi.mocked(getClassroomSessions).mockResolvedValue([session])
  vi.mocked(getAttendanceRoster).mockResolvedValue([{ studentId: 'learner', name: 'Alex Lee', joinedAt: startsAt }])
  vi.mocked(getSessionAttendance).mockImplementation(async () => records)
  vi.mocked(saveAttendance).mockImplementation(async (_sessionId, studentId, status) => {
    const saved = { studentId, status, version: 1 }; records = [saved]; return saved
  })
  const meeting = render(<MemoryRouter><MeetingAttendance sessionId="session" role="educators" /></MemoryRouter>)
  expect(getSessionAttendance).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Take attendance' }))
  await userEvent.click(await screen.findByRole('combobox', { name: 'Attendance for Alex Lee' }))
  await userEvent.click(await screen.findByRole('option', { name: 'Present' }))
  await screen.findByText(/Attendance saved for Alex/)
  expect(screen.getByRole('link', { name: 'Open English attendance' }).getAttribute('href')).toBe('/educators/classrooms/class?tab=attendance')
  meeting.unmount()
  render(<ClassroomAttendanceView classroom={{ id: 'class', access: 'owner', ownerId: 'teacher' } as Classroom} />)
  const saved = await screen.findByRole('combobox', { name: 'Attendance for Alex Lee' })
  expect(saved.textContent).toContain('Present')
  expect(saveAttendance).toHaveBeenCalledTimes(1)
})

it('refuses to resolve a register when the server says the caller is not the host', async () => {
  vi.mocked(getClassrooms).mockResolvedValue([])
  vi.mocked(requestOperation).mockResolvedValue({ isHost: false } as never)
  render(<MemoryRouter><MeetingAttendance sessionId="session" role="educators" /></MemoryRouter>)
  await userEvent.click(screen.getByRole('button', { name: 'Take attendance' }))
  expect((await screen.findByRole('alert')).textContent).toContain('Only the classroom owner')
  expect(getClassroomSessions).not.toHaveBeenCalled()
  expect(saveAttendance).not.toHaveBeenCalled()
})
