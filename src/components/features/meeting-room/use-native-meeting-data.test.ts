import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { Room } from 'livekit-client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMeetingMessages, getMeetingParticipants, getMeetingState, recoverMeetingMessages, type NativeMessage } from '@/services/api/meeting.service'
import { watchMeetingChat, type MeetingChatListener } from '@/services/api/meeting-realtime'
import { useNativeMeetingData } from './use-native-meeting-data'
vi.mock('@/services/api/meeting.service', () => ({ getMeetingMessages: vi.fn(), getMeetingParticipants: vi.fn(), getMeetingState: vi.fn(), recoverMeetingMessages: vi.fn() }))
vi.mock('@/services/api/meeting-realtime', () => ({ watchMeetingChat: vi.fn() }))
const session = '11111111-1111-4111-8111-111111111111'
const message: NativeMessage = { id: '22222222-2222-4222-8222-222222222222', authorId: session, authorName: 'Fixture', body: 'Hello', createdAt: '2026-11-15T10:00:00.000000Z' }
let listeners: MeetingChatListener[]
let close = vi.fn<() => void>()
function room() { return { disconnect: vi.fn().mockResolvedValue(undefined) } as unknown as Room }
beforeEach(() => {
  vi.resetAllMocks(); listeners = []; close = vi.fn()
  vi.mocked(getMeetingMessages).mockResolvedValue([]); vi.mocked(getMeetingParticipants).mockResolvedValue([])
  vi.mocked(getMeetingState).mockResolvedValue({ id: session } as Awaited<ReturnType<typeof getMeetingState>>)
  vi.mocked(recoverMeetingMessages).mockResolvedValue([message])
  vi.mocked(watchMeetingChat).mockImplementation((_session, listener) => { listeners.push(listener); return close })
})
afterEach(cleanup)
describe('meeting chat synchronization', () => {
  it('loads chat independently of a slow provider-backed roster', async () => {
    vi.mocked(getMeetingParticipants).mockReturnValue(new Promise(() => {}))
    vi.mocked(getMeetingMessages).mockResolvedValue([message])
    const media = room(), view = renderHook(() => useNativeMeetingData(media, session))
    await waitFor(() => expect(view.result.current.messages).toEqual([message]))
  })
  it('merges a confirmed send immediately and preserves it when an older read finishes', async () => {
    let finish!: (items: NativeMessage[]) => void
    vi.mocked(getMeetingMessages).mockReturnValueOnce(new Promise(resolve => { finish = resolve }))
    const media = room(), view = renderHook(() => useNativeMeetingData(media, session))
    act(() => view.result.current.addMessage(message))
    expect(view.result.current.messages).toEqual([message])
    await act(async () => { finish([]) })
    expect(view.result.current.messages).toEqual([message])
  })
  it('shows pushed messages without another HTTP read and deduplicates their echo', async () => {
    const media = room(), view = renderHook(() => useNativeMeetingData(media, session))
    await waitFor(() => expect(getMeetingMessages).toHaveBeenCalledOnce())
    act(() => { listeners[0].onMessages([message]); view.result.current.addMessage(message); listeners[0].onMessages([message]) })
    expect(view.result.current.messages).toEqual([message])
    expect(getMeetingMessages).toHaveBeenCalledOnce()
  })
  it('reloads bounded history after a realtime gap or reconnect', async () => {
    const media = room(), view = renderHook(() => useNativeMeetingData(media, session))
    await waitFor(() => expect(getMeetingMessages).toHaveBeenCalledOnce())
    act(() => { listeners[0].onReady(); listeners[0].onResync() })
    await waitFor(() => expect(recoverMeetingMessages).toHaveBeenCalledOnce())
    expect(view.result.current.messages).toEqual([message])
    act(() => listeners[0].onReady())
    await waitFor(() => expect(recoverMeetingMessages).toHaveBeenCalledTimes(2))
  })
  it('removes subscriptions and ignores late messages from an old room', async () => {
    const first = room(), second = room()
    const view = renderHook(({ media }) => useNativeMeetingData(media, session), { initialProps: { media: first } })
    await waitFor(() => expect(getMeetingMessages).toHaveBeenCalledOnce())
    const old = listeners[0]
    act(() => old.onMessages([message]))
    view.rerender({ media: second })
    act(() => old.onMessages([message]))
    expect(view.result.current.messages).toEqual([])
    expect(close).toHaveBeenCalledOnce()
    view.unmount(); expect(close).toHaveBeenCalledTimes(2)
  })
  it('clears messages and disconnects media when realtime access is revoked', async () => {
    const media = room(), view = renderHook(() => useNativeMeetingData(media, session))
    await waitFor(() => expect(getMeetingMessages).toHaveBeenCalledOnce())
    act(() => { listeners[0].onMessages([message]); listeners[0].onDenied() })
    expect(view.result.current.messages).toEqual([])
    expect(media.disconnect).toHaveBeenCalledWith(true)
  })
})
