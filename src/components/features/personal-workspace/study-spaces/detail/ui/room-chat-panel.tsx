import { useEffect, useRef } from "react"
import { cn } from "cn"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { studySpaceChatLocalNotice } from "../../utils/study-spaces-records"

export type RoomMessage = {
  id: string
  author: string
  authorId?: string
  text: string
  sentAt: number
}

type RoomChatPanelProps = {
  messages: RoomMessage[]
  onClose: () => void
  shared?: boolean
  error?: string
  className?: string
}

export function RoomChatPanel({ messages, onClose, shared, error, className }: RoomChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ block: "end" })
  }, [messages.length])

  return (
    <aside
      aria-label="Space chat"
      className={cn(
        "flex w-72 max-w-[85%] flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900/95 shadow-lg backdrop-blur",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-700 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
          <MessageCircle className="size-4" aria-hidden="true" />
          Space chat
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          aria-label="Close chat panel"
          className="text-slate-400 surface-dark:text-muted-foreground hover:text-slate-100"
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      {error && <p role="alert" className="px-3 py-2 text-xs text-red-200">{error}</p>}
      <ScrollArea className="min-h-0 flex-1">
        <div role="log" aria-label="Room messages" className="flex flex-col gap-2 p-3">
          {messages.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-700 px-3 py-4 text-center text-xs leading-5 text-slate-400 surface-dark:text-muted-foreground">
              {shared ? "Start the conversation with a message to the room." : "No messages yet. Send a message and it appears above your character."}
            </p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="rounded-lg bg-slate-800 px-3 py-2">
                <p className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-medium text-slate-200">{message.author}</span>
                  <span className="shrink-0 text-[10px] text-slate-500 surface-dark:text-muted-foreground">
                    {new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </p>
                <p className="mt-1 break-words text-sm leading-5 text-slate-100">{message.text}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <p className="border-t border-slate-700 px-3 py-2 text-[11px] leading-4 text-slate-400 surface-dark:text-muted-foreground">
        {shared ? "Messages are saved and visible to members of this study space." : studySpaceChatLocalNotice}
      </p>
    </aside>
  )
}
