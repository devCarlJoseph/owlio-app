import { useEffect, useRef, useState } from "react"
import type { StudyRoomChange } from "@/services/api/study-space-realtime"
import type { RoomMessage } from "@/components/features/personal-workspace/study-spaces/detail/ui/room-chat-panel"
import { getApiErrorMessage } from "@/services/api/api-error"
import { createRoomDiscussion, getDiscussionReplies, listRoomDiscussions, postRoomReply } from "@/services/api/study-space.service"

const ROOM_THREAD_TITLE = "Room discussion"
const REFRESH_MS = 5000

function latestMessages(messages: RoomMessage[]) {
  return messages.sort((a, b) => a.sentAt - b.sentAt || a.id.localeCompare(b.id)).slice(-50)
}

// The room mounts this hook with a fresh key for each account and space.
export function useRoomDiscussion(spaceId?: string, user?: { id: string; name: string } | null) {
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [readError, setReadError] = useState("")
  const [sendError, setSendError] = useState("")
  const [busy, setBusy] = useState(false)
  const write = useRef({ active: true, sending: false, revision: 0 })
  const userId = user?.id
  const userName = user?.name

  useEffect(() => {
    if (!spaceId || !userId) return
    const mutation = write.current
    mutation.active = true
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>

    async function refresh(id: string) {
      const revision = mutation.revision
      try {
        if (mutation.sending || document.hidden) return
        const threads = await listRoomDiscussions(id, controller.signal)
        // The API permits duplicate titles. Merge replies to keep simultaneous first posts visible.
        const groups = await Promise.all(threads.filter((thread) => thread.title === ROOM_THREAD_TITLE)
          .map((thread) => getDiscussionReplies(thread.id, controller.signal)))
        if (controller.signal.aborted || revision !== mutation.revision) return
        const updated = latestMessages(groups.flat().map((reply) => ({
          id: reply.id,
          authorId: reply.authorId,
          author: reply.authorId === userId ? userName ?? "You" : "Member",
          text: reply.body,
          sentAt: Date.parse(reply.createdAt),
        })))
        setMessages((current) => current.length === updated.length &&
          current.every((message, index) => message.id === updated[index].id && message.author === updated[index].author)
          ? current
          : updated)
        setReadError("")
      } catch (cause) {
        if (!controller.signal.aborted && revision === mutation.revision) {
          // The previously authorized snapshot may no longer be available to this account.
          setMessages([])
          setReadError(getApiErrorMessage(cause, "Room messages could not be refreshed."))
        }
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(() => void refresh(id), REFRESH_MS)
      }
    }

    void refresh(spaceId)
    return () => {
      mutation.active = false
      controller.abort()
      clearTimeout(timer)
    }
  }, [spaceId, userId, userName])

  async function send(body: string) {
    const mutation = write.current
    if (!spaceId || !user || mutation.sending) return null
    mutation.sending = true
    mutation.revision++
    setBusy(true)
    setSendError("")
    try {
      const threads = (await listRoomDiscussions(spaceId)).filter((thread) => thread.title === ROOM_THREAD_TITLE)
      let thread = threads.find((item) => !item.lockedAt)
      if (!mutation.active) return null
      if (!thread) {
        if (threads.length) throw new Error("This room conversation is locked.")
        thread = await createRoomDiscussion(spaceId, ROOM_THREAD_TITLE)
      }
      if (!mutation.active) return null
      const reply = await postRoomReply(thread.id, body)
      if (!mutation.active) return null
      const message = { id: reply.id, authorId: user.id, author: user.name, text: body, sentAt: Date.parse(reply.createdAt) }
      setMessages((current) => latestMessages([...current.filter((item) => item.id !== reply.id), message]))
      setReadError("")
      return message
    } catch (cause) {
      if (mutation.active) setSendError(getApiErrorMessage(cause, "Message delivery could not be confirmed."))
      return null
    } finally {
      mutation.sending = false
      if (mutation.active) setBusy(false)
    }
  }

  function receive(message: Extract<StudyRoomChange, { kind: "chat" }>["message"]) {
    write.current.revision++
    setMessages((current) => latestMessages([
      ...current.filter((item) => item.id !== message.id),
      { ...message, author: message.authorId === userId ? userName ?? "You" : "Member" },
    ]))
    setReadError("")
  }

  return { messages, readError, sendError, busy, send, receive }
}
