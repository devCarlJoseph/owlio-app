import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import type { Room } from 'livekit-client'
import { getMeetingMessages, getMeetingParticipants, getMeetingState, type MeetingDirectory, type NativeMessage, type NativeRoomState } from '@/services/api/meeting.service'
import { getApiErrorMessage } from '@/services/api/api-error'

export function useNativeMeetingData(room: Room | null, sessionId: string) {
  const [state, setState] = useState<NativeRoomState | null>(null)
  const [directory, setDirectory] = useState<MeetingDirectory>([])
  const [messages, setMessages] = useState<NativeMessage[]>([])
  const [error, setError] = useState('')
  const [loadedRoom, setLoadedRoom] = useState<Room | null>(null)
  const refreshRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    if (!room) return
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    let running = false
    let generation = 0
    const refresh = async () => {
      if (controller.signal.aborted || running) return
      running = true
      const request = ++generation
      if (timer) clearTimeout(timer)
      try {
        const [nextState, people, chat] = await Promise.all([
          getMeetingState(sessionId, controller.signal), getMeetingParticipants(sessionId, controller.signal), getMeetingMessages(sessionId, controller.signal),
        ])
        if (controller.signal.aborted || request !== generation) return
        setState(nextState); setDirectory(people); setMessages(chat); setError(''); setLoadedRoom(room)
      } catch (cause) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(cause, 'Could not update meeting information.'))
        if (axios.isAxiosError(cause) && [401, 403, 404].includes(cause.response?.status ?? 0)) {
          controller.abort()
          await room.disconnect(true)
        }
      } finally {
        running = false
        if (!controller.signal.aborted) timer = setTimeout(() => void refresh(), 5000)
      }
    }
    refreshRef.current = () => { void refresh() }
    void refresh()
    return () => { controller.abort(); if (timer) clearTimeout(timer); refreshRef.current = null }
  }, [room, sessionId])
  const current = Boolean(room && loadedRoom === room)
  return { state: current ? state : null, directory: current ? directory : [], messages: current ? messages : [], error: room ? error : '', refresh: () => refreshRef.current?.() }
}
