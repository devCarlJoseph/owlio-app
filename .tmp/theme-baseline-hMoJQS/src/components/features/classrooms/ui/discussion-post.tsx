import { Users } from 'lucide-react'
import type { DiscussionPostRecord } from '@/services/api/classroom-discussion.service'
import { DiscussionReactions } from './discussion-reactions'
import { DiscussionText } from './discussion-text'
import { PersonAvatar } from './classroom-ui'
import { ClassComments } from './class-comments'

function displayDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function DiscussionPost({ post, classroomId, currentUserName, disabled, onReact, onComment }: {
  post: DiscussionPostRecord; classroomId: string; currentUserName: string; disabled: boolean
  onReact: (emoji: string, active: boolean) => void; onComment: () => void
}) {
  return <article aria-labelledby={`post-author-${post.id}`} className="min-w-0 py-7 first:pt-2">
    <header className="flex items-start gap-3">
      <PersonAvatar name={post.authorName} />
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0"><h4 id={`post-author-${post.id}`} className="text-sm font-semibold">{post.authorName}</h4><p className="mt-0.5 text-[11px] text-muted-foreground">Educator · shared with the class</p></div>
        <time dateTime={post.createdAt} className="text-[11px] text-muted-foreground">{displayDate(post.createdAt)}</time>
      </div>
    </header>
    <div className="mt-3 min-w-0 space-y-4 pl-11">
      <DiscussionText text={post.body} className="text-sm leading-6 text-foreground/80 [overflow-wrap:anywhere]" />
      <DiscussionReactions postId={post.id} disabled={disabled} reactions={Object.fromEntries(post.reactions.map(reaction => [reaction.emoji, reaction]))}
        onToggle={emoji => onReact(emoji, !post.reactions.find(reaction => reaction.emoji === emoji)?.mine)} />
      <h5 className="flex items-center gap-2 text-xs font-medium text-foreground/80">
        <Users aria-hidden="true" className="size-4" />
        {post.commentCount} class {post.commentCount === 1 ? 'comment' : 'comments'}
      </h5>
      <ClassComments classroomId={classroomId} postId={post.id} authorName={currentUserName} disabled={disabled} onComment={onComment} />
    </div>
  </article>
}
