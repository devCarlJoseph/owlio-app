import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { io } from 'socket.io-client'
import { watchMeetingChat } from './meeting-realtime'
vi.mock('socket.io-client', () => ({ io: vi.fn() }))
const sessionId = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
const message = { id: other, authorId: sessionId, authorName: 'Fixture', body: 'Hello', createdAt: '2026-11-15T10:00:00.000000Z' }
function setup() {
  const handlers = new Map<string, (...args: unknown[]) => void>()
  let ack: (error: Error | null, value: unknown) => void = () => {}
  const socket = { connected: true, active: true, on: vi.fn(), timeout: vi.fn(), emit: vi.fn(), connect: vi.fn(), disconnect: vi.fn(), removeAllListeners: vi.fn() }
  socket.on.mockImplementation((event: string, handler: (...args: unknown[]) => void) => { handlers.set(event, handler); return socket })
  socket.timeout.mockReturnValue(socket)
  socket.emit.mockImplementation((_event: string, _input: unknown, callback: typeof ack) => { ack = callback; return socket })
  vi.mocked(io).mockReturnValue(socket as unknown as ReturnType<typeof io>)
  const listener = { onMessages: vi.fn(), onReady: vi.fn(), onOffline: vi.fn(), onResync: vi.fn(), onDenied: vi.fn() }
  const stop = watchMeetingChat(sessionId, listener)
  return { socket, listener, stop, event: (name: string, ...args: unknown[]) => handlers.get(name)?.(...args), ack: (value: unknown) => ack(null, value), currentAck: () => ack }
}
beforeEach(() => { vi.resetAllMocks(); vi.useFakeTimers() })
afterEach(() => vi.useRealTimers())
describe('authenticated read-only meeting chat subscription', () => {
  it('uses the API cookie path, validates the watch acknowledgement, and forwards live messages', () => {
    const test = setup()
    expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ path: '/api/socket.io', transports: ['websocket'], withCredentials: true, autoConnect: false }))
    expect(vi.mocked(io).mock.calls[0][1]).not.toHaveProperty('auth')
    test.event('connect')
    expect(test.socket.emit).toHaveBeenCalledWith('chat:watch', { sessionId }, expect.any(Function))
    test.ack({ status: 'success', data: { items: [message], next: null } })
    expect(test.listener.onMessages).toHaveBeenCalledWith([message]); expect(test.listener.onReady).toHaveBeenCalledOnce()
    test.event('chat:messages', { sessionId, items: [message], resync: true, next: null })
    expect(test.listener.onResync).toHaveBeenCalledOnce()
    test.stop(); expect(test.socket.removeAllListeners).toHaveBeenCalledOnce(); expect(test.socket.disconnect).toHaveBeenCalledOnce()
  })
  it('ignores other sessions and obsolete watch acknowledgements after reconnect', () => {
    const test = setup(); test.event('connect'); const old = test.currentAck()
    test.event('disconnect', 'transport close'); test.event('connect')
    old(null, { status: 'success', data: { items: [message], next: null } })
    expect(test.listener.onMessages).not.toHaveBeenCalled()
    test.ack({ status: 'success', data: { items: [], next: null } })
    test.event('chat:messages', { sessionId: other, items: [message], resync: false, next: null })
    expect(test.listener.onMessages).toHaveBeenCalledExactlyOnceWith([])
    test.stop()
  })
  it('falls back and reconnects on a malformed snapshot instead of rendering it', async () => {
    const test = setup(); test.event('connect'); test.ack({ status: 'success', data: { items: [{ body: 'bad' }], next: null } })
    expect(test.listener.onMessages).not.toHaveBeenCalled(); expect(test.listener.onOffline).toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(5000)
    expect(test.socket.connect).toHaveBeenCalledTimes(2)
    test.stop()
  })
  it('stops delivery and media access on an explicit authorization denial', () => {
    const test = setup(); test.event('meeting:unavailable', { code: 'NOT_FOUND' })
    expect(test.listener.onDenied).toHaveBeenCalledOnce()
    test.event('chat:messages', { sessionId, items: [message], resync: false, next: null })
    expect(test.listener.onMessages).not.toHaveBeenCalled()
    test.stop()
  })
  it('cancels server-disconnect retries and late events during cleanup', async () => {
    const test = setup(); test.event('disconnect', 'io server disconnect'); test.stop()
    await vi.advanceTimersByTimeAsync(10000)
    expect(test.socket.connect).toHaveBeenCalledOnce()
    test.event('chat:messages', { sessionId, items: [message], resync: false, next: null })
    expect(test.listener.onMessages).not.toHaveBeenCalled()
  })
})
