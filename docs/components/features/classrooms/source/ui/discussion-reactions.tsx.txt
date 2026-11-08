import { useState } from "react"
import { Plus } from "lucide-react"

import { REACTION_CHOICES, type ReactionState } from "./discussion-reaction-data"

const chipClass =
  "inline-flex h-7 items-center gap-1.5 rounded-full border border-transparent bg-muted px-2.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"

export function DiscussionReactions({
  postId,
  reactions,
  onToggle,
}: {
  postId: string
  reactions: ReactionState
  onToggle: (emoji: string) => void
}) {
  const [picking, setPicking] = useState(false)
  const active = REACTION_CHOICES.filter(({ emoji }) => (reactions[emoji]?.count ?? 0) > 0)
  const available = REACTION_CHOICES.filter(({ emoji }) => (reactions[emoji]?.count ?? 0) === 0)

  return (
    <div role="group" aria-label="Reactions (preview only)" className="flex flex-wrap items-center gap-2">
      {active.map(({ emoji, label }) => {
        const { count, mine } = reactions[emoji]
        return (
          <button
            key={emoji}
            type="button"
            aria-pressed={mine}
            aria-label={`${label}, ${count} ${count === 1 ? "reaction" : "reactions"}`}
            onClick={() => onToggle(emoji)}
            className={`${chipClass} ${mine ? "border-primary/40 bg-primary/10" : ""}`}
          >
            <span aria-hidden="true">{emoji}</span>
            <span aria-hidden="true">{count}</span>
          </button>
        )
      })}
      {available.length > 0 && (
        <button
          type="button"
          aria-expanded={picking}
          aria-controls={`reaction-picker-${postId}`}
          aria-label="Add reaction"
          onClick={() => setPicking((current) => !current)}
          className={`${chipClass} px-2`}
        >
          <Plus aria-hidden="true" className="size-3.5" />
        </button>
      )}
      {picking && (
        <div id={`reaction-picker-${postId}`} className="flex flex-wrap items-center gap-1">
          {available.map(({ emoji, label }) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Add ${label} reaction`}
              onClick={() => {
                onToggle(emoji)
                setPicking(false)
              }}
              className="inline-flex size-7 items-center justify-center rounded-full text-base outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true">{emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
