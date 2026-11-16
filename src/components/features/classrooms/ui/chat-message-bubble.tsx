import { Reply } from 'lucide-react'
import { DiscussionText } from './discussion-text'
import { PersonAvatar } from './classroom-ui'
import { chatTimeLabel } from '../utils/chat-format'
import type { ClassroomChatMessage } from '../types/classroom-types'

export function ChatMessageBubble({ message, mine, showHeader, highlighted, mentioned = false, onReply, onJumpToMessage }: {
  message: ClassroomChatMessage
  mine: boolean
  showHeader: boolean
  highlighted: boolean
  mentioned?: boolean
  onReply: () => void
  onJumpToMessage: (messageId: string) => void
}) {
  return <li id={`chat-message-${message.id}`} className={`group/message flex min-w-0 max-w-[95%] items-end gap-2 rounded-2xl transition-colors motion-reduce:transition-none sm:max-w-[85%] ${highlighted ? 'bg-brand-soft' : ''} ${mine ? 'flex-row-reverse self-end' : 'self-start'} ${showHeader ? 'mt-4 first:mt-0' : ''}`}>
    {!mine && (showHeader ? <PersonAvatar name={message.authorName} size="sm" className="mb-5" /> : <span aria-hidden="true" className="w-6 shrink-0" />)}
    <article className={`flex min-w-0 flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`} aria-label={`${message.authorName}, ${message.createdAt}`}>
      {mentioned && <p className="px-3 text-[11px] font-medium text-brand">Mentioned you</p>}
      {showHeader && !mine && <p className="px-3 text-xs text-muted-foreground [overflow-wrap:anywhere]">{message.authorName}{message.authorRole === 'educator' && <span className="ml-1.5 text-[10px]">· Educator</span>}</p>}
      {message.replyTo && <button type="button" onClick={() => onJumpToMessage(message.replyTo!.messageId)} aria-label={`Replying to ${message.replyTo.authorName}: ${message.replyTo.excerpt}. Go to original message`} className="max-w-full rounded-xl border-l-2 border-brand bg-muted px-3 py-2 text-left text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="mb-0.5 block font-medium">Replying to {message.replyTo.authorName}</span><span className="line-clamp-2 [overflow-wrap:anywhere]">{message.replyTo.excerpt}</span></button>}
      <div className={`flex min-w-0 max-w-full items-center gap-1 ${mine ? 'flex-row-reverse' : ''}`}>
        <div className={`min-w-0 rounded-xl px-3 py-2 text-left text-sm leading-5 [overflow-wrap:anywhere] ${mine ? 'bg-brand text-brand-foreground' : 'bg-muted text-foreground'}`}><DiscussionText text={message.body} /></div>
        <button type="button" onClick={onReply} aria-label={`Reply to ${message.authorName}`} className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover/message:opacity-100 sm:group-focus-within/message:opacity-100"><Reply aria-hidden="true" className="size-3.5" /></button>
      </div>
      <time dateTime={message.createdAt} title={message.createdAt} className="px-3 text-[10px] text-muted-foreground">{chatTimeLabel(message.createdAt)}</time>
    </article>
  </li>
}
