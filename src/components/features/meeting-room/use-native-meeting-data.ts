import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Room } from 'livekit-client'
import { getMeetingMessages, recoverMeetingMessages, getMeetingParticipants, getMeetingState, type MeetingDirectory, type NativeMessage, type NativeRoomState } from '@/services/api/meeting.service'
import { getApiErrorMessage } from '@/services/api/api-error'
import { watchMeetingChat } from '@/services/api/meeting-realtime'

type ChatCache = { room: Room; sessionId: string; items: NativeMessage[] }
export function mergeMeetingMessages(current: NativeMessage[], incoming: NativeMessage[]) {
  const items = new Map(current.map(item => [item.id, item]))
  incoming.forEach(item => items.set(item.id, item))
  return [...items.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)).slice(-1000)
}

export function useNativeMeetingData(room: Room | null, sessionId: string) {
  const [state, setState] = useState<NativeRoomState | null>(null)
  const [directory, setDirectory] = useState<MeetingDirectory>([])
  const [chat, setChat] = useState<ChatCache | null>(null)
  const [error, setError] = useState('')
  const [chatError, setChatError] = useState('')
  const [loadedRoom, setLoadedRoom] = useState<Room | null>(null)
  const refreshRef = useRef<(() => void) | null>(null)
  const refreshChatRef = useRef<(() => void) | null>(null)
  const addMessage = useCallback((message: NativeMessage) => {
    if (!room) return
    setChat(current => ({ room, sessionId, items: mergeMeetingMessages(current?.room === room && current.sessionId === sessionId ? current.items : [], [message]) }))
  }, [room, sessionId])

  useEffect(() => {
    if (!room) return
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    let running = false, queued = false
    const refresh = async () => {
      if (controller.signal.aborted) return
      if (running) { queued = true; return }
      running = true
      if (timer) clearTimeout(timer)
      try {
        const [nextState, people] = await Promise.all([getMeetingState(sessionId, controller.signal), getMeetingParticipants(sessionId, controller.signal)])
        if (controller.signal.aborted) return
        setState(nextState); setDirectory(people); setError(''); setLoadedRoom(room)
      } catch (cause) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(cause, 'Could not update meeting information.'))
        if (axios.isAxiosError(cause) && [401, 403, 404].includes(cause.response?.status ?? 0)) {
          controller.abort(); setChat(null)
          await room.disconnect(true)
        }
      } finally {
        running = false
        if (!controller.signal.aborted) {
          if (queued) { queued = false; void refresh() }
          else timer = setTimeout(() => void refresh(), 5000)
        }
      }
    }
    refreshRef.current = () => { void refresh() }
    void refresh()
    return () => { controller.abort(); if (timer) clearTimeout(timer); refreshRef.current = null }
  }, [room, sessionId])

  // Chat never waits for the provider-backed participant roster.
  useEffect(() => {
    if (!room) return
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    let running = false, queued = false, live = false, subscribed = false, recover = false
    const refresh = async () => {
      if (controller.signal.aborted) return
      if (running) { queued = true; return }
      running = true
      if (timer) clearTimeout(timer)
      try {
        const load = recover ? recoverMeetingMessages : getMeetingMessages
        recover = false
        const items = await load(sessionId, controller.signal)
        if (controller.signal.aborted) return
        setChat(current => ({ room, sessionId, items: mergeMeetingMessages(current?.room === room && current.sessionId === sessionId ? current.items : [], items) }))
        setChatError('')
      } catch (cause) {
        if (controller.signal.aborted) return
        setChatError(getApiErrorMessage(cause, 'Could not update meeting messages.'))
        if (axios.isAxiosError(cause) && [401, 403, 404].includes(cause.response?.status ?? 0)) {
          controller.abort(); setChat(null)
          await room.disconnect(true)
        }
      } finally {
        running = false
        if (!controller.signal.aborted) {
          if (queued) { queued = false; void refresh() }
          else timer = setTimeout(() => void refresh(), live ? 30000 : 5000)
        }
      }
    }
    const stopWatching = watchMeetingChat(sessionId, {
      onMessages: items => {
        if (controller.signal.aborted) return
        setChat(current => ({ room, sessionId, items: mergeMeetingMessages(current?.room === room && current.sessionId === sessionId ? current.items : [], items) }))
        setChatError('')
      },
      onReady: () => {
        if (controller.signal.aborted) return
        live = true
        if (subscribed) { recover = true; void refresh() }
        subscribed = true
      },
      onOffline: () => {
        if (controller.signal.aborted) return
        live = false
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => void refresh(), 1000)
      },
      onResync: () => { if (!controller.signal.aborted) { recover = true; void refresh() } },
      onDenied: () => { if (!controller.signal.aborted) { controller.abort(); setChat(null); void room.disconnect(true) } },
    })
    refreshChatRef.current = () => { void refresh() }
    void refresh()
    return () => { controller.abort(); stopWatching(); if (timer) clearTimeout(timer); refreshChatRef.current = null }
  }, [room, sessionId])
  const current = Boolean(room && loadedRoom === room)
  return { state: current ? state : null, directory: current ? directory : [], messages: room && chat?.room === room && chat.sessionId === sessionId ? chat.items : [], error: room ? error || chatError : '', addMessage, refresh: () => { refreshRef.current?.(); refreshChatRef.current?.() } }
}
