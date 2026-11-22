import { useEffect, useState } from "react"
import type { RoomMessage } from "../ui/room-chat-panel"

const BUBBLE_MS = 6000

export function useRoomBubbles(messages: RoomMessage[], selfId?: string) {
  const [bubbles, setBubbles] = useState<Record<string, string>>({})
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function refresh() {
      const now = Date.now()
      const latest = new Map<string, RoomMessage>()
      for (const message of messages) {
        if (message.authorId && message.authorId !== selfId && message.sentAt > now - BUBBLE_MS) {
          latest.set(message.authorId, message)
        }
      }
      setBubbles(Object.fromEntries([...latest].map(([id, message]) => [id, message.text])))
      if (latest.size) {
        const nextExpiry = Math.min(...[...latest.values()].map((message) => message.sentAt + BUBBLE_MS))
        timer = setTimeout(refresh, Math.max(1, nextExpiry - now))
      }
    }
    timer = setTimeout(refresh, 0)
    return () => clearTimeout(timer)
  }, [messages, selfId])
  return bubbles
}
