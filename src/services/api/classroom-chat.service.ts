import { z } from 'zod'
import api from '@/lib/axios'
import { mutateApiWithCsrf, postApiWithCsrf } from './auth.service'

const reactions = z.record(z.string(), z.object({ count: z.number().int().positive(), mine: z.boolean() }))
const voiceType = z.enum(['audio/webm', 'audio/ogg', 'audio/mp4'])
export const classroomVoiceLimit = 512 * 1024
export type ClassroomVoiceType = z.infer<typeof voiceType>
export type ClassroomMessageReactions = z.infer<typeof reactions>
const message = z.object({
  id: z.uuid(), authorId: z.uuid(), authorName: z.string(), authorRole: z.enum(['student', 'educator']),
  body: z.string(), createdAt: z.string(),
  replyTo: z.object({ messageId: z.uuid(), authorName: z.string(), excerpt: z.string() }).nullable(),
  mentionUserIds: z.array(z.uuid()).optional(), mentionStudents: z.boolean().optional(),
  seenCount: z.number().int().nonnegative().nullable().optional(),
  reactions: reactions.optional(),
  voiceType: voiceType.nullable().optional(),
})
const cursor = z.object({ beforeCreatedAt: z.string(), beforeId: z.uuid() })
export type ClassroomChatMessage = z.infer<typeof message>
export type ClassroomChatCursor = z.infer<typeof cursor>
const path = (classroomId: string) => '/api/v1/classrooms/' + encodeURIComponent(classroomId) + '/messages'
export async function getClassroomMessages(classroomId: string, before?: ClassroomChatCursor, signal?: AbortSignal) {
  return z.object({ status: z.literal('success'), data: z.object({ items: z.array(message), next: cursor.nullable(), canWrite: z.boolean().optional() }) })
    .parse((await api.get<unknown>(path(classroomId), { params: { limit: 50, ...before }, signal })).data).data
}
export type ChatMentions = { mentionUserIds?: string[]; mentionStudents?: boolean }
export async function sendClassroomMessage(classroomId: string, requestId: string, body: string, replyToId: string | null, mentions: ChatMentions = {}) {
  return message.parse(await postApiWithCsrf(path(classroomId), { requestId, body, replyToId, ...mentions }))
}

export async function reactToClassroomMessage(classroomId: string, messageId: string, emoji: string, active: boolean) {
  return z.object({ reactions }).parse(await postApiWithCsrf(path(classroomId) + '/' + encodeURIComponent(messageId) + '/reactions', { emoji, active })).reactions
}

export async function sendClassroomVoiceMessage(classroomId: string, requestId: string, audio: Blob, replyToId: string | null) {
  const query = new URLSearchParams({ requestId, ...(replyToId ? { replyToId } : {}) })
  const type = voiceType.parse(audio.type)
  return message.parse(await mutateApiWithCsrf('POST', path(classroomId) + '/voice?' + query, audio, type))
}

export async function getClassroomVoiceMessage(classroomId: string, messageId: string, signal: AbortSignal) {
  const response = await api.get<Blob>(path(classroomId) + '/' + encodeURIComponent(messageId) + '/voice', { responseType: 'blob', signal })
  if (!voiceType.safeParse(response.data.type).success || !response.data.size || response.data.size > classroomVoiceLimit)
    throw new Error('Invalid voice message response.')
  return response.data
}
const unread = z.object({ total: z.number().int().nonnegative(), unreadCount: z.number().int().nonnegative(), mentionCount: z.number().int().nonnegative(), firstUnread: z.object({ id: z.uuid(), createdAt: z.string() }).nullable() })
export type ChatUnread = z.infer<typeof unread>
export async function getClassroomUnread(classroomId: string, signal?: AbortSignal) {
  return unread.parse((await api.get(path(classroomId) + '/unread', { signal })).data.data)
}
export async function markClassroomRead(classroomId: string, messageId: string) {
  return z.object({ messageId: z.uuid() }).parse(await postApiWithCsrf(path(classroomId) + '/read', { messageId }))
}
export type ChatReader = { id: string; name: string }
export async function getClassroomMessageReaders(classroomId: string, messageId: string, cursor?: string, signal?: AbortSignal) {
  return z.object({ status: z.literal('success'), data: z.object({ items: z.array(z.object({ id: z.uuid(), name: z.string() })), nextCursor: z.uuid().nullable() }) })
    .parse((await api.get<unknown>(path(classroomId) + '/' + encodeURIComponent(messageId) + '/readers', { params: { limit: 50, ...(cursor ? { cursor } : {}) }, signal })).data).data
}
