import { useId, useRef, useState } from 'react'
import { SmilePlus } from 'lucide-react'
import type { ClassroomMessageReactions } from '@/services/api/classroom-chat.service'
import { REACTION_CHOICES } from '../contents/discussion-reaction-data'

export function ChatMessageReactions({ reactions, onReact }: {
  reactions: ClassroomMessageReactions
  onReact?: (emoji: string, active: boolean) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const choicesId = useId()
  const choices = open && onReact ? REACTION_CHOICES : REACTION_CHOICES.filter(({ emoji }) => reactions[emoji]?.count)

  if (!onReact && !choices.length) return null

  return <div className="flex min-w-0 flex-wrap items-center gap-1" onKeyDown={event => {
    if (event.key !== 'Escape' || !open) return
    event.preventDefault()
    setOpen(false)
    trigger.current?.focus()
  }}>
    {onReact && <button ref={trigger} type="button" aria-label="Add reaction" aria-expanded={open} aria-controls={choicesId}
      title="Add reaction" onClick={() => setOpen(current => !current)} className="grid size-7 shrink-0 place-items-center rounded-full border border-current/25 outline-none hover:bg-background/25 focus-visible:ring-2 focus-visible:ring-current">
      <SmilePlus aria-hidden="true" className="size-4" />
    </button>}
    <div id={choicesId} className="flex min-w-0 flex-wrap gap-1" aria-label="Message reactions" role="group">
      {choices.map(({ emoji, label }) => {
        const state = reactions[emoji]
        const selected = state?.mine === true
        const count = state?.count ?? 0
        const className = 'inline-flex min-h-7 items-center gap-1 rounded-full border px-2 text-xs ' + (selected ? 'border-current bg-background/25' : 'border-current/25')
        return onReact ? <button key={emoji} type="button" aria-label={`${label} reaction${count ? `, ${count}` : ''}`} aria-pressed={selected}
          disabled={pending} className={className + ' outline-none hover:bg-background/25 focus-visible:ring-2 focus-visible:ring-current disabled:opacity-60'}
          onClick={async () => {
            setPending(true)
            try { await onReact(emoji, !selected) }
            finally { setPending(false) }
          }}>
          <span aria-hidden="true">{emoji}</span>{count || null}
        </button> : <span key={emoji} aria-label={`${label} reaction, ${count}`} className={className}>{emoji} {count}</span>
      })}
    </div>
  </div>
}
