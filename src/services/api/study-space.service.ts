import type { StudySpaceRecord } from '@/components/features/personal-workspace/study-spaces/utils/study-spaces-records'
import { collectOperation, requestOperation } from './contract-client'
import type { OperationData } from './generated-contract'

export function toStudySpaceView(record: OperationData<'GET /api/v1/study-spaces/{spaceId}'>): StudySpaceRecord {
  // These two values choose the existing room illustration, not stored membership limits.
  return { id: record.id, name: record.name, about: record.description, role: record.role === 'OWNER' ? 'owner' : 'member', kind: 'collaborative', capacity: 4, createdAt: '' }
}
export async function getStudySpaces(signal?: AbortSignal) {
  return (await collectOperation('GET /api/v1/study-spaces', { signal })).map(toStudySpaceView)
}
export async function getStudySpace(spaceId: string, signal?: AbortSignal) {
  return toStudySpaceView(await requestOperation('GET /api/v1/study-spaces/{spaceId}', { params: { spaceId }, signal }))
}
export async function createStudySpace(name: string, description: string) {
  return toStudySpaceView(await requestOperation('POST /api/v1/study-spaces', { body: { name, description } }))
}
export async function joinStudySpace(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('Enter the invitation token supplied by the space owner.')
  const { spaceId } = await requestOperation('POST /api/v1/study-space-invitations/accept', { body: { token } })
  try { return await getStudySpace(spaceId) }
  catch { throw new Error('Your invitation was accepted, but the space could not be loaded. Refresh your spaces before retrying.') }
}
export function issueStudySpaceInvitation(spaceId: string, recipientId: string) {
  return requestOperation('POST /api/v1/study-spaces/{spaceId}/invitations', { params: { spaceId }, body: { recipientId } })
}

export function listRoomDiscussions(spaceId: string, signal?: AbortSignal) {
  return collectOperation('GET /api/v1/study-spaces/{spaceId}/discussions', { params: { spaceId }, signal })
}

export function createRoomDiscussion(spaceId: string, title: string) {
  return requestOperation('POST /api/v1/study-spaces/{spaceId}/discussions', { params: { spaceId }, body: { title } })
}

export function postRoomReply(discussionId: string, body: string) {
  return requestOperation('POST /api/v1/discussions/{discussionId}/replies', { params: { discussionId }, body: { body } })
}

export function removeStudySpace(space: StudySpaceRecord) {
  return space.role === 'owner' ? requestOperation('POST /api/v1/study-spaces/{spaceId}/archive', { params: { spaceId: space.id }, body: {} }) : requestOperation('POST /api/v1/study-spaces/{spaceId}/leave', { params: { spaceId: space.id }, body: {} })
}

export async function getDiscussionReplies(discussionId: string, signal?: AbortSignal) {
  const items: OperationData<'GET /api/v1/discussions/{discussionId}'>['replies']['items'] = []
  const seen = new Set<string>()
  let cursor: string | null = null
  do {
    const page: OperationData<'GET /api/v1/discussions/{discussionId}'> = await requestOperation('GET /api/v1/discussions/{discussionId}', { params: { discussionId }, query: { limit: 50, ...(cursor ? { cursor } : {}) }, signal })
    items.push(...page.replies.items); cursor = page.replies.nextCursor
    if (cursor && seen.has(cursor)) throw new Error('Discussion pagination could not continue.')
    if (cursor) seen.add(cursor)
  } while (cursor)
  return items
}
