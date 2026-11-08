import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { Paperclip, Send, Smile, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ClassroomChatReplyRef } from "./classroom-types"
import { REACTION_CHOICES } from "./discussion-reaction-data"

const MAX_LENGTH = 500

const iconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"

export function ChatComposer({
  onSend,
  replyingTo,
  onCancelReply,
}: {
  onSend: (body: string) => void
  replyingTo: ClassroomChatReplyRef | null
  onCancelReply: () => void
}) {
  const [draft, setDraft] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = draft.trim().length > 0

  useEffect(() => {
    if (replyingTo) textareaRef.current?.focus()
  }, [replyingTo])

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (!canSend) return
    onSend(draft.trim())
    setDraft("")
    setEmojiOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape" && replyingTo) {
      onCancelReply()
      return
    }
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  const insertEmoji = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`.slice(0, MAX_LENGTH))
    setEmojiOpen(false)
    textareaRef.current?.focus()
  }

  return (
    <form onSubmit={submit} className="border-t border-border p-3">
      {replyingTo && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border-l-2 border-primary bg-muted px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">Replying to {replyingTo.authorName}</p>
            <p className="line-clamp-2 break-words text-muted-foreground">{replyingTo.excerpt}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      )}
      {emojiOpen && (
        <div role="group" aria-label="Insert emoji" className="mb-2 flex flex-wrap gap-1">
          {REACTION_CHOICES.map(({ emoji, label }) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Insert ${label}`}
              onClick={() => insertEmoji(emoji)}
              className="inline-flex size-8 items-center justify-center rounded-md text-lg outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true">{emoji}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-1.5 rounded-2xl border border-border bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/50">
        <button type="button" disabled className={iconButton} aria-label="Attach a file (not available yet)" title="Attachments are not available yet">
          <Paperclip aria-hidden="true" className="size-4" />
        </button>
        <label htmlFor="class-chat-message" className="sr-only">Message this class</label>
        <Textarea
          ref={textareaRef}
          id="class-chat-message"
          rows={1}
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type message…"
          className="max-h-32 min-h-9 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-2 shadow-none focus-visible:ring-0"
        />
        <button type="button" className={iconButton} aria-label="Add emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((current) => !current)}>
          <Smile aria-hidden="true" className="size-4" />
        </button>
        <Button type="submit" size="icon" disabled={!canSend} aria-label="Send class chat message" className="shrink-0 rounded-full">
          <Send aria-hidden="true" />
        </Button>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
        <span>Enter to send · Shift+Enter for a new line</span>
        {draft.length >= 400 && <span aria-live="polite">{draft.length}/{MAX_LENGTH}</span>}
      </div>
    </form>
  )
}
