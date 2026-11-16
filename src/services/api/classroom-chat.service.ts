import { z } from 'zod'
import api from '@/lib/axios'
import { postApiWithCsrf } from './auth.service'

const message = z.object({
  id: z.uuid(), authorId: z.uuid(), authorName: z.string(), authorRole: z.enum(['student', 'educator']),
  body: z.string(), createdAt: z.string(),
  replyTo: z.object({ messageId: z.uuid(), authorName: z.string(), excerpt: z.string() }).nullable(),
  mentionUserIds: z.array(z.uuid()).optional(), mentionStudents: z.boolean().optional(),
})
const cursor = z.object({ beforeCreatedAt: z.string(), beforeId: z.uuid() })
export type ClassroomChatMessage = z.infer<typeof message>
export type ClassroomChatCursor = z.infer<typeof cursor>
const path = (classroomId: string) => '/api/v1/classrooms/' + encodeURIComponent(classroomId) + '/messages'
export async function getClassroomMessages(classroomId: string, before?: ClassroomChatCursor, signal?: AbortSignal) {
  return z.object({ status: z.literal('success'), data: z.object({ items: z.array(message), next: cursor.nullable() }) })
    .parse((await api.get<unknown>(path(classroomId), { params: { limit: 50, ...before }, signal })).data).data
}
export type ChatMentions = { mentionUserIds?: string[]; mentionStudents?: boolean }
export async function sendClassroomMessage(classroomId: string, requestId: string, body: string, replyToId: string | null, mentions: ChatMentions = {}) {
  return message.parse(await postApiWithCsrf(path(classroomId), { requestId, body, replyToId, ...mentions }))
}
const unread = z.object({ total: z.number().int().nonnegative(), unreadCount: z.number().int().nonnegative(), mentionCount: z.number().int().nonnegative(), firstUnread: z.object({ id: z.uuid(), createdAt: z.string() }).nullable() })
export type ChatUnread = z.infer<typeof unread>
export async function getClassroomUnread(classroomId: string, signal?: AbortSignal) {
  return unread.parse((await api.get(path(classroomId) + '/unread', { signal })).data.data)
}
export async function markClassroomRead(classroomId: string, messageId: string) {
  return z.object({ messageId: z.uuid() }).parse(await postApiWithCsrf(path(classroomId) + '/read', { messageId }))
}
