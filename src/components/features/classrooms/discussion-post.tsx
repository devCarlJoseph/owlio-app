import { MessageCircle } from "lucide-react"
import { AvatarGroup } from "@/components/ui/avatar"
import { DiscussionComposer } from "./discussion-composer"
import type { ReactionState } from "./discussion-reaction-data"
import { DiscussionReactions } from "./discussion-reactions"
import { DiscussionText } from "./discussion-text"
import { PersonAvatar } from "./classroom-ui"
import type { ClassroomPost } from "./classroom-types"

function displayDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function participantNames(post: ClassroomPost) {
  const names = new Set<string>()
  post.comments.forEach((comment) => names.add(comment.authorName))
  return [...names]
}

export function DiscussionPost({
  post,
  open,
  reactions,
  currentUserName,
  onToggleOpen,
  onToggleReaction,
  onReply,
}: {
  post: ClassroomPost
  open: boolean
  reactions: ReactionState
  currentUserName: string
  onToggleOpen: () => void
  onToggleReaction: (emoji: string) => void
  onReply: (body: string) => void
}) {
  const lastReply = post.comments[post.comments.length - 1]
  const repliers = participantNames(post)

  return (
    <article aria-labelledby={`post-author-${post.id}`} className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <header className="flex items-start gap-3">
        <PersonAvatar name={post.authorName} size="lg" />
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <div className="min-w-0">
            <h4 id={`post-author-${post.id}`} className="truncate text-sm font-semibold text-foreground">{post.authorName}</h4>
            <p className="text-xs capitalize text-muted-foreground">{post.authorRole} · {post.kind} · class members</p>
          </div>
          <time dateTime={post.createdAt} className="text-xs text-muted-foreground">{displayDate(post.createdAt)}</time>
        </div>
      </header>

      <div className="mt-3 space-y-1 text-sm leading-6 text-foreground/90 sm:pl-[3.25rem]">
        {post.title && <p className="font-semibold text-foreground">{post.title}</p>}
        <DiscussionText text={post.body} />
      </div>

      <div className="mt-3 space-y-3 sm:pl-[3.25rem]">
        <DiscussionReactions postId={post.id} reactions={reactions} onToggle={onToggleReaction} />

        {post.comments.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`thread-${post.id}`}
            onClick={onToggleOpen}
            className="flex min-h-9 items-center gap-2 rounded-md text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AvatarGroup>
              {repliers.slice(0, 3).map((name) => <PersonAvatar key={name} name={name} size="sm" />)}
            </AvatarGroup>
            <span>
              {post.comments.length} {post.comments.length === 1 ? "reply" : "replies"} · last reply {displayDate(lastReply.createdAt)}
            </span>
          </button>
        )}

        {post.comments.length === 0 && !open && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`thread-${post.id}`}
            onClick={onToggleOpen}
            className="flex min-h-9 items-center gap-1.5 rounded-md text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MessageCircle aria-hidden="true" className="size-3.5" /> Reply
          </button>
        )}
      </div>

      {open && (
        <div id={`thread-${post.id}`} className="mt-4 space-y-3 border-t border-border pt-4 sm:pl-[3.25rem]">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <PersonAvatar name={comment.authorName} size="sm" />
              <div className="min-w-0 flex-1 rounded-xl bg-muted/60 px-3 py-2">
                <p className="text-xs font-semibold text-foreground">
                  {comment.authorName} <span className="font-normal text-muted-foreground">· {comment.authorRole} · {displayDate(comment.createdAt)}</span>
                </p>
                <DiscussionText text={comment.body} className="mt-1 text-sm text-foreground/90" />
              </div>
            </div>
          ))}
          <DiscussionComposer
            id={`reply-${post.id}`}
            label={`Reply to ${post.authorName}`}
            placeholder="Write a reply…"
            authorName={currentUserName}
            onSubmit={onReply}
          />
        </div>
      )}
    </article>
  )
}
