import type { StudySpaceRecord } from '@/components/features/personal-workspace/study-spaces/utils/study-spaces-records'
import { isStudySpaceCode, isStudySpaceInvitationToken } from '@/components/features/personal-workspace/study-spaces/utils/study-space-code'
import { collectOperation, requestOperation } from './contract-client'
import type { OperationBody, OperationData } from './generated-contract'

type StudySpaceSummary = OperationData<'GET /api/v1/study-spaces'>['items'][number]
type DiscoverableStudySpace = OperationData<'GET /api/v1/study-spaces/discover'>['items'][number]
export type StudySpaceMember = OperationData<'GET /api/v1/study-spaces/{spaceId}/members'>['items'][number]

export function toStudySpaceView(record: StudySpaceSummary & { joinCode?: string | null }): StudySpaceRecord {
  const owner = record.role === 'OWNER'
  return {
    id: record.id, name: record.name, about: record.description, role: owner ? 'owner' : 'member',
    kind: record.layout ?? 'collaborative', capacity: record.seatCount ?? 4, createdAt: '',
    ...(owner && record.joinCode ? { joinCode: record.joinCode } : {}),
  }
}
export async function getStudySpaces(signal?: AbortSignal) {
  return (await collectOperation('GET /api/v1/study-spaces', { signal })).map(toStudySpaceView)
}
export async function getDiscoverableStudySpaces(signal?: AbortSignal) {
  return (await collectOperation('GET /api/v1/study-spaces/discover', { signal })).map((record: DiscoverableStudySpace) => ({
    id: record.id,
    name: record.name,
    about: record.description,
    role: 'member' as const,
    kind: record.layout ?? 'collaborative',
    capacity: record.seatCount ?? 4,
    createdAt: '',
    discoverySpace: true as const,
  }))
}
export function getStudySpaceMembers(spaceId: string, signal?: AbortSignal) {
  return collectOperation('GET /api/v1/study-spaces/{spaceId}/members', { params: { spaceId }, signal })
}
export async function getStudySpace(spaceId: string, signal?: AbortSignal) {
  return toStudySpaceView(await requestOperation('GET /api/v1/study-spaces/{spaceId}', { params: { spaceId }, signal }))
}
export async function createStudySpace(name: string, description: string, layout?: Pick<StudySpaceRecord, "kind" | "capacity">) {
  return toStudySpaceView(await requestOperation('POST /api/v1/study-spaces', {
    body: { name, description, ...(layout ? { layout: layout.kind, seatCount: layout.capacity } : {}) },
  }))
}
export async function joinStudySpace(value: string, expectedSpaceId?: string) {
  const code = value.trim()
  const roomCode = isStudySpaceCode(code)
  if (!roomCode && !isStudySpaceInvitationToken(code)) throw new Error('Enter a study space code or the invitation token supplied by the space owner.')
  const { spaceId } = roomCode
    ? await requestOperation('POST /api/v1/study-spaces/join', { body: { code: code.toUpperCase(), ...(expectedSpaceId ? { spaceId: expectedSpaceId } : {}) } })
    : await requestOperation('POST /api/v1/study-space-invitations/accept', { body: { token: code } })
  try { return await getStudySpace(spaceId) }
  catch {
    throw new Error(roomCode
      ? 'You joined the study space, but it could not be loaded. Refresh your spaces to open it.'
      : 'Your invitation was accepted, but the space could not be loaded. Refresh your spaces before retrying.')
  }
}
export function listStudySpaceTasks(spaceId: string, signal?: AbortSignal) {
  return collectOperation('GET /api/v1/study-spaces/{spaceId}/tasks', { params: { spaceId }, signal })
}

export function createStudySpaceTask(spaceId: string, body: OperationBody<'POST /api/v1/study-spaces/{spaceId}/tasks'>) {
  return requestOperation('POST /api/v1/study-spaces/{spaceId}/tasks', { params: { spaceId }, body })
}

export function changeStudySpaceTask(spaceId: string, taskId: string, body: OperationBody<'POST /api/v1/study-spaces/{spaceId}/tasks/{taskId}/actions'>) {
  return requestOperation('POST /api/v1/study-spaces/{spaceId}/tasks/{taskId}/actions', { params: { spaceId, taskId }, body })
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
