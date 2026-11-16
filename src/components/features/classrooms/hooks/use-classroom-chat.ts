import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getClassroomMessages, getClassroomUnread, markClassroomRead, sendClassroomMessage, type ChatMentions, type ChatUnread, type ClassroomChatMessage, type ClassroomChatCursor } from '@/services/api/classroom-chat.service'
import { getApiErrorMessage } from '@/services/api/api-error'

const merge = (old: ClassroomChatMessage[], added: ClassroomChatMessage[]) =>
  [...new Map([...old, ...added].map(item => [item.id, item])).values()]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))

// The parent keys this component by account/classroom; cleanup rejects late responses.
export function useClassroomChat(classroomId: string) {
  const [messages, setMessages] = useState<ClassroomChatMessage[]>([])
  const [next, setNext] = useState<ClassroomChatCursor | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [denied, setDenied] = useState(false)
  const [unread, setUnread] = useState<ChatUnread | null>(null)
  const [unreadError, setUnreadError] = useState('')
  const [findingUnread, setFindingUnread] = useState(false)
  const [markingRead, setMarkingRead] = useState(false)
  const readPending = useRef(false)
  const unreadVersion = useRef(0)
  const active = useRef<AbortController | null>(null)
  const sending = useRef(false)
  const olderPending = useRef(false)
  const retry = useRef<{ body: string; replyToId: string | null; requestId: string; mentions: ChatMentions } | null>(null)
  const refreshUnread = useCallback(async (controller: AbortController) => {
    const version = ++unreadVersion.current
    try {
      const result = await getClassroomUnread(classroomId, controller.signal)
      if (!controller.signal.aborted && version === unreadVersion.current) { setUnread(result); setUnreadError('') }
    } catch {
      if (!controller.signal.aborted && version === unreadVersion.current) setUnreadError('Unread status is unavailable. Please retry.')
    }
  }, [classroomId])
  useEffect(() => {
    const controller = new AbortController()
    active.current = controller
    let timer: ReturnType<typeof setTimeout> | undefined
    let first = true
    const poll = async () => {
      try {
        const page = await getClassroomMessages(classroomId, undefined, controller.signal)
        if (controller.signal.aborted) return
        setMessages(current => merge(current, page.items))
        if (first) setNext(page.next)
        first = false
        setError('')
        await refreshUnread(controller)
      } catch (cause) {
        if (controller.signal.aborted) return
        setError(getApiErrorMessage(cause, 'Classroom messages could not be loaded. Retrying…'))
        if (axios.isAxiosError(cause) && [401, 403, 404].includes(cause.response?.status ?? 0)) {
          setMessages([]); setNext(null); setUnread(null); setDenied(true); setLoading(false); controller.abort()
        }
      } finally {
        if (!controller.signal.aborted) { setLoading(false); timer = setTimeout(() => void poll(), 5000) }
      }
    }
    void poll()
    return () => { controller.abort(); if (timer) clearTimeout(timer) }
  }, [classroomId, refreshUnread])
  const loadOlder = async () => {
    const controller = active.current
    if (!next || !controller || controller.signal.aborted || olderPending.current) return
    olderPending.current = true; setLoadingOlder(true)
    try {
      const page = await getClassroomMessages(classroomId, next, controller.signal)
      if (!controller.signal.aborted) { setMessages(current => merge(current, page.items)); setNext(page.next) }
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Older messages could not be loaded.')) }
    finally { olderPending.current = false; if (!controller.signal.aborted) setLoadingOlder(false) }
  }
  const findUnread = useCallback(async (messageId?: string) => {
    const controller = active.current
    const targetId = messageId ?? unread?.firstUnread?.id
    if (!controller || controller.signal.aborted || !targetId || olderPending.current) return null
    olderPending.current = true; setFindingUnread(true)
    let cursor: ClassroomChatCursor | null = null
    const visited = new Set<string>()
    try {
      let loaded = messages
      if (!loaded.some(message => message.id === targetId)) {
        const page = await getClassroomMessages(classroomId, undefined, controller.signal)
        if (controller.signal.aborted) return null
        loaded = merge(loaded, page.items); cursor = page.next
        setMessages(current => merge(current, page.items))
      }
      while (!loaded.some(message => message.id === targetId) && cursor) {
        const key = JSON.stringify(cursor)
        if (visited.has(key)) throw new Error('History pagination could not continue.')
        visited.add(key)
        const page = await getClassroomMessages(classroomId, cursor, controller.signal)
        if (controller.signal.aborted) return null
        loaded = merge(loaded, page.items); cursor = page.next
        setMessages(current => merge(current, page.items))
      }
      if (!loaded.some(message => message.id === targetId)) throw new Error('Message could not be found. Please retry.')
      return targetId
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Unread messages could not be loaded.')); return null }
    finally { olderPending.current = false; if (!controller.signal.aborted) setFindingUnread(false) }
  }, [classroomId, messages, unread?.firstUnread?.id])
  const markRead = useCallback(async (messageId: string) => {
    const controller = active.current
    if (!controller || controller.signal.aborted || readPending.current) return
    readPending.current = true; setMarkingRead(true)
    ++unreadVersion.current
    try {
      await markClassroomRead(classroomId, messageId)
      if (!controller.signal.aborted) await refreshUnread(controller)
    } catch { if (!controller.signal.aborted) setUnreadError('Messages could not be marked as read. Please retry.') }
    finally { readPending.current = false; if (!controller.signal.aborted) setMarkingRead(false) }
  }, [classroomId, refreshUnread])
  const send = async (body: string, replyToId: string | null, mentions: ChatMentions = {}) => {
    const controller = active.current
    if (!controller || controller.signal.aborted || sending.current) return false
    sending.current = true; setBusy(true); setError('')
    if (retry.current?.body !== body || retry.current.replyToId !== replyToId || JSON.stringify(retry.current.mentions) !== JSON.stringify(mentions))
      retry.current = { body, replyToId, mentions, requestId: crypto.randomUUID() }
    try {
      const saved = Object.keys(mentions).length
        ? await sendClassroomMessage(classroomId, retry.current.requestId, body, replyToId, mentions)
        : await sendClassroomMessage(classroomId, retry.current.requestId, body, replyToId)
      if (controller.signal.aborted) return false
      setMessages(current => merge(current, [saved])); retry.current = null
      await refreshUnread(controller)
      return true
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Message was not confirmed. Your draft is still here.')); return false }
    finally { sending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  return { messages, loading, loadingOlder, busy, denied, error, next, loadOlder, send, unread, unreadError, findingUnread, findUnread, markRead, markingRead }
}
