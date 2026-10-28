import api from '@/lib/axios'
import type { AxiosResponse } from 'axios'
import { postApiWithCsrf } from './auth.service'
import type { ApiSuccess } from './api.types'

export type ApiClassroom = { id: string; ownerId: string; name: string; description: string; createdAt: string }
export type ApiPage<T> = { items: T[]; nextCursor: string | null }
export type ApiStudent = { studentId: string; name: string; joinedAt: string }
export type CreateClassroomRequest = { name: string; description: string }
export type CreatedClassroom = { classroom: ApiClassroom; joinCode: string }
export type Enrollment = { id: string; classroomId: string; studentId: string; joinedAt: string }

export async function getClassrooms(signal?: AbortSignal) {
  const items: ApiClassroom[] = []
  const seen = new Set<string>()
  let cursor: string | null = null
  do {
    const response: AxiosResponse<ApiSuccess<ApiPage<ApiClassroom>>> = await api.get<ApiSuccess<ApiPage<ApiClassroom>>>('/api/v1/classrooms', {
      params: { limit: 50, ...(cursor ? { cursor } : {}) }, signal,
    })
    const page: ApiPage<ApiClassroom> = response.data.data
    if (!Array.isArray(page.items)) throw new Error('The classroom service returned an invalid response.')
    items.push(...page.items)
    cursor = page.nextCursor
    if (cursor && seen.has(cursor)) throw new Error('Classroom pagination could not continue. Please retry.')
    if (cursor) seen.add(cursor)
  } while (cursor)
  return items
}

export function createClassroom(input: CreateClassroomRequest) {
  return postApiWithCsrf<CreatedClassroom>('/api/v1/classrooms', { name: input.name, description: input.description })
}

export async function getClassroom(id: string, signal?: AbortSignal) {
  const response = await api.get<ApiSuccess<ApiClassroom>>('/api/v1/classrooms/' + encodeURIComponent(id), { signal })
  return response.data.data
}

export async function joinClassroomByCode(joinCode: string) {
  const enrollment = await postApiWithCsrf<Enrollment>('/api/v1/classrooms/join', { joinCode })
  try { return await getClassroom(enrollment.classroomId) }
  catch { throw new Error('Enrollment was confirmed, but classroom details could not be loaded. Reload your classes before trying again.') }
}

export async function getClassroomStudents(id: string, cursor?: string, signal?: AbortSignal) {
  const response = await api.get<ApiSuccess<ApiPage<ApiStudent>>>('/api/v1/classrooms/' + encodeURIComponent(id) + '/students', {
    params: { limit: 50, ...(cursor ? { cursor } : {}) }, signal,
  })
  return response.data.data
}
