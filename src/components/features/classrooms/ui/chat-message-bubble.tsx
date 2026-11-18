import { Reply } from 'lucide-react'
import { DiscussionText } from './discussion-text'
import { PersonAvatar } from './classroom-ui'
import { chatTimeLabel } from '../utils/chat-format'
import type { ClassroomChatMessage } from '../types/classroom-types'
import { ChatMessageReceipt } from './chat-message-receipt'
import { ChatMessageReactions } from './chat-message-reactions'
import { ChatVoicePlayer } from './chat-voice-player'

export function ChatMessageBubble({ classroomId, message, mine, showHeader, highlighted, mentioned = false, onReply, onJumpToMessage, onReact }: {
  classroomId: string
  message: ClassroomChatMessage
  mine: boolean
  showHeader: boolean
  highlighted: boolean
  mentioned?: boolean
  onReply: () => void
  onJumpToMessage: (messageId: string) => void
  onReact?: (emoji: string, active: boolean) => Promise<void>
}) {
  const avatarClass = 'size-8 shrink-0 @min-[30rem]/class-chat:size-10'

  return <li id={`chat-message-${message.id}`} className={`group/message flex min-w-0 max-w-full items-end gap-1.5 rounded-2xl transition-colors motion-reduce:transition-none @min-[30rem]/class-chat:gap-2 ${highlighted ? 'bg-brand-soft ring-2 ring-brand/55' : ''} ${mine ? 'flex-row-reverse self-end' : 'self-start'} ${showHeader ? 'mt-2' : ''}`}>
    {showHeader
      ? <PersonAvatar name={message.authorName} className={`${avatarClass} rounded-[10px] after:rounded-[inherit] [&_[data-slot=avatar-fallback]]:rounded-[inherit]`} />
      : <span aria-hidden="true" className={avatarClass} />}
    <article aria-label={`${message.authorName}, ${message.createdAt}`} className={`min-w-0 max-w-[34rem] space-y-1.5 rounded-[15px] px-3 py-2.5 text-sm leading-5 [overflow-wrap:anywhere] ${mine ? 'rounded-br-sm bg-brand text-brand-foreground' : 'rounded-bl-sm bg-brand-soft text-foreground'}`}>
      {mentioned && <p className="text-xs font-medium text-brand">Mentioned you</p>}
      {showHeader && !mine && <p className="text-xs font-semibold text-brand-soft-foreground">{message.authorName}{message.authorRole === 'educator' && <span className="ml-1.5 text-[11px] font-normal">· Educator</span>}</p>}
      {message.replyTo && <button type="button" onClick={() => onJumpToMessage(message.replyTo!.messageId)} aria-label={`Replying to ${message.replyTo.authorName}: ${message.replyTo.excerpt}. Go to original message`} className="block w-full max-w-full rounded-lg border-l-2 border-current bg-background/15 px-2.5 py-1.5 text-left text-xs outline-none hover:bg-background/25 focus-visible:ring-2 focus-visible:ring-ring"><span className="mb-0.5 block font-semibold">Replying to {message.replyTo.authorName}</span><span className="line-clamp-2 [overflow-wrap:anywhere]">{message.replyTo.excerpt}</span></button>}
      {message.voiceType ? <ChatVoicePlayer classroomId={classroomId} messageId={message.id} voiceType={message.voiceType} /> : <DiscussionText text={message.body} />}
      <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
        {(onReact || message.reactions) && <ChatMessageReactions reactions={message.reactions ?? {}} onReact={onReact} />}
        <div className={`ml-auto flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1 text-[11px] ${mine ? 'text-brand-foreground' : 'text-muted-foreground'}`}>
          {mine && <ChatMessageReceipt classroomId={classroomId} messageId={message.id} seenCount={message.seenCount} />}
          <time dateTime={message.createdAt} title={message.createdAt}>{chatTimeLabel(message.createdAt)}</time>
        </div>
      </div>
    </article>
    <button type="button" onClick={onReply} aria-label={`Reply to ${message.authorName}`} className="inline-flex size-8 shrink-0 items-center justify-center self-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [@media(hover:hover)_and_(pointer:fine)]:group-not-hover/message:group-not-focus-within/message:opacity-0"><Reply aria-hidden="true" className="size-4" /></button>
  </li>
}
