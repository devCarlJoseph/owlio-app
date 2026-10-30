import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ArrowDownUp, CalendarDays, ClipboardList, Pin, Search, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useClassroomPrototype } from './classroom-prototype-context'
import { previewAuthor } from './classroom-preview-store'
import type { Classroom, ClassroomPost, WorkspaceRole } from './classroom-types'
import { PersonAvatar } from './classroom-ui'
import { DiscussionPost } from './discussion-post'
import { useNow } from './use-now'

export function ClassroomFeedView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { createPost, addComment, togglePostReaction } = useClassroomPrototype()
  const author = previewAuthor(role)
  const [newestFirst, setNewestFirst] = useState(true)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const [postKind, setPostKind] = useState<'announcement' | 'discussion'>('discussion')
  const [draft, setDraft] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const posts = classroom.posts.filter(post => (kind === 'all' || post.kind === kind)
    && [post.body, post.title, post.authorName].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (newestFirst ? -1 : 1) * (Date.parse(a.createdAt) - Date.parse(b.createdAt)))
  const featured = posts.filter(post => post.kind === 'announcement')
  const discussions = posts.filter(post => post.kind !== 'announcement')
  const base = `/${role}/classrooms/${classroom.id}`
  const now = useNow(true, 60000)
  const session = [...classroom.sessions].filter(item => new Date(`${item.date}T${item.time || '23:59'}`).getTime() >= now)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0]
  const activities = classroom.activities.filter(item => item.status === 'Published' && item.dueDate && new Date(`${item.dueDate}T23:59`).getTime() >= now)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.trim()) return
    createPost(classroom.id, { title: '', body: draft, authorRole: author.role, kind: postKind })
    setDraft(''); setStatus('Posted to enrolled class members in this preview. Resets on refresh.')
  }
  const renderPost = (post: ClassroomPost) => <DiscussionPost key={post.id} post={post} open={openId === post.id}
    currentUserName={author.name} reactions={Object.fromEntries(Object.entries(post.reactionMembers ?? {}).map(([emoji, members]) => [emoji, { count: members.length, mine: members.includes(author.id) }]))}
    onToggleOpen={() => setOpenId(openId === post.id ? null : post.id)}
    onToggleReaction={emoji => togglePostReaction(classroom.id, post.id, emoji)}
    onReply={body => { addComment(classroom.id, post.id, body, author.role); setStatus('Reply added in this preview. Resets on refresh.') }} />

  return <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
    <section aria-labelledby="discussion-heading" className="min-w-0 space-y-5">
      <h3 id="discussion-heading" className="sr-only">Discussion</h3>
      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center gap-3"><PersonAvatar name={author.name} /><div><p className="text-sm font-semibold">{author.name}</p><p className="text-xs text-muted-foreground">Share with enrolled class members · preview</p></div></div>
        <label htmlFor="class-post" className="sr-only">Write a class post</label>
        <Textarea id="class-post" value={draft} onChange={event => setDraft(event.target.value)} maxLength={2000} placeholder="Ask a question or share something with your class…" className="min-h-24 bg-muted/30" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          {role !== 'students' ? <label className="flex items-center gap-2 text-xs text-muted-foreground">Post type
            <select value={postKind} onChange={event => setPostKind(event.target.value as typeof postKind)} className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="discussion">Discussion</option><option value="announcement">Announcement · featured</option>
            </select></label> : <span className="text-xs text-muted-foreground">Discussion post</span>}
          <Button type="submit" disabled={!draft.trim()}><Send aria-hidden="true" />Post to class</Button>
        </div>
      </form>
      {status && <p role="status" className="text-sm text-brand-soft-foreground">{status}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-48"><Search aria-hidden="true" className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><span className="sr-only">Search classroom posts</span><Input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this discussion" className="bg-card pl-9" /></label>
        <label className="sr-only" htmlFor="post-filter">Filter posts</label><select id="post-filter" value={kind} onChange={event => setKind(event.target.value)} className="h-9 rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="all">All posts</option><option value="announcement">Announcements</option><option value="discussion">Discussions</option></select>
        <Button variant="outline" onClick={() => setNewestFirst(value => !value)}><ArrowDownUp aria-hidden="true" />{newestFirst ? 'Newest' : 'Oldest'}</Button>
      </div>
      {featured.length > 0 && <section aria-label="Featured announcements" className="space-y-3"><h4 className="flex items-center gap-2 text-sm font-semibold"><Pin aria-hidden="true" className="size-4 text-brand" />Featured announcements</h4>{featured.map(renderPost)}</section>}
      {discussions.length > 0 && <section aria-label="Class discussions" className="space-y-4"><h4 className="text-sm font-semibold">Class discussions <span className="font-normal text-muted-foreground">· {discussions.length}</span></h4>{discussions.map(renderPost)}</section>}
      {posts.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center"><h4 className="font-semibold">{classroom.posts.length ? 'No matching posts' : 'Start the conversation'}</h4><p className="mt-2 text-sm text-muted-foreground">{classroom.posts.length ? 'Try a different search or post type.' : 'Ask your first question using the composer above.'}</p>{classroom.posts.length > 0 && <Button variant="outline" className="mt-3" onClick={() => { setQuery(''); setKind('all') }}>Clear post filters</Button>}</div>}
    </section>
    <aside aria-label="Classroom information" className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5"><h3 className="font-semibold">Upcoming</h3><p className="mt-1 text-xs text-muted-foreground">Preview · browser local time</p>
        {session ? <Link to={`${base}?tab=schedule`} className="mt-4 flex gap-3 rounded-lg outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"><CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" /><span><span className="block text-sm font-medium">{session.title}</span><span className="mt-1 block text-xs text-muted-foreground">{session.date} · {session.time}</span></span></Link> : <p className="mt-4 text-sm text-muted-foreground">No upcoming sessions. Check back for the next class.</p>}
        <div className="mt-4 space-y-4 border-t border-border pt-4">{activities.length ? activities.map(activity => <Link key={activity.id} to={`${base}/classwork/${activity.id}`} className="flex gap-3 rounded-lg outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"><ClipboardList aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" /><span><span className="block text-sm font-medium">{activity.title}</span><span className="mt-1 block text-xs text-muted-foreground">Assigned activity · due {activity.dueDate}</span></span></Link>) : <p className="text-sm text-muted-foreground">No approaching deadlines.</p>}</div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-5"><h3 className="font-semibold">About this class</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{classroom.description || 'Your instructor has not added a description yet.'}</p><div className="mt-4 flex items-center gap-3 border-t border-border pt-4"><PersonAvatar name={classroom.instructorName} /><div><p className="text-sm font-medium">{classroom.instructorName}</p><p className="text-xs text-muted-foreground">{classroom.ownerWorkspace === 'tutors' ? 'Tutor' : classroom.ownerWorkspace === 'esl' ? 'ESL teacher' : 'Educator'}</p></div></div></section>
      <p className="px-1 text-xs leading-5 text-muted-foreground">Preview assumption: enrolled learners can post discussions and reply. Teachers publish announcements. Production posting and moderation permissions need a backend contract.</p>
    </aside>
  </div>
}
