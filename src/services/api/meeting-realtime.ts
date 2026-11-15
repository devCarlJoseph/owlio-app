import { io } from 'socket.io-client'
import { z } from 'zod'
import api from '@/lib/axios'
import { meetingChatPage, type NativeMessage } from './meeting.service'

const snapshot = z.object({ status: z.literal('success'), data: meetingChatPage })
const update = meetingChatPage.extend({ sessionId: z.uuid(), resync: z.boolean() })
const failure = z.object({ code: z.string() })
const denied = new Set(['UNAUTHENTICATED', 'UNAUTHORIZED', 'AUTHENTICATION_REQUIRED', 'FORBIDDEN', 'NOT_FOUND', 'ADMISSION_REQUIRED', 'MEETING_BLOCKED'])
export type MeetingChatListener = {
  onMessages: (items: NativeMessage[]) => void
  onReady: () => void
  onOffline: () => void
  onResync: () => void
  onDenied: () => void
}

// Read-only subscription. Writes continue through the HTTP cookie/CSRF helpers.
export function watchMeetingChat(sessionId: string, listener: MeetingChatListener) {
  z.uuid().parse(sessionId)
  const socket = io(api.defaults.baseURL!, {
    path: '/api/socket.io', transports: ['websocket'], withCredentials: true,
    autoConnect: false, forceNew: true, timeout: 5000,
    reconnectionDelay: 1000, reconnectionDelayMax: 5000,
  })
  let stopped = false, epoch = 0
  let retry: ReturnType<typeof setTimeout> | undefined
  const reconnect = () => {
    if (stopped || retry) return
    retry = setTimeout(() => { retry = undefined; if (!stopped) socket.connect() }, 5000)
  }
  const unavailable = (value: unknown) => {
    if (stopped) return
    const result = failure.safeParse(value)
    listener.onOffline()
    if (result.success && denied.has(result.data.code)) {
      stopped = true; socket.disconnect(); listener.onDenied()
    } else {
      socket.disconnect(); reconnect()
    }
  }
  socket.on('connect', () => {
    const request = ++epoch
    socket.timeout(5000).emit('chat:watch', { sessionId }, (error: Error | null, value: unknown) => {
      if (stopped || request !== epoch || !socket.connected) return
      const result = snapshot.safeParse(value)
      if (error || !result.success) { unavailable(value); return }
      listener.onMessages(result.data.data.items)
      listener.onReady()
    })
  })
  socket.on('chat:messages', (value: unknown) => {
    if (stopped) return
    const result = update.safeParse(value)
    if (!result.success) { unavailable(value); return }
    if (result.data.sessionId !== sessionId) return
    listener.onMessages(result.data.items)
    if (result.data.resync) listener.onResync()
  })
  socket.on('disconnect', reason => {
    ++epoch
    if (stopped) return
    listener.onOffline()
    if (reason === 'io server disconnect') reconnect()
  })
  socket.on('connect_error', () => { if (!stopped) { listener.onOffline(); if (!socket.active) reconnect() } })
  socket.on('meeting:unavailable', unavailable)
  socket.on('server:closing', () => unavailable(null))
  socket.connect()
  return () => { stopped = true; ++epoch; clearTimeout(retry); socket.removeAllListeners(); socket.disconnect() }
}
