import api from '@/lib/axios'
import { postApiWithCsrf } from './auth.service'
import type { ApiSuccess } from './api.types'

export type ApiClassroom = {
  id: string
  name: string
  subject: string
  description: string
  instructorName: string
  joinCode: string | null
  meetingId: string | null
  access: 'owner' | 'student'
}

export type CreateClassroomRequest = {
  name: string
  subject: string
  description: string
}

export async function getClassrooms() {
  const { data } = await api.get<ApiSuccess<ApiClassroom[]>>('/api/v1/classrooms')
  return data.data
}

export function createClassroom(input: CreateClassroomRequest) {
  return postApiWithCsrf<ApiClassroom>('/api/v1/classrooms', input)
}

export function joinClassroomByCode(joinCode: string) {
  return postApiWithCsrf<ApiClassroom>('/api/v1/classrooms/join', { joinCode })
}
