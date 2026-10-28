import type { AuthUser } from '@/services/api/api.types'
import type { ApiClassroom } from '@/services/api/classroom.service'

export const student: AuthUser = { id: 'student-id', name: 'Student Account', email: 'student@example.test',
  roles: ['STUDENT'], status: 'ACTIVE', emailVerifiedAt: '2026-01-01', createdAt: '2026-01-01' }
export const teacher: AuthUser = { ...student, id: 'teacher-id', name: 'Teacher Account', roles: ['EDUCATOR'] }
export const classroom: ApiClassroom = { id: 'class-id', ownerId: teacher.id, name: 'Server Mathematics', description: 'From the API', createdAt: '2026-01-01' }
