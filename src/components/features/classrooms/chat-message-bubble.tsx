import { Reply } from "lucide-react"
import type { ReactionState } from "./discussion-reaction-data"
import { DiscussionReactions } from "./discussion-reactions"
import { DiscussionText } from "./discussion-text"
import { PersonAvatar } from "./classroom-ui"
import type { ClassroomChatMessage } from "./classroom-types"

export function ChatMessageBubble({
  message,
  mine,
  showHeader,
  highlighted,
  reactions,
  onToggleReaction,
  onReply,
  onJumpToMessage,
}: {
  message: ClassroomChatMessage
  mine: boolean
  showHeader: boolean
  highlighted: boolean
  reactions: ReactionState
  onToggleReaction: (emoji: string) => void
  onReply: () => void
  onJumpToMessage: (messageId: string) => void
}) {
  return (
    <li
      id={`chat-message-${message.id}`}
      className={`group/message flex max-w-[92%] gap-2.5 rounded-2xl transition-colors motion-reduce:transition-none sm:max-w-[75%] ${highlighted ? "bg-primary/10" : ""} ${mine ? "flex-row-reverse self-end" : "self-start"} ${showHeader ? "mt-3 first:mt-0" : ""}`}
    >
      {mine ? null : showHeader ? <PersonAvatar name={message.authorName} size="sm" className="mt-5" /> : <span aria-hidden="true" className="size-6 shrink-0" />}
      <article className={`flex min-w-0 flex-col gap-1 ${mine ? "items-end text-right" : ""}`} aria-label={`${message.authorName}, ${message.createdAt}`}>
        {showHeader && !mine && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            {message.authorName}
            {message.authorRole === "educator" && (
              <span className="rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary">Educator</span>
            )}
          </p>
        )}
        <div className={`flex items-center gap-1 ${mine ? "flex-row-reverse" : ""}`}>
          <div
            className={`min-w-0 rounded-2xl px-3.5 py-2 text-left text-sm leading-5 ${mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground"}`}
          >
            {message.replyTo && (
              <button
                type="button"
                onClick={() => onJumpToMessage(message.replyTo!.messageId)}
                aria-label={`Replying to ${message.replyTo.authorName}: ${message.replyTo.excerpt}. Go to original message`}
                className={`mb-1.5 block w-full rounded-lg border-l-2 px-2 py-1 text-left text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring ${mine ? "border-primary-foreground/60 bg-primary-foreground/15" : "border-primary bg-background/70"}`}
              >
                <span className="block font-semibold">{message.replyTo.authorName}</span>
                <span className="line-clamp-2 break-words opacity-80">{message.replyTo.excerpt}</span>
              </button>
            )}
            <DiscussionText text={message.body} />
            <p className={`mt-1 text-right text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{message.createdAt}</p>
          </div>
          <button
            type="button"
            onClick={onReply}
            aria-label={`Reply to ${message.authorName}`}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-100 outline-none hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring sm:opacity-0 sm:group-hover/message:opacity-100"
          >
            <Reply aria-hidden="true" className="size-4" />
          </button>
        </div>
        <DiscussionReactions postId={`chat-${message.id}`} reactions={reactions} onToggle={onToggleReaction} />
      </article>
    </li>
  )
}
