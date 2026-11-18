import { z } from 'zod'
import api from '@/lib/axios'
import { mutateApiWithCsrf } from './auth.service'

const avatarPath = '/api/v1/users/me/avatar'
export const avatarTypes = ['image/jpeg', 'image/png', 'image/webp']
export const avatarLimit = 2 * 1024 * 1024

const avatarSchema = z.object({
  url: z.url({ protocol: /^https$/ }).nullable(),
  source: z.enum(['upload', 'google']).nullable(),
  uploadsAvailable: z.boolean(),
})
export type ProfilePhoto = z.infer<typeof avatarSchema>

export async function getProfilePhoto(signal: AbortSignal) {
  const { data } = await api.get<unknown>(avatarPath, { signal })
  return z.object({ status: z.literal('success'), data: avatarSchema }).parse(data).data
}

export async function updateProfilePhoto(file: File) {
  const data = await mutateApiWithCsrf<unknown>('PUT', avatarPath, file, file.type)
  return avatarSchema.parse(data)
}

export async function removeProfilePhoto() {
  const data = await mutateApiWithCsrf<unknown>('DELETE', avatarPath, {})
  return avatarSchema.parse(data)
}
