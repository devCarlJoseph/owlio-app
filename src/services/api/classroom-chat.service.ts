import { z } from 'zod'
import api from '@/lib/axios'
import { postApiWithCsrf } from './auth.service'

const message = z.object({
  id: z.uuid(), authorId: z.uuid(), authorName: z.string(), authorRole: z.enum(['student', 'educator']),
  body: z.string(), createdAt: z.string(),
  replyTo: z.object({ messageId: z.uuid(), authorName: z.string(), excerpt: z.string() }).nullable(),
})
const cursor = z.object({ beforeCreatedAt: z.string(), beforeId: z.uuid() })
export type ClassroomChatMessage = z.infer<typeof message>
export type ClassroomChatCursor = z.infer<typeof cursor>
const path = (classroomId: string) => '/api/v1/classrooms/' + encodeURIComponent(classroomId) + '/messages'
export async function getClassroomMessages(classroomId: string, before?: ClassroomChatCursor, signal?: AbortSignal) {
  return z.object({ status: z.literal('success'), data: z.object({ items: z.array(message), next: cursor.nullable() }) })
    .parse((await api.get<unknown>(path(classroomId), { params: { limit: 50, ...before }, signal })).data).data
}
export async function sendClassroomMessage(classroomId: string, requestId: string, body: string, replyToId: string | null) {
  return message.parse(await postApiWithCsrf(path(classroomId), { requestId, body, replyToId }))
}
