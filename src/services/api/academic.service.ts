import { z } from 'zod'
import { collectOperation, requestOperation } from './contract-client'
import { operations, type OperationData } from './generated-contract'

// Published classwork omits the draft-only concurrency version.
export const classworkSchema = operations['PATCH /api/v1/classwork/{classworkId}'].response.extend({ version: z.number().optional() })
export type Classwork = z.infer<typeof classworkSchema>
export type Submission = OperationData<'PUT /api/v1/classwork/{classworkId}/submissions/me'>
export async function getClasswork(classworkId: string, signal?: AbortSignal): Promise<Classwork> {
  return classworkSchema.parse(await requestOperation('GET /api/v1/classwork/{classworkId}', { params: { classworkId }, signal }))
}
export async function listClasswork(classroomId: string, signal?: AbortSignal): Promise<Classwork[]> {
  return z.array(classworkSchema).parse(await collectOperation('GET /api/v1/classrooms/{classroomId}/classwork', { params: { classroomId }, signal }))
}

function fileMetadata(file: File) {
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) throw new Error('Choose a file between 1 byte and 5 MB.')
  if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) throw new Error('Choose a PDF, PNG, or JPEG file.')
  if (!/^[A-Za-z0-9][A-Za-z0-9 ._()-]{0,119}$/.test(file.name)) throw new Error('Use a filename starting with a letter or number, with only spaces, letters, numbers, dots, underscores, parentheses and hyphens (120 characters maximum).')
  const extensions: Record<string, string[]> = { 'application/pdf': ['.pdf'], 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }
  if (!extensions[file.type].some(extension => file.name.toLowerCase().endsWith(extension))) throw new Error('The filename extension must match the file type.')
  return { fileName: file.name, contentType: file.type as 'application/pdf' | 'image/png' | 'image/jpeg', sizeBytes: file.size }
}

// Use fetch instead of the API Axios instance: cookies and CSRF must never go to storage.
async function putStorage(upload: { uploadUrl: string; headers: { 'Content-Type': string } }, file: File) {
  const url = new URL(upload.uploadUrl)
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('The API returned an invalid storage URL.')
  const response = await fetch(url, { method: 'PUT', credentials: 'omit', headers: upload.headers, body: file, referrerPolicy: 'no-referrer' })
  if (!response.ok) throw new Error('The file transfer failed. The file has not been finalized.')
}

export async function uploadClassworkFile(classworkId: string, file: File) {
  const upload = await requestOperation('POST /api/v1/classwork/{classworkId}/files/uploads', { params: { classworkId }, body: fileMetadata(file) })
  await putStorage(upload, file)
  return requestOperation('POST /api/v1/classwork/{classworkId}/files/{fileId}/complete', { params: { classworkId, fileId: upload.fileId }, body: {} })
}
export async function uploadSubmissionFile(classworkId: string, submission: Submission, file: File) {
  const upload = await requestOperation('POST /api/v1/classwork/{classworkId}/submissions/me/files/uploads', { params: { classworkId }, body: { file: fileMetadata(file), expectedVersion: submission.version } })
  await putStorage(upload, file)
  return requestOperation('POST /api/v1/classwork/{classworkId}/submissions/me/files/{fileId}/complete', { params: { classworkId, fileId: upload.fileId }, body: { expectedVersion: upload.version } })
}

export async function openDownload(load: () => Promise<{ url: string }>) {
  // Open synchronously to preserve the browser's user-gesture popup permission.
  const tab = window.open('about:blank', '_blank')
  if (tab) tab.opener = null
  try {
    const { url } = await load()
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('The API returned an invalid download URL.')
    if (!tab) throw new Error('Allow a new tab for this download, then try again.')
    tab.location.replace(parsed.href)
  } catch (error) { tab?.close(); throw error }
}
