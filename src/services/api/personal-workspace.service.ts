import { z } from 'zod'
import type { AxiosResponse } from 'axios'
import api from '@/lib/axios'
import { mutateApiWithCsrf, postApiWithCsrf } from './auth.service'

const version = z.number().int().nonnegative()
export const subjectSchema = z.object({ id: z.uuid(), name: z.string(), description: z.string(), archivedAt: z.string().nullable(), version })
export const taskSchema = z.object({ id: z.uuid(), title: z.string(), dueAt: z.string().nullable(), completedAt: z.string().nullable(), version })
export const noteSchema = z.object({ id: z.uuid(), subjectId: z.uuid().nullable(), title: z.string(), content: z.string(), version })
export const notificationSchema = z.object({ id: z.uuid(), kind: z.string(), sourceId: z.uuid(), createdAt: z.string(), readAt: z.string().nullable() })
export type PersonalSubject = z.infer<typeof subjectSchema>
export type PersonalTask = z.infer<typeof taskSchema>
export type PersonalNote = z.infer<typeof noteSchema>
export type ApiNotification = z.infer<typeof notificationSchema>

// Every collection uses its own UUID cursor; never infer the next page from length.
export async function getAccountCollection<T>(path: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T[]> {
  const result: T[] = []
  const seen = new Set<string>()
  let cursor: string | null = null
  do {
    const response: AxiosResponse<unknown> = await api.get<unknown>(path, { params: { limit: 50, ...(cursor ? { cursor } : {}) }, signal })
    const page: { items: T[]; nextCursor: string | null } = z.object({ status: z.literal('success'), data: z.object({ items: z.array(schema), nextCursor: z.uuid().nullable() }) }).parse(response.data).data
    result.push(...page.items)
    cursor = page.nextCursor
    if (cursor && seen.has(cursor)) throw new Error('The service repeated a page. Please reload.')
    if (cursor) seen.add(cursor)
  } while (cursor)
  return result
}

const subjects = '/api/v1/users/me/subjects'
const tasks = '/api/v1/users/me/tasks'
const notes = '/api/v1/users/me/personal-notes'
const notifications = '/api/v1/users/me/notifications'
const id = (value: string) => z.uuid().parse(value)
export const getPersonalSubjects = (signal?: AbortSignal) => getAccountCollection(subjects, subjectSchema, signal)
export const getPersonalTasks = (signal?: AbortSignal) => getAccountCollection(tasks, taskSchema, signal)
export const getPersonalNotes = (signal?: AbortSignal) => getAccountCollection(notes, noteSchema, signal)
export const getNotifications = (signal?: AbortSignal) => getAccountCollection(notifications, notificationSchema, signal)

export async function savePersonalSubject(input: { name: string; description: string }, current?: PersonalSubject) {
  return subjectSchema.parse(await mutateApiWithCsrf(current ? 'PATCH' : 'POST', subjects + (current ? '/' + id(current.id) : ''),
    { name: input.name, description: input.description, ...(current ? { expectedVersion: current.version } : {}) }))
}
export async function archivePersonalSubject(current: PersonalSubject) {
  return subjectSchema.parse(await postApiWithCsrf(subjects + '/' + id(current.id) + '/archive', {}))
}
export async function savePersonalTask(input: { title: string; dueAt: string | null }, current?: PersonalTask) {
  return taskSchema.parse(await mutateApiWithCsrf(current ? 'PATCH' : 'POST', tasks + (current ? '/' + id(current.id) : ''),
    { title: input.title, dueAt: input.dueAt, ...(current ? { expectedVersion: current.version } : {}) }))
}
export async function togglePersonalTask(current: PersonalTask) {
  return taskSchema.parse(await postApiWithCsrf(tasks + '/' + id(current.id) + (current.completedAt ? '/reopen' : '/complete'), { expectedVersion: current.version }))
}
export async function savePersonalNote(input: { title: string; content: string; subjectId: string | null }, current?: PersonalNote) {
  return noteSchema.parse(await mutateApiWithCsrf(current ? 'PATCH' : 'POST', notes + (current ? '/' + id(current.id) : ''),
    { title: input.title, content: input.content, subjectId: input.subjectId, ...(current ? { expectedVersion: current.version } : {}) }))
}
export async function deletePersonalNote(current: PersonalNote) {
  return z.object({ id: z.uuid(), deletedAt: z.string() }).parse(await mutateApiWithCsrf('DELETE', notes + '/' + id(current.id), { expectedVersion: current.version }))
}
export async function markNotificationRead(notificationId: string) {
  return z.object({ id: z.uuid(), readAt: z.string() }).parse(await postApiWithCsrf(notifications + '/' + id(notificationId) + '/read', {}))
}
