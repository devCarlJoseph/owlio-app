import { useMemo, useState } from "react"
import { ArrowDownUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, WorkspaceRole } from "./classroom-types"
import { PersonAvatar } from "./classroom-ui"
import { DiscussionComposer } from "./discussion-composer"
import { DiscussionPost } from "./discussion-post"
import type { ReactionState } from "./discussion-reaction-data"

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
  const currentUserName = authorRole === "student" ? "You · demo learner" : "You · demo educator"
  const [newestFirst, setNewestFirst] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [reactions, setReactions] = useState<Record<string, ReactionState>>({})
  const [status, setStatus] = useState("")

  const posts = useMemo(
    () => (newestFirst ? classroom.posts : [...classroom.posts].reverse()),
    [classroom.posts, newestFirst],
  )
  const previewMembers = classroom.members.slice(0, 4)

  const toggleReaction = (postId: string, emoji: string) => {
    setReactions((current) => {
      const state = current[postId] ?? {}
      const entry = state[emoji] ?? { count: 0, mine: false }
      const next = entry.mine
        ? { count: entry.count - 1, mine: false }
        : { count: entry.count + 1, mine: true }
      return { ...current, [postId]: { ...state, [emoji]: next } }
    })
  }

  const handlePost = (body: string) => {
    createPost(classroom.id, { title: "", body, authorRole })
    setNewestFirst(true)
    setStatus("Comment added for this preview session only. It was not saved.")
  }

  const handleReply = (postId: string, body: string) => {
    addComment(classroom.id, postId, body, authorRole)
    setStatus("Reply added for this preview session only. It was not saved.")
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section aria-labelledby="discussion-heading" className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="discussion-heading" className="flex items-center gap-2 text-lg font-semibold text-foreground">
            Discussion
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{classroom.posts.length}</span>
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={() => setNewestFirst((current) => !current)}>
            <ArrowDownUp aria-hidden="true" /> {newestFirst ? "Recent" : "Oldest"}
          </Button>
        </div>

        <p role="status" className="min-h-5 text-sm text-amber-800">{status}</p>

        {posts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-sm text-muted-foreground">No discussions in this classroom yet. Start one below.</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <DiscussionPost
                key={post.id}
                post={post}
                open={openId === post.id}
                reactions={reactions[post.id] ?? {}}
                currentUserName={currentUserName}
                onToggleOpen={() => setOpenId(openId === post.id ? null : post.id)}
                onToggleReaction={(emoji) => toggleReaction(post.id, emoji)}
                onReply={(body) => handleReply(post.id, body)}
              />
            ))}
          </div>
        )}

        <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-background via-background to-transparent px-1 pb-2 pt-4">
          <DiscussionComposer
            id="discussion-composer"
            label="Write a comment for this classroom"
            authorName={currentUserName}
            onSubmit={handlePost}
          />
          <p className="mt-2 text-xs text-muted-foreground">Visible to members of this class in this preview only. Nothing here is saved to the server.</p>
        </div>
      </section>

      <aside aria-label="Class participants">
        <Card>
          <CardContent className="gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">Participants</h4>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Preview</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{classroom.members.length} {classroom.members.length === 1 ? "member" : "members"}</p>
            <ul className="space-y-2.5">
              {previewMembers.map((member) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <PersonAvatar name={member.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{member.role}</p>
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
