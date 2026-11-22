import { ClassroomFeedSkeleton } from '../ui/classroom-skeletons'
import { MessagesSquare } from 'lucide-react'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { Button } from '@/components/ui/button'
import { DiscussionComposer } from '../forms/discussion-composer'
import { useClassroomDiscussion } from '../hooks/use-classroom-discussion'
import type { Classroom } from '../types/classroom-types'
import { DiscussionPost } from '../ui/discussion-post'

export function ClassroomFeedView({ classroom }: { classroom: Classroom }) {
  const { user } = useAuthSession()
  const feed = useClassroomDiscussion(classroom.id)
  const authorName = user?.name ?? 'Class member'
  const owned = classroom.access === 'owner'
  return <section aria-labelledby="discussion-heading" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4 sm:px-7"><div><h3 id="discussion-heading" className="text-sm font-semibold">Discussion</h3><p className="mt-1 text-xs text-muted-foreground">Class updates, questions, and conversations.</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">Class members only</span></header>
    <div className="px-4 py-5 sm:px-7 sm:py-7">
      {feed.error && <div role="alert" className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm"><p>{feed.error}</p><Button variant="ghost" size="sm" onClick={() => void feed.reload()}>Retry loading discussion</Button></div>}
      {feed.loading ? <ClassroomFeedSkeleton /> : feed.posts.length > 0 ? <div className="divide-y divide-border/60">{feed.posts.map(post => <DiscussionPost key={post.id} post={post} classroomId={classroom.id} currentUserId={user?.id} currentUserName={authorName} disabled={feed.readOnly || feed.busy} onReact={(emoji, active) => void feed.react(post.id, emoji, active)} onComment={() => void feed.reload()}
        onEdit={owned && post.authorId === user?.id ? (body, expectedEditedAt) => feed.edit(post.id, body, expectedEditedAt) : undefined} />)}</div> : !feed.error && <div className="flex min-h-52 flex-col items-center justify-center gap-3 py-10 text-center"><MessagesSquare aria-hidden="true" className="size-8 text-muted-foreground/60" /><h4 className="text-sm font-medium">No class posts yet</h4><p className="max-w-xs text-sm leading-6 text-muted-foreground">{owned ? 'Share an update or a question to start the conversation with your class.' : 'Your educator’s updates will appear here. Open a post to add a class comment or reaction.'}</p></div>}
      {feed.next && <Button variant="ghost" className="my-4 w-full text-xs" disabled={feed.busy} onClick={() => void feed.loadOlder()}>Load older posts</Button>}
      {feed.readOnly && !feed.loading && !feed.error && <p className="mt-4 text-xs text-muted-foreground">This classroom is archived. Discussion is read-only.</p>}
      {owned && <div className="mt-5 border-t border-border pt-5"><h4 className="mb-3 text-xs font-medium text-muted-foreground">Share with your class</h4><DiscussionComposer id="class-post" label="Write a class post" placeholder="Share an update or ask your class a question…" authorName={authorName} maxLength={4000} submitLabel="Post to class" disabled={feed.loading || feed.readOnly || feed.busy} onSubmit={feed.create} /></div>}
    </div>
  </section>
}
