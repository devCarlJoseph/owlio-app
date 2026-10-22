import { useEffect, useMemo, useRef, useState } from "react"
import { FileText } from "lucide-react"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, ClassroomChatMessage, ClassroomChatReplyRef, WorkspaceRole } from "./classroom-types"
import { PersonAvatar } from "./classroom-ui"
import { isYou } from "./classroom-utils"
import { ChatComposer } from "./chat-composer"
import { ChatHeader } from "./chat-header"
import { ChatMessageBubble } from "./chat-message-bubble"
import type { ReactionState } from "./discussion-reaction-data"

export function ClassroomChatView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { sendChatMessage } = useClassroomPrototype()
  const [status, setStatus] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [reactions, setReactions] = useState<Record<string, ReactionState>>({})
  const [replyingTo, setReplyingTo] = useState<ClassroomChatReplyRef | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const authorRole = role === "students" ? "student" : "educator"
  const educators = classroom.members.filter((member) => member.role === "educator")
  const students = classroom.members.filter((member) => member.role === "student")
  const normalizedQuery = query.trim().toLowerCase()

  const messages = useMemo(
    () => normalizedQuery
      ? classroom.chatMessages.filter((message) =>
        `${message.body} ${message.authorName}`.toLowerCase().includes(normalizedQuery))
      : classroom.chatMessages,
    [classroom.chatMessages, normalizedQuery],
  )

  useEffect(() => {
    if (normalizedQuery) return
    const list = listRef.current
    list?.scrollTo({ top: list.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }, [classroom.chatMessages.length, normalizedQuery])

  const toggleReaction = (messageId: string, emoji: string) => {
    setReactions((current) => {
      const state = current[messageId] ?? {}
      const entry = state[emoji] ?? { count: 0, mine: false }
      const next = entry.mine
        ? { count: entry.count - 1, mine: false }
        : { count: entry.count + 1, mine: true }
      return { ...current, [messageId]: { ...state, [emoji]: next } }
    })
  }

  const startReply = (message: ClassroomChatMessage) => {
    setReplyingTo({
      messageId: message.id,
      authorName: message.authorName,
      excerpt: message.body.replace(/\s+/g, " ").trim().slice(0, 120),
    })
  }

  const jumpToMessage = (messageId: string) => {
    if (normalizedQuery) {
      setQuery("")
      setSearchOpen(false)
    }
    requestAnimationFrame(() => {
      document.getElementById(`chat-message-${messageId}`)?.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })
    })
    setHighlightedId(messageId)
    window.setTimeout(() => setHighlightedId((current) => (current === messageId ? null : current)), 1600)
  }

  const handleSend = (body: string) => {
    setQuery("")
    sendChatMessage(classroom.id, body, authorRole, replyingTo ?? undefined)
    setReplyingTo(null)
    setStatus("Message added for this preview session only. It was not delivered or saved.")
  }

  return (
    <div className="grid h-[36rem] max-h-[80dvh] grid-rows-[minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-card lg:max-h-none lg:grid-cols-[minmax(0,1fr)_16rem]">
      <section aria-label={`${classroom.name} group chat`} className="flex min-h-0 min-w-0 flex-col">
        <ChatHeader
          classroom={classroom}
          role={role}
          searchOpen={searchOpen}
          query={query}
          onToggleSearch={() => {
            setSearchOpen((current) => !current)
            setQuery("")
          }}
          onQueryChange={setQuery}
        />
        <div
          ref={listRef}
          role="log"
          aria-live="polite"
          aria-label={`${classroom.name} group chat messages`}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/30 px-4 py-5"
        >
          {messages.length === 0 ? (
            <p className="m-auto max-w-sm text-center text-sm text-muted-foreground">
              {normalizedQuery ? "No messages match your search." : "No messages yet. Start the class-only conversation."}
            </p>
          ) : (
            <ol className="flex flex-col gap-1">
              {messages.map((message, index) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  mine={isYou(message.authorName)}
                  showHeader={index === 0 || messages[index - 1].authorId !== message.authorId}
                  highlighted={highlightedId === message.id}
                  reactions={reactions[message.id] ?? {}}
                  onToggleReaction={(emoji) => toggleReaction(message.id, emoji)}
                  onReply={() => startReply(message)}
                  onJumpToMessage={jumpToMessage}
                />
              ))}
            </ol>
          )}
        </div>
        <p role="status" className="px-4 py-1 text-xs text-amber-800 empty:hidden">{status}</p>
        <ChatComposer onSend={handleSend} replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} />
      </section>

      <aside aria-label="Class info" className="hidden min-h-0 flex-col gap-5 overflow-y-auto border-l border-border p-4 lg:flex">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Class</dt><dd className="truncate text-right font-medium text-foreground">{classroom.subject}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Educator</dt><dd className="truncate text-right font-medium text-foreground">{classroom.instructorName}</dd></div>
        </dl>
        {[{ label: "Educators", people: educators }, { label: "Students", people: students }].map(({ label, people }) => (
          <div key={label} className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground">{label} <span className="font-normal text-muted-foreground">· {people.length}</span></h3>
            <ul className="mt-2 space-y-2">
              {people.map((member) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <PersonAvatar name={member.name} size="sm" />
                  <span className="truncate text-sm text-foreground/80">{member.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">Shared files</h3>
          {classroom.materials.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">No files shared yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {classroom.materials.map((material) => (
                <li key={material.id} className="flex items-center gap-2 text-sm text-foreground/80">
                  <FileText aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{material.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
