import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthSession } from '@/components/features/auth/auth-session-context'
import type { RoomMessage } from '@/components/features/personal-workspace/study-spaces/detail/room-chat-panel'
import { collectOperation, requestOperation } from '@/services/api/contract-client'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getDiscussionReplies } from '@/services/api/study-space.service'

/** Saved discussion replies; avatar positions remain a local visual aid. */
export function useRoomDiscussion(spaceId: string | undefined) {
  const { user } = useAuthSession()
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const thread = useRef<string | null>(null)
  const generation = useRef(0)
  const sending = useRef(false)
  const active = useRef(true)
  useEffect(() => {
    active.current = true
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    async function read() {
      const revision = generation.current
      try {
        if (!spaceId) return
        if (!thread.current) {
          const threads = await collectOperation('GET /api/v1/study-spaces/{spaceId}/discussions', { params: { spaceId }, signal: controller.signal })
          const room = threads.find(item => item.title === 'Room discussion' && !item.lockedAt)
          if (room && !thread.current) thread.current = room.id
        }
        if (thread.current) {
          const replies = await getDiscussionReplies(thread.current, controller.signal)
          if (!controller.signal.aborted && revision === generation.current) setMessages(replies.slice(-50).map(reply => ({ id: reply.id, author: reply.authorId === user?.id ? user.name : 'Member', text: reply.body, sentAt: Date.parse(reply.createdAt) })))
        }
        if (!controller.signal.aborted) setError('')
      } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Room discussion could not be loaded.')) }
      finally { if (!controller.signal.aborted) timer = setTimeout(() => void read(), 5000) }
    }
    void read()
    return () => { active.current = false; controller.abort(); clearTimeout(timer) }
  }, [spaceId, user?.id, user?.name])
  const send = useCallback(async (body: string) => {
    if (!spaceId || !user || sending.current) return false
    sending.current = true; generation.current++; setBusy(true); setError('')
    try {
      if (!thread.current) {
        const created = await requestOperation('POST /api/v1/study-spaces/{spaceId}/discussions', { params: { spaceId }, body: { title: 'Room discussion' } })
        thread.current = created.id
      }
      const reply = await requestOperation('POST /api/v1/discussions/{discussionId}/replies', { params: { discussionId: thread.current }, body: { body } })
      generation.current++
      if (active.current) setMessages(current => [...current, { id: reply.id, author: user.name, text: body, sentAt: Date.parse(reply.createdAt) }])
      return true
    } catch (cause) { if (active.current) setError(getApiErrorMessage(cause, 'Message was not confirmed. Refresh before retrying.')); return false }
    finally { sending.current = false; if (active.current) setBusy(false) }
  }, [spaceId, user])
  return { messages, error, busy, send }
}
