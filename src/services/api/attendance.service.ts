import { collectOperation, requestOperation } from './contract-client'
import { getClassroomStudents, type ApiStudent } from './classroom.service'

export const attendanceStatuses = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const
export type AttendanceStatus = typeof attendanceStatuses[number]
export type AttendanceRecord = { studentId: string; status: AttendanceStatus; version: number }

export const getSessionAttendance = (sessionId: string, signal?: AbortSignal) =>
  collectOperation('GET /api/v1/sessions/{sessionId}/attendance', { params: { sessionId }, signal })

export const getOwnAttendance = (classroomId: string, signal?: AbortSignal) =>
  collectOperation('GET /api/v1/classrooms/{classroomId}/attendance/me', { params: { classroomId }, signal })

export function saveAttendance(sessionId: string, studentId: string, status: AttendanceStatus, expectedVersion: number) {
  return requestOperation('PUT /api/v1/sessions/{sessionId}/attendance/{studentId}', {
    params: { sessionId, studentId },
    body: { status, expectedVersion, reasonCode: expectedVersion === 0 ? 'MANUAL_ROLL_CALL' : 'TEACHER_CORRECTION' },
  })
}

export async function getAttendanceRoster(classroomId: string, signal?: AbortSignal) {
  const items: ApiStudent[] = []
  const seen = new Set<string>()
  let cursor: string | undefined
  do {
    const page = await getClassroomStudents(classroomId, cursor, signal)
    items.push(...page.items)
    cursor = page.nextCursor ?? undefined
    if (cursor && seen.has(cursor)) throw new Error('The roster repeated a page. Please refresh.')
    if (cursor) seen.add(cursor)
  } while (cursor)
  return [...new Map(items.map(item => [item.studentId, item])).values()]
}
