import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getClassroomMembers, getClassrooms, type ApiClassroomMember, type ApiPage } from '@/services/api/classroom.service'
import { useClassroomOwner } from '../hooks/use-classroom-owner'
import type { Classroom } from '../types/classroom-types'
import { TestSession } from './classroom-test-fixtures'

vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), getClassroomMembers: vi.fn() }))
const classroom = { id: 'class-id', ownerId: 'owner-id', instructorName: '', isMock: false } as Classroom
const owner = { id: 'owner-id', name: 'Actual Educator', role: 'owner' as const }
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getClassrooms).mockResolvedValue([]) })
afterEach(cleanup)

describe('banner classroom owner', () => {
  it('uses a known instructor name without requesting the directory', () => {
    const { result } = renderHook(() => useClassroomOwner({ ...classroom, instructorName: 'Known Educator' }), { wrapper: TestSession })
    expect(result.current.name).toBe('Known Educator')
    expect(getClassroomMembers).not.toHaveBeenCalled()
  })

  it('finds the matching owner on later pages without using other members’ names', async () => {
    vi.mocked(getClassroomMembers).mockResolvedValueOnce({ items: [{ ...owner, id: 'different-owner' }], nextCursor: 'page-two' })
      .mockResolvedValueOnce({ items: [owner], nextCursor: null })
    const { result } = renderHook(() => useClassroomOwner(classroom), { wrapper: TestSession })
    await waitFor(() => expect(result.current.name).toBe(owner.name))
    expect(getClassroomMembers).toHaveBeenLastCalledWith(classroom.id, 'page-two', expect.any(AbortSignal))
  })

  it('leaves the name unavailable on denied reads', async () => {
    vi.mocked(getClassroomMembers).mockRejectedValue(new Error('Access denied'))
    const { result } = renderHook(() => useClassroomOwner(classroom), { wrapper: TestSession })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.name).toBe('')
  })

  it('stops repeated cursor pages', async () => {
    vi.mocked(getClassroomMembers).mockResolvedValue({ items: [], nextCursor: 'repeat' })
    const { result } = renderHook(() => useClassroomOwner(classroom), { wrapper: TestSession })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.name).toBe('')
    expect(getClassroomMembers).toHaveBeenCalledTimes(2)
  })

  it('aborts and ignores a late owner response after changing classrooms', async () => {
    let finish!: (page: ApiPage<ApiClassroomMember>) => void
    vi.mocked(getClassroomMembers).mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
      .mockResolvedValue({ items: [], nextCursor: null })
    const { result, rerender } = renderHook(({ record }) => useClassroomOwner(record), { initialProps: { record: classroom }, wrapper: TestSession })
    const signal = vi.mocked(getClassroomMembers).mock.calls[0][2]!
    rerender({ record: { ...classroom, id: 'other-classroom' } })
    expect(signal.aborted).toBe(true)
    await act(async () => finish({ items: [owner], nextCursor: null }))
    expect(result.current.name).toBe('')
  })
})
