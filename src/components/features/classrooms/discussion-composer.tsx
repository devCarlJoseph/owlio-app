import { useRef, useState, type FormEvent } from "react"
import { Link2, Paperclip, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { REACTION_CHOICES } from "./discussion-reaction-data"
import { PersonAvatar } from "./classroom-ui"

export function DiscussionComposer({
  id,
  label,
  placeholder = "Write a comment…",
  authorName,
  onSubmit,
}: {
  id: string
  label: string
  placeholder?: string
  authorName: string
  onSubmit: (body: string) => void
}) {
  const [draft, setDraft] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSubmit = draft.trim().length > 0

  const discard = () => {
    setDraft("")
    setEmojiOpen(false)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(draft.trim())
    discard()
  }

  const insertEmoji = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`)
    setEmojiOpen(false)
    textareaRef.current?.focus()
  }

  const iconButton =
    "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"

  return (
    <form onSubmit={submit} className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
      <PersonAvatar name={authorName} className="mt-1 hidden sm:flex" />
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">{label}</label>
        <Textarea
          ref={textareaRef}
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          maxLength={1000}
          placeholder={placeholder}
          className="min-h-16 resize-none border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
        />
        {emojiOpen && (
          <div role="group" aria-label="Insert emoji" className="mb-2 flex flex-wrap gap-1">
            {REACTION_CHOICES.map(({ emoji, label: emojiLabel }) => (
              <button
                key={emoji}
                type="button"
                aria-label={`Insert ${emojiLabel}`}
                onClick={() => insertEmoji(emoji)}
                className="inline-flex size-8 items-center justify-center rounded-md text-lg outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button type="button" disabled className={iconButton} aria-label="Attach a file (not available yet)" title="Attachments are not available yet">
              <Paperclip aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label="Add emoji"
              aria-expanded={emojiOpen}
              onClick={() => setEmojiOpen((current) => !current)}
            >
              <Smile aria-hidden="true" className="size-4" />
            </button>
            <button type="button" disabled className={iconButton} aria-label="Add a link (type or paste a full https:// URL instead)" title="Paste a full https:// URL into your comment">
              <Link2 aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={discard} disabled={!draft}>Discard</Button>
            <Button type="submit" size="sm" disabled={!canSubmit}>Submit</Button>
          </div>
        </div>
      </div>
    </form>
  )
}
