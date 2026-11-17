import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '@/lib/axios'
import { mutateApiWithCsrf } from './auth.service'
import { getClassroomStudents } from './classroom.service'
import { getAttendanceRoster, getOwnAttendance, getSessionAttendance, saveAttendance } from './attendance.service'

vi.mock('@/lib/axios', () => ({ default: { get: vi.fn() } }))
vi.mock('./auth.service', () => ({ mutateApiWithCsrf: vi.fn() }))
vi.mock('./classroom.service', () => ({ getClassroomStudents: vi.fn() }))
const response = (items: unknown[], nextCursor: string | null = null) => ({ data: { status: 'success', data: { items, nextCursor } } })
beforeEach(() => vi.resetAllMocks())

describe('attendance API boundary', () => {
  it('loads every attendance page with cancellation and rejects repeated cursors', async () => {
    const signal = new AbortController().signal
    vi.mocked(api.get).mockResolvedValueOnce(response([{ studentId: 'learner', status: 'LATE', version: 1 }], 'next')).mockResolvedValueOnce(response([]))
    expect(await getSessionAttendance('session', signal)).toEqual([{ studentId: 'learner', status: 'LATE', version: 1 }])
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/sessions/session/attendance', { params: { limit: 50, cursor: 'next' }, signal })
    vi.mocked(api.get).mockResolvedValue(response([], 'loop'))
    await expect(getSessionAttendance('session')).rejects.toThrow('repeated page cursor')
  })
  it('uses explicit roll call for new records and observed versions for corrections', async () => {
    vi.mocked(mutateApiWithCsrf).mockResolvedValue({ studentId: 'learner', status: 'PRESENT', version: 1 })
    await saveAttendance('session', 'learner', 'PRESENT', 0)
    expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('PUT', '/api/v1/sessions/session/attendance/learner', { status: 'PRESENT', expectedVersion: 0, reasonCode: 'MANUAL_ROLL_CALL' })
    await saveAttendance('session', 'learner', 'ABSENT', 3)
    expect(mutateApiWithCsrf).toHaveBeenLastCalledWith('PUT', '/api/v1/sessions/session/attendance/learner', { status: 'ABSENT', expectedVersion: 3, reasonCode: 'TEACHER_CORRECTION' })
    vi.mocked(mutateApiWithCsrf).mockRejectedValue(new Error('STALE_ATTENDANCE'))
    await expect(saveAttendance('session', 'learner', 'ABSENT', 3)).rejects.toThrow('STALE_ATTENDANCE')
  })
  it('uses the self-scoped endpoint for learners and rejects invalid statuses', async () => {
    vi.mocked(api.get).mockResolvedValue(response([{ sessionId: 'session', startsAt: '2026-11-18T01:00:00Z', status: 'PRESENT' }]))
    expect(await getOwnAttendance('class')).toHaveLength(1)
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/classrooms/class/attendance/me', { params: { limit: 50 }, signal: undefined })
    vi.mocked(api.get).mockResolvedValue(response([{ studentId: 'learner', status: 'JOINED', version: 1 }]))
    await expect(getSessionAttendance('session')).rejects.toThrow()
  })
  it('loads the whole roster and detects broken pagination', async () => {
    vi.mocked(getClassroomStudents).mockResolvedValueOnce({ items: [{ studentId: 'one', name: 'One', joinedAt: '' }], nextCursor: 'next' }).mockResolvedValueOnce({ items: [{ studentId: 'two', name: 'Two', joinedAt: '' }], nextCursor: null })
    expect(await getAttendanceRoster('class')).toHaveLength(2)
    vi.mocked(getClassroomStudents).mockResolvedValue({ items: [], nextCursor: 'loop' })
    await expect(getAttendanceRoster('class')).rejects.toThrow('roster repeated')
  })
})
