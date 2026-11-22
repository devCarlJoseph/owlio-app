import { useRef, useState, type FormEvent } from "react"
import { Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { REACTION_CHOICES } from "../contents/discussion-reaction-data"
import { PersonAvatar } from "../ui/classroom-ui"

export function DiscussionComposer({
  id,
  label,
  placeholder = "Write a comment…",
  authorName,
  onSubmit,
  disabled = false,
  maxLength = 1000,
  submitLabel = 'Comment',
}: {
  id: string
  label: string
  placeholder?: string
  authorName: string
  onSubmit: (body: string) => void | boolean | Promise<boolean | void>
  disabled?: boolean
  maxLength?: number
  submitLabel?: string
}) {
  const [draft, setDraft] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSubmit = draft.trim().length > 0

  const discard = () => {
    setDraft("")
    setEmojiOpen(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || disabled || submitting) return
    setSubmitting(true)
    try { if (await onSubmit(draft.trim()) !== false) discard() }
    finally { setSubmitting(false) }
  }

  const insertEmoji = (emoji: string) => {
    setDraft((current) => current.length + emoji.length <= maxLength ? `${current}${emoji}` : current)
    setEmojiOpen(false)
    textareaRef.current?.focus()
  }

  const iconButton =
    "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"

  return (
    <form onSubmit={event => void submit(event)} className="flex items-start gap-3">
      <PersonAvatar name={authorName} className="mt-1" />
      <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-2 focus-within:border-ring">
        <label htmlFor={id} className="sr-only">{label}</label>
        <Textarea
          ref={textareaRef}
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          maxLength={maxLength}
          disabled={disabled || submitting}
          placeholder={placeholder}
          className="min-h-20 resize-y border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
        />
        {emojiOpen && (
          <div role="group" aria-label="Insert emoji" className="mb-2 flex flex-wrap gap-1">
            {REACTION_CHOICES.map(({ emoji, label: emojiLabel }) => (
              <button
                key={emoji}
                type="button"
                disabled={disabled || submitting}
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
            <button
              type="button"
              className={iconButton}
              aria-label="Add emoji"
              aria-expanded={emojiOpen}
              disabled={disabled || submitting}
              onClick={() => setEmojiOpen((current) => !current)}
            >
              <Smile aria-hidden="true" className="size-4" />
            </button>
            <span className="hidden text-[11px] text-muted-foreground sm:inline">Links supported</span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={discard} disabled={!draft || submitting}>Discard</Button>
            <Button type="submit" size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90" disabled={!canSubmit || disabled || submitting}>{submitting ? 'Sending…' : submitLabel}</Button>
          </div>
        </div>
      </div>
    </form>
  )
}
