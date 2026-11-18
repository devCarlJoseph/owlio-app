import { beforeEach, describe, expect, it, vi } from 'vitest'
import { collectOperation, requestOperation } from './contract-client'
import { createStudySpace, getDiscussionReplies, getStudySpaces, joinStudySpace, removeStudySpace, toStudySpaceView } from './study-space.service'

vi.mock('./contract-client', () => ({ collectOperation: vi.fn(), requestOperation: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

describe('study-space API workflows', () => {
  it('maps API records without a browser-local or sample fallback', async () => {
    vi.mocked(collectOperation).mockResolvedValue([{ id: 'space', name: 'Saved name', description: 'Saved description', role: 'OWNER' }])
    expect(await getStudySpaces()).toEqual([{
      id: 'space', name: 'Saved name', about: 'Saved description', role: 'owner',
      kind: 'collaborative', capacity: 4, createdAt: '',
    }])
    vi.mocked(collectOperation).mockRejectedValue(new Error('Service unavailable'))
    await expect(getStudySpaces()).rejects.toThrow('Service unavailable')
  })

  it('validates invitation tokens before sending a mutation', async () => {
    await expect(joinStudySpace('short')).rejects.toThrow('invitation token')
    expect(requestOperation).not.toHaveBeenCalled()
  })

  it('keeps the newly created code available for the owner only', async () => {
    const room = { id: 'space', name: 'Group study', description: '', role: 'OWNER', joinCode: 'OWLIO-SPS-A7K2' } as const
    vi.mocked(requestOperation).mockResolvedValue(room)
    expect(await createStudySpace(room.name, '')).toMatchObject({ role: 'owner', joinCode: room.joinCode })
    expect(toStudySpaceView({ ...room, role: 'MEMBER' })).not.toHaveProperty('joinCode')
  })

  it('normalizes a reusable code and opens the confirmed room', async () => {
    vi.mocked(requestOperation)
      .mockResolvedValueOnce({ spaceId: 'space' })
      .mockResolvedValueOnce({ id: 'space', name: 'Group study', description: '', role: 'MEMBER', joinCode: null })
    expect(await joinStudySpace(' owlio-sps-a7k2 ')).toMatchObject({ id: 'space', role: 'member' })
    expect(requestOperation).toHaveBeenNthCalledWith(1, 'POST /api/v1/study-spaces/join', { body: { code: 'OWLIO-SPS-A7K2' } })
  })

  it('preserves confirmed acceptance when the follow-up detail read fails', async () => {
    vi.mocked(requestOperation).mockResolvedValueOnce({ spaceId: 'space' }).mockRejectedValueOnce(new Error('Offline'))
    await expect(joinStudySpace('a'.repeat(43))).rejects.toThrow('invitation was accepted')
    expect(requestOperation).toHaveBeenCalledTimes(2)
    expect(requestOperation).toHaveBeenNthCalledWith(1, 'POST /api/v1/study-space-invitations/accept', { body: { token: 'a'.repeat(43) } })
  })

  it('uses archive for owners and leave for members', async () => {
    const space = { id: 'space', name: '', about: '', role: 'owner' as const, kind: 'collaborative' as const, capacity: 4, createdAt: '' }
    await removeStudySpace(space)
    await removeStudySpace({ ...space, role: 'member' })
    expect(requestOperation).toHaveBeenNthCalledWith(1, 'POST /api/v1/study-spaces/{spaceId}/archive', { params: { spaceId: 'space' }, body: {} })
    expect(requestOperation).toHaveBeenNthCalledWith(2, 'POST /api/v1/study-spaces/{spaceId}/leave', { params: { spaceId: 'space' }, body: {} })
  })

  it('follows the nested discussion cursor and rejects a repeated cursor', async () => {
    const discussion = { id: 'discussion', spaceId: 'space', title: 'Saved discussion', lockedAt: null }
    vi.mocked(requestOperation)
      .mockResolvedValueOnce({ discussion, replies: { items: [{ id: 'one', body: 'First', authorId: 'person', createdAt: '' }], nextCursor: 'next' } })
      .mockResolvedValueOnce({ discussion, replies: { items: [{ id: 'two', body: 'Second', authorId: 'person', createdAt: '' }], nextCursor: null } })
    expect((await getDiscussionReplies('discussion')).map(reply => reply.id)).toEqual(['one', 'two'])
    expect(requestOperation).toHaveBeenLastCalledWith('GET /api/v1/discussions/{discussionId}', { params: { discussionId: 'discussion' }, query: { limit: 50, cursor: 'next' }, signal: undefined })
    vi.mocked(requestOperation).mockResolvedValue({ discussion, replies: { items: [], nextCursor: 'next' } })
    await expect(getDiscussionReplies('discussion')).rejects.toThrow('pagination could not continue')
  })
})
