import { useMemo, useState, type FormEvent } from "react"
import { ArrowDownUp, MessageCircle, Plus, Send } from "lucide-react"
import { AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, ClassroomPost, WorkspaceRole } from "./classroom-types"
import { PersonAvatar } from "./classroom-ui"

function threadParticipants(post: ClassroomPost) {
  const names = new Map<string, string>([[post.authorId, post.authorName]])
  post.comments.forEach((comment) => names.set(comment.authorId, comment.authorName))
  return [...names.values()]
}

function threadTitle(post: ClassroomPost) {
  return post.title || post.body.split("\n")[0].slice(0, 80)
}

export function ClassroomFeedView({
  classroom,
  role,
  onOpenMembers,
}: {
  classroom: Classroom
  role: WorkspaceRole
  onOpenMembers?: () => void
}) {
  const { createPost, addComment } = useClassroomPrototype()
  const authorRole = role === "students" ? "student" : "educator"
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [newestFirst, setNewestFirst] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [status, setStatus] = useState("")

  const posts = useMemo(
    () => (newestFirst ? classroom.posts : [...classroom.posts].reverse()),
    [classroom.posts, newestFirst],
  )
  const previewMembers = classroom.members.slice(0, 4)

  const handlePost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!body.trim()) return
    createPost(classroom.id, { title, body, authorRole })
    setTitle("")
    setBody("")
    setShowForm(false)
    setNewestFirst(true)
    setStatus("Discussion added for this preview session only. It was not saved.")
  }

  const handleReply = (event: FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault()
    const reply = replyDrafts[postId] ?? ""
    if (!reply.trim()) return
    addComment(classroom.id, postId, reply, authorRole)
    setReplyDrafts((current) => ({ ...current, [postId]: "" }))
    setStatus("Reply added for this preview session only. It was not saved.")
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section aria-labelledby="discussion-heading" className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="discussion-heading" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            Discussion
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{classroom.posts.length}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setNewestFirst((current) => !current)}>
              <ArrowDownUp aria-hidden="true" /> {newestFirst ? "Recent" : "Oldest"}
            </Button>
            <Button type="button" size="sm" aria-expanded={showForm} onClick={() => setShowForm((current) => !current)}>
              <Plus aria-hidden="true" /> New discussion
            </Button>
          </div>
        </div>

        {status && <p role="status" className="text-sm text-amber-800">{status}</p>}

        {showForm && (
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <form onSubmit={handlePost} className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="discussion-title">Title <span className="font-normal text-slate-500">(optional)</span></Label>
                  <Input id="discussion-title" value={title} onChange={(event) => setTitle(event.currentTarget.value)} maxLength={100} placeholder="What is this discussion about?" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discussion-body">Message</Label>
                  <Textarea id="discussion-body" value={body} onChange={(event) => setBody(event.currentTarget.value)} maxLength={1000} placeholder="Share an update or ask the class a question…" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">Visible to members of this class in this preview only.</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={!body.trim()}>Post <Send aria-hidden="true" /></Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {posts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-sm text-slate-600">No discussions in this classroom yet.</CardContent>
          </Card>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {posts.map((post) => {
              const open = openId === post.id
              const participants = threadParticipants(post)
              return (
                <li key={post.id}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`thread-${post.id}`}
                    onClick={() => setOpenId(open ? null : post.id)}
                    className="block w-full px-4 py-4 text-left outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                  >
                    <p className="text-xs text-slate-500">{post.kind === "announcement" ? "Announcement" : "Discussion"} · {post.authorName}</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{threadTitle(post)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <AvatarGroup>
                        {participants.slice(0, 5).map((name) => <PersonAvatar key={name} name={name} size="sm" />)}
                      </AvatarGroup>
                      <span>{post.comments.length} {post.comments.length === 1 ? "reply" : "replies"}</span>
                      {post.views !== undefined && <span>· {post.views} views</span>}
                      <span>· {post.comments.length ? `Last reply ${post.comments[post.comments.length - 1].createdAt}` : post.createdAt}</span>
                    </div>
                  </button>
                  {open && (
                    <div id={`thread-${post.id}`} className="space-y-3 border-t border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{post.body}</p>
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2.5 rounded-xl bg-white px-3 py-2.5">
                          <PersonAvatar name={comment.authorName} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800">{comment.authorName} <span className="font-normal text-slate-500">· {comment.authorRole} · {comment.createdAt}</span></p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{comment.body}</p>
                          </div>
                        </div>
                      ))}
                      <form onSubmit={(event) => handleReply(event, post.id)} className="flex gap-2">
                        <Label htmlFor={`reply-${post.id}`} className="sr-only">Reply to {threadTitle(post)}</Label>
                        <Input
                          id={`reply-${post.id}`}
                          value={replyDrafts[post.id] ?? ""}
                          onChange={(event) => setReplyDrafts((current) => ({ ...current, [post.id]: event.currentTarget.value }))}
                          maxLength={500}
                          placeholder="Write a reply…"
                          className="min-w-0 bg-white"
                        />
                        <Button type="submit" variant="outline" size="icon" disabled={!replyDrafts[post.id]?.trim()} aria-label="Send reply">
                          <MessageCircle aria-hidden="true" />
                        </Button>
                      </form>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <aside aria-label="Class participants">
        <Card>
          <CardContent className="gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-900">Participants</h4>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Preview</Badge>
            </div>
            <p className="text-xs text-slate-500">{classroom.members.length} {classroom.members.length === 1 ? "member" : "members"}</p>
            <ul className="space-y-2.5">
              {previewMembers.map((member) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <PersonAvatar name={member.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                    <p className="text-xs capitalize text-slate-500">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
            {onOpenMembers && (
              <Button type="button" variant="ghost" size="sm" className="justify-start px-0 text-blue-700" onClick={onOpenMembers}>View all</Button>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
