import { useState, type FormEvent } from "react"
import { Megaphone, MessageCircle, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, WorkspaceRole } from "./classroom-types"

export function ClassroomFeedView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { createPost, addComment } = useClassroomPrototype()
  const [postBody, setPostBody] = useState("")
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [status, setStatus] = useState("")
  const isStudent = role === "students"

  const handlePost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!postBody.trim()) return
    createPost(classroom.id, postBody)
    setPostBody("")
    setStatus("Demo announcement added for this session only. It was not saved.")
  }

  const handleComment = (event: FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault()
    const body = commentDrafts[postId] ?? ""
    if (!body.trim()) return
    addComment(classroom.id, postId, body)
    setCommentDrafts((current) => ({ ...current, [postId]: "" }))
    setStatus("Demo reply added for this session only. It was not saved.")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Class feed</h3>
          <p className="mt-1 text-sm text-slate-600">Announcements and replies for {classroom.name}.</p>
        </div>
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo feed · not saved</Badge>
      </div>

      {status && <p role="status" className="text-sm text-amber-800">{status}</p>}

      {!isStudent && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Megaphone aria-hidden="true" className="size-4 text-blue-700" />
              Share an announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePost} className="space-y-3">
              <Label htmlFor="classroom-announcement" className="sr-only">Announcement message</Label>
              <Textarea
                id="classroom-announcement"
                value={postBody}
                onChange={(event) => setPostBody(event.currentTarget.value)}
                maxLength={1000}
                placeholder="Write an update for this classroom…"
                aria-describedby="announcement-note"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p id="announcement-note" className="text-xs text-slate-500">Visible in this demo class only.</p>
                <Button type="submit" disabled={!postBody.trim()}>
                  Post demo announcement <Send aria-hidden="true" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {classroom.posts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-sm text-slate-600">No demo posts in this classroom yet.</CardContent>
        </Card>
      ) : (
        classroom.posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-800">
                    {post.authorName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <span>
                    <span className="block text-slate-900">{post.authorName}</span>
                    <span className="mt-1 block text-xs font-normal text-slate-500">{post.createdAt} · {post.authorRole}</span>
                  </span>
                </CardTitle>
                <Badge variant="outline" className={post.kind === "announcement"
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-slate-50 text-slate-700"}
                >
                  {post.kind === "announcement" ? "Announcement" : "Discussion"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{post.body}</p>
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-xs font-semibold text-slate-800">{comment.authorName} <span className="font-normal text-slate-500">· {comment.authorRole} · {comment.createdAt}</span></p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{comment.body}</p>
                  </div>
                ))}
                <form onSubmit={(event) => void handleComment(event, post.id)} className="flex gap-2">
                  <Label htmlFor={`comment-${post.id}`} className="sr-only">Reply to {post.authorName}</Label>
                  <Input
                    id={`comment-${post.id}`}
                    value={commentDrafts[post.id] ?? ""}
                    onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.currentTarget.value }))}
                    maxLength={500}
                    placeholder="Write a class reply…"
                    className="min-w-0"
                  />
                  <Button type="submit" variant="outline" size="icon" disabled={!commentDrafts[post.id]?.trim()} aria-label="Send demo reply">
                    <MessageCircle aria-hidden="true" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
