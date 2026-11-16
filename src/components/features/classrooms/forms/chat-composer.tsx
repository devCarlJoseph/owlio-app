import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { AtSign, Paperclip, Send, Smile, X } from "lucide-react"
import type { ChatMentions } from '@/services/api/classroom-chat.service'
import { ChatMentionPicker, type ChatMentionPickerHandle } from './chat-mention-picker'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ClassroomChatReplyRef } from "../types/classroom-types"
import { REACTION_CHOICES } from "../contents/discussion-reaction-data"

const MAX_LENGTH = 500
const containsMention = (body: string, name: string) => new RegExp(`(^|\\s)@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|\\s|[.,!?;:])`).test(body)

const iconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-brand outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"

export function ChatComposer({
  onSend,
  replyingTo,
  onCancelReply,
  disabled = false,
  classroomId,
  userId,
  canMentionStudents = false,
}: {
  onSend: (body: string, mentions?: ChatMentions) => void | Promise<boolean>
  replyingTo: ClassroomChatReplyRef | null
  onCancelReply: () => void
  disabled?: boolean
  classroomId?: string
  userId?: string
  canMentionStudents?: boolean
}) {
  const [draft, setDraft] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [mentionsOpen, setMentionsOpen] = useState(false)
  const [activeMention, setActiveMention] = useState<{ start: number; end: number; query: string } | null>(null)
  const [activeOptionId, setActiveOptionId] = useState<string>()
  const mentionsRef = useRef<ChatMentionPickerHandle>(null)
  const mentionsId = useId()
  const [selected, setSelected] = useState<{ id: string; name: string }[]>([])
  const pending = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = !disabled && draft.trim().length > 0

  useEffect(() => {
    if (replyingTo) textareaRef.current?.focus()
  }, [replyingTo])

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (!canSend || pending.current) return
    pending.current = true
    try {
      const body = draft.trim()
      const mentionUserIds = selected.filter(member => member.id !== 'students' && containsMention(body, member.name)).map(member => member.id)
      const mentionStudents = canMentionStudents && /(^|\s)@students(?=$|\s|[.,!?;:])/.test(body)
      const sent = await onSend(body, mentionUserIds.length || mentionStudents ? { mentionUserIds, mentionStudents } : undefined)
      if (sent !== false) { setDraft(""); setEmojiOpen(false); setMentionsOpen(false); setActiveMention(null); setSelected([]) }
    } finally { pending.current = false }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return
    if (mentionsOpen && mentionsRef.current?.handleKey(event.key)) {
      event.preventDefault(); event.stopPropagation(); return
    }
    if (event.key === "Escape" && replyingTo) {
      onCancelReply()
      return
    }
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  const updateMention = (value: string, caret: number, end: number) => {
    const match = classroomId && caret === end ? /(^|\s)@([\p{L}\p{M}\p{N}_'-]*)$/u.exec(value.slice(0, caret)) : null
    if (!match) { setActiveMention(null); setMentionsOpen(false); return }
    if (selected.some(member => value.slice(caret - member.name.length - 1, caret) === `@${member.name}`)) {
      setActiveMention(null); setMentionsOpen(false); return
    }
    const tail = /^[\p{L}\p{M}\p{N}_'-]*/u.exec(value.slice(caret))?.[0].length ?? 0
    setActiveMention({ start: caret - match[2].length - 1, end: caret + tail, query: match[2] })
    setMentionsOpen(true)
  }

  const selectMention = (member: { id: string; name: string }) => {
    if (!activeMention) return
    const suffix = draft.slice(activeMention.end)
    const spacer = /^[.,!?;:]/.test(suffix) ? '' : ' '
    const insertion = `${draft.slice(0, activeMention.start)}@${member.name}${spacer}`
    const value = insertion + (spacer && suffix.startsWith(' ') ? suffix.slice(1) : suffix)
    if (value.length > MAX_LENGTH) return
    setDraft(value); setSelected(current => [...current.filter(item => item.id !== member.id), member]); setMentionsOpen(false); setActiveMention(null)
    requestAnimationFrame(() => { textareaRef.current?.focus(); textareaRef.current?.setSelectionRange(insertion.length, insertion.length) })
  }

  const insertEmoji = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`.slice(0, MAX_LENGTH))
    setEmojiOpen(false)
    setMentionsOpen(false)
    textareaRef.current?.focus()
  }

  return (
    <form onSubmit={submit} className="shrink-0 bg-card p-3 sm:px-4" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMentionsOpen(false) }}>
      {classroomId && <ChatMentionPicker key={`${classroomId}:${userId}`} ref={mentionsRef} classroomId={classroomId} userId={userId} canMentionStudents={canMentionStudents} query={activeMention?.query ?? ''} open={mentionsOpen && !disabled} listId={mentionsId} onActiveChange={setActiveOptionId} onClose={() => setMentionsOpen(false)} onSelect={selectMention} />}
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
      <div className="flex min-w-0 items-end gap-1.5">
        <button type="button" disabled className={iconButton} aria-label="Attach a file (not available yet)" title="Attachments are not available yet">
          <Paperclip aria-hidden="true" className="size-4" />
        </button>
        {classroomId && <button type="button" disabled={disabled} className={iconButton} aria-label="Mention someone" aria-expanded={mentionsOpen} onMouseDown={event => event.preventDefault()} onClick={() => {
          if (mentionsOpen || activeMention) {
            setMentionsOpen(!mentionsOpen); textareaRef.current?.focus(); return
          }
          const start = textareaRef.current?.selectionStart ?? draft.length
          const end = textareaRef.current?.selectionEnd ?? start
          const prefix = draft.slice(0, start)
          const insertion = `${prefix}${prefix && !/\s$/.test(prefix) ? ' ' : ''}@`
          const value = insertion + draft.slice(end)
          if (value.length > MAX_LENGTH) return
          setDraft(value); updateMention(value, insertion.length, insertion.length)
          requestAnimationFrame(() => { textareaRef.current?.focus(); textareaRef.current?.setSelectionRange(insertion.length, insertion.length) })
        }}><AtSign aria-hidden="true" className="size-4" /></button>}
        <label htmlFor="class-chat-message" className="sr-only">Message this class</label>
        <Textarea
          ref={textareaRef}
          id="class-chat-message"
          rows={1}
          disabled={disabled}
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => { setDraft(event.currentTarget.value); updateMention(event.currentTarget.value, event.currentTarget.selectionStart, event.currentTarget.selectionEnd) }}
          onSelect={event => updateMention(event.currentTarget.value, event.currentTarget.selectionStart, event.currentTarget.selectionEnd)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-controls={mentionsOpen ? mentionsId : undefined}
          aria-activedescendant={mentionsOpen ? activeOptionId : undefined}
          placeholder="Aa"
          className="max-h-32 min-h-9 min-w-0 flex-1 resize-none rounded-md border-0 bg-muted px-4 py-2 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring dark:bg-muted"
        />
        <button type="button" disabled={disabled} className={iconButton} aria-label="Add emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((current) => !current)}>
          <Smile aria-hidden="true" className="size-4" />
        </button>
        <Button type="submit" size="icon" disabled={!canSend} aria-label="Send class chat message" className="size-9 shrink-0 bg-brand text-brand-foreground hover:bg-brand/90">
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
