import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { AtSign, Paperclip, Send, Smile, X } from "lucide-react"
import { cn } from '@/lib/utils'
import type { ChatMentions } from '@/services/api/classroom-chat.service'
import { ChatMentionPicker, type ChatMentionPickerHandle } from './chat-mention-picker'
import { ChatVoiceRecorder } from './chat-voice-recorder'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ClassroomChatReplyRef } from "../types/classroom-types"
import { REACTION_CHOICES } from "../contents/discussion-reaction-data"

const MAX_LENGTH = 500
const containsMention = (body: string, name: string) => new RegExp(`(^|\\s)@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|\\s|[.,!?;:])`).test(body)

const iconButton =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-brand-soft-foreground outline-none hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent @min-[30rem]/class-chat:size-9"

export function ChatComposer({
  onSend,
  onSendVoice,
  replyingTo,
  onCancelReply,
  disabled = false,
  classroomId,
  userId,
  canMentionStudents = false,
}: {
  onSend: (body: string, mentions?: ChatMentions) => void | Promise<boolean>
  onSendVoice?: (audio: Blob, requestId: string) => Promise<boolean>
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
    <form onSubmit={submit} className="max-h-[55%] shrink-0 overflow-y-auto px-3 pt-1 pb-3 @min-[30rem]/class-chat:px-6" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMentionsOpen(false) }}>
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
      <div className="flex min-w-0 items-end gap-0.5 rounded-[15px] bg-brand-soft p-1.5 @min-[30rem]/class-chat:gap-1">
        <button type="button" disabled className={cn(iconButton, onSendVoice && 'hidden @min-[30rem]/class-chat:inline-flex')} aria-label="Attach a file (not available yet)" title="Attachments are not available yet">
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
          placeholder="Your message"
          className="max-h-28 min-h-8 min-w-0 flex-1 resize-none rounded-lg border-0 bg-transparent px-1.5 py-1.5 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring dark:bg-transparent @min-[30rem]/class-chat:min-h-9 @min-[30rem]/class-chat:px-2"
        />
        <button type="button" disabled={disabled} className={iconButton} aria-label="Add emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((current) => !current)}>
          <Smile aria-hidden="true" className="size-4" />
        </button>
        {onSendVoice && <ChatVoiceRecorder onSend={onSendVoice} triggerClassName={iconButton} disabled={disabled} />}
        <Button type="submit" variant="ghost" size="icon" disabled={!canSend} aria-label="Send class chat message" className="size-8 shrink-0 rounded-lg text-brand-soft-foreground hover:bg-background/80 hover:text-brand-soft-foreground @min-[30rem]/class-chat:size-9">
          <Send aria-hidden="true" />
        </Button>
      </div>
      {draft.length >= 400 && <p aria-live="polite" className="mt-1 px-1 text-right text-[11px] text-muted-foreground">{draft.length}/{MAX_LENGTH}</p>}
    </form>
  )
}
