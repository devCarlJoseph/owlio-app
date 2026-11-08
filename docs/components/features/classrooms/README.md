# Classroom component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(classrooms): add organized classroom source copies`

Status: **proposed only**. This document maps the current files in `src/components/features/classrooms/` to a cleaner feature-local layout. The paths below are destinations for a manual migration, not imports that work today. Follow the shared [component rules](../../../sops/component-decomposition.md) and [classroom integration boundary](../../../CLASSROOM_API_INTEGRATION.md).

## Target shape

```text
src/components/features/classrooms/
  classroom-types.ts                 # Shared domain contract; keep at root initially
  contents/                          # Display metadata and labeled preview fixtures
  context/                           # Connected/preview providers and their store
  forms/                             # Input and validation surfaces
  hooks/                             # Stateful reusable hooks
  ui/                                # Classroom-specific tiles, posts, quiz controls
  utils/                             # Pure derivations and quiz calculations
  view/                              # Route screens and their behavioral tests
  tests/                             # Test fixtures only
```

Do not create an empty folder. Treat `src/pages/dashboard/classroom/` as route adapters, `src/services/api/classroom.service.ts` as the connected HTTP boundary, and `src/components/ui/` as domain-neutral primitives; none should be copied into this feature.

## File-to-folder map

All entries name files currently at the **root** of `src/components/features/classrooms/`. A test belongs beside its owner even when the test filename is broader than that owner.

| Proposed destination | Current files |
| --- | --- |
| `context/` | `classroom-prototype-context.ts`, `classroom-prototype-provider.tsx`, `classroom-preview-provider.tsx`, `classroom-preview-store.ts` |
| `contents/` | `classroom-covers.ts`, `classroom-list-meta.ts`, `classroom-preview-data.ts`, `discussion-reaction-data.ts` |
| `forms/` | `chat-composer.tsx`, `classroom-form-dialogs.tsx`, `discussion-composer.tsx`, `quiz-timer-settings.tsx` |
| `ui/` | `chat-header.tsx`, `chat-message-bubble.tsx`, `classroom-card.tsx`, `classroom-list-ui.tsx`, `classroom-preview-notice.tsx`, `classroom-ui.tsx`, `discussion-post.tsx`, `discussion-reactions.tsx`, `discussion-text.tsx`, `quiz-countdown.tsx`, `quiz-leaderboard.tsx`, `quiz-questions.tsx`, `quiz-result-card.tsx`, `quiz-timing-badges.tsx` |
| `utils/` | `classroom-utils.ts`, `quiz-answers.ts`, `quiz-timing.ts`, `quiz-timing.test.ts` |
| `hooks/` | `use-now.ts` |
| `view/` | `classroom-activity-view.tsx`, `classroom-chat-view.tsx`, `classroom-chat.test.tsx`, `classroom-classwork-view.tsx`, `classroom-detail-view.tsx`, `classroom-detail-tabs.test.tsx`, `classroom-discussion.test.tsx`, `classroom-feed-view.tsx`, `classroom-members-view.tsx`, `classroom-members-view.test.tsx`, `classroom-preview.test.tsx` (put beside `context/` instead if it directly tests the provider), `classroom-quiz.test.tsx`, `classroom-records-view.tsx`, `classrooms-view.tsx`, `classrooms-view-accessibility.test.tsx`, `classrooms-view.test.tsx`, `quiz-workspace.tsx` |
| `tests/` | `classroom-test-data.ts`, `classroom-test-fixtures.tsx` |
| Root contract | `classroom-types.ts` |

The two visual aggregators `classroom-ui.tsx` and `classroom-list-ui.tsx` may contain multiple exports; inspect their consumers before deciding whether to split them into separately named `ui/` files. `classroom-preview-data.ts` is example content; `classroom-preview-store.ts` is mutable preview state, **not** content.

## Split large views by responsibility

1. `classrooms-view.tsx`: keep route role, list orchestration, and create/join results in the view. Move only pure filter/sort derivations into `utils/` with tests, and reusable list controls into `ui/`. Keep the existing create/join dialogs in `forms/`; do not move their submission logic without tracing it.
2. `classroom-classwork-view.tsx`: extract activity list/detail presentation into `ui/` only after identifying ownership, submission state, and review/release boundaries. Keep student submission and teacher review paths distinct.
3. `classroom-records-view.tsx`: isolate attendance/results display units in `ui/`; preserve the distinction between preview attendance, live-room presence, and official records.
4. `quiz-workspace.tsx`: keep timing and answer evaluation in `utils/`, composer settings in `forms/`, and countdown/question/result components in `ui/`. Preserve timer cleanup and accessibility.
5. Keep `classroom-types.ts` as the shared contract until there is a real type-cycle or separate public contract; avoid a barrel that re-exports everything.

## Context and data boundaries

`ClassroomPrototypeProvider` currently selects the explicit preview provider when API integration is paused; otherwise it uses a connected session provider keyed by account/roles. Preserve its mounting in `src/pages/dashboard/layout.tsx`, account-switch remounting, canceled/stale request handling, and one-time join-code handling. Keep `classroom-prototype-context.ts` and the provider/store together, but do **not** merge preview examples with connected data or infer authorization from `/students` or `/educators` URLs. Connected writes still need confirmed service contracts.

The existing `classroom-preview.test.tsx` exercises this boundary. Move the test with the provider if that improves discoverability; whichever location you choose, keep its imports and fixture behavior intact. Do not create a second global classroom context.

## Manual cutover sequence

1. Record the current imports from `src/pages/dashboard/classroom/{index,detail,activity}.tsx`, `src/pages/dashboard/layout.tsx`, other features, tests, and docs. Make a baseline of the focused classroom tests.
2. Move one group at a time: pure `utils/` and `contents/`, then `ui/` and `forms/`, then views and route adapters, and **last** the provider/context boundary. Keep source paths working at each step; update imports and relevant doc links in the same slice.
3. Example after moving the list view (illustrative future code, **not** an import to use before the move):

```tsx
import { ClassroomsView } from "@/components/features/classrooms/view/classrooms-view"
```

4. Run focused classroom tests, `npm run build`, focused and repository lint, and `git diff --check`. Exercise student and educator preview routes; for connected behavior use confirmed contracts and an authorized environment rather than treating the preview as evidence of a live save.
5. Review the diff for remounts, changed data ownership, stale paths, duplicate exports, and missing empty/error/unavailable states before migrating the next group.

Debugging path: page adapter -> `view/` -> `context/` -> preview store or API service -> `ui/`/`forms/`. If a list is wrong, inspect its filter helper and provider source before restyling the card.

[All feature plans](../../../component-breakdowns.md) | [Verification](../../../sops/verification.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/classrooms/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `chat-composer.tsx`

Current file: `src/components/features/classrooms/chat-composer.tsx`

```tsx
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { Paperclip, Send, Smile, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ClassroomChatReplyRef } from "./classroom-types"
import { REACTION_CHOICES } from "./discussion-reaction-data"

const MAX_LENGTH = 500

const iconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"

export function ChatComposer({
  onSend,
  replyingTo,
  onCancelReply,
}: {
  onSend: (body: string) => void
  replyingTo: ClassroomChatReplyRef | null
  onCancelReply: () => void
}) {
  const [draft, setDraft] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = draft.trim().length > 0

  useEffect(() => {
    if (replyingTo) textareaRef.current?.focus()
  }, [replyingTo])

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (!canSend) return
    onSend(draft.trim())
    setDraft("")
    setEmojiOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape" && replyingTo) {
      onCancelReply()
      return
    }
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  const insertEmoji = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`.slice(0, MAX_LENGTH))
    setEmojiOpen(false)
    textareaRef.current?.focus()
  }

  return (
    <form onSubmit={submit} className="border-t border-border p-3">
      {replyingTo && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border-l-2 border-primary bg-muted px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">Replying to {replyingTo.authorName}</p>
            <p className="line-clamp-2 break-words text-muted-foreground">{replyingTo.excerpt}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      )}
      {emojiOpen && (
        <div role="group" aria-label="Insert emoji" className="mb-2 flex flex-wrap gap-1">
          {REACTION_CHOICES.map(({ emoji, label }) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Insert ${label}`}
              onClick={() => insertEmoji(emoji)}
              className="inline-flex size-8 items-center justify-center rounded-md text-lg outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true">{emoji}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-1.5 rounded-2xl border border-border bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/50">
        <button type="button" disabled className={iconButton} aria-label="Attach a file (not available yet)" title="Attachments are not available yet">
          <Paperclip aria-hidden="true" className="size-4" />
        </button>
        <label htmlFor="class-chat-message" className="sr-only">Message this class</label>
        <Textarea
          ref={textareaRef}
          id="class-chat-message"
          rows={1}
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type message…"
          className="max-h-32 min-h-9 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-2 shadow-none focus-visible:ring-0"
        />
        <button type="button" className={iconButton} aria-label="Add emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((current) => !current)}>
          <Smile aria-hidden="true" className="size-4" />
        </button>
        <Button type="submit" size="icon" disabled={!canSend} aria-label="Send class chat message" className="shrink-0 rounded-full">
          <Send aria-hidden="true" />
        </Button>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
        <span>Enter to send · Shift+Enter for a new line</span>
        {draft.length >= 400 && <span aria-live="polite">{draft.length}/{MAX_LENGTH}</span>}
      </div>
    </form>
  )
}
```

### `chat-header.tsx`

Current file: `src/components/features/classrooms/chat-header.tsx`

```tsx
import { useId } from "react"
import { Search, Video, X } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatMeetingCode } from "@/lib/meeting-code"
import type { Classroom, WorkspaceRole } from "./classroom-types"
import { getInitials } from "./classroom-utils"

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

export function ChatHeader({
  classroom,
  role,
  searchOpen,
  query,
  onToggleSearch,
  onQueryChange,
}: {
  classroom: Classroom
  role: WorkspaceRole
  searchOpen: boolean
  query: string
  onToggleSearch: () => void
  onQueryChange: (value: string) => void
}) {
  const searchId = useId()
  const meetingHref = classroom.meetingId
    ? `/${role}/classrooms/meeting-room?room=${encodeURIComponent(formatMeetingCode(classroom.meetingId))}`
    : null

  return (
    <header className="border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
          {getInitials(classroom.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{classroom.name}</h3>
          <p className="text-xs text-muted-foreground">
            {classroom.members.length} {classroom.members.length === 1 ? "member" : "members"} · class only
          </p>
        </div>
        <Badge variant="outline" className="hidden border-amber-200 bg-amber-50 text-amber-800 sm:inline-flex">Preview · not synced</Badge>
        <button
          type="button"
          className={iconButton}
          aria-label={searchOpen ? "Close message search" : "Search messages"}
          aria-expanded={searchOpen}
          aria-controls={searchId}
          onClick={onToggleSearch}
        >
          {searchOpen ? <X aria-hidden="true" className="size-4" /> : <Search aria-hidden="true" className="size-4" />}
        </button>
        {meetingHref && (
          <Link to={meetingHref} className={iconButton} aria-label="Join class meeting" title="Join class meeting">
            <Video aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>
      {searchOpen && (
        <div id={searchId} className="mt-3">
          <label htmlFor={`${searchId}-input`} className="sr-only">Search messages in this class chat</label>
          <Input
            id={`${searchId}-input`}
            type="search"
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            placeholder="Search messages…"
          />
        </div>
      )}
    </header>
  )
}
```

### `chat-message-bubble.tsx`

Current file: `src/components/features/classrooms/chat-message-bubble.tsx`

```tsx
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
```

### `classroom-activity-view.tsx`

Current file: `src/components/features/classrooms/classroom-activity-view.tsx`

```tsx
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useClassroomPrototype } from './classroom-prototype-context'
import { ClassroomPreviewNotice } from './classroom-preview-notice'
import { QuizWorkspace } from './quiz-workspace'
import { UnderDevelopment } from './classroom-ui'

export function ClassroomActivityView() {
  return API_INTEGRATION_ENABLED ? <ConnectedActivityView /> : <PreviewActivityView />
}

function ConnectedActivityView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  return <div className="space-y-4"><Link className="underline" to={'/' + role + '/classrooms'}>Back to classrooms</Link>
    <UnderDevelopment title="Classroom activities are not available yet" /></div>
}

function PreviewActivityView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const { classroomId, activityId } = useParams()
  const { getClassroom, submitActivity, reviewSubmission, currentLearnerId } = useClassroomPrototype()
  const [notice, setNotice] = useState('')
  const classroom = classroomId ? getClassroom(classroomId) : undefined
  const activity = classroom?.activities.find(item => item.id === activityId)
  const back = `/${role}/classrooms${classroom ? `/${classroom.id}?tab=classwork` : ''}`
  if (!classroom || !activity) return <section className="space-y-3 rounded-xl border p-6"><h2>Activity unavailable</h2><p>This activity is not available in your classroom view.</p><Link className="underline" to={back}>Back to classroom</Link></section>
  const student = role === 'students'
  const submission = activity.submissions.find(item => item.learnerId === currentLearnerId)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = String(form.get('response') ?? '').trim()
    if (!response) return
    submitActivity(classroom.id, activity.id, response)
    setNotice('Response submitted in this preview tab only. Nothing was uploaded or saved to an account.')
  }
  return <div className="mx-auto max-w-4xl space-y-5">
    <Link className="inline-block rounded text-sm underline outline-none focus-visible:ring-2 focus-visible:ring-ring" to={back}>Back to classroom classwork</Link>
    <ClassroomPreviewNotice role={role} classroomId={classroom.id} />
    <header className="rounded-2xl border border-border bg-card p-6"><p className="text-xs font-medium text-brand-soft-foreground">{classroom.name} · {activity.type} · {activity.status}</p><h2 className="mt-2 text-2xl font-semibold">{activity.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{activity.instructions}</p><p className="mt-3 text-xs text-muted-foreground">{activity.dueDate ? `Due ${activity.dueDate} · ` : ''}Preview activity · individual responses are visible to your instructor.</p></header>
    {notice && <p role="status" className="text-sm">{notice}</p>}
    {student && activity.responseType === 'Quiz' ? <QuizWorkspace classroom={classroom} activity={activity} /> : student ? <section className="rounded-2xl border border-border bg-card p-6">
      {submission ? <div className="space-y-3"><h3 className="font-semibold">Your response · {submission.status}</h3><p className="whitespace-pre-wrap break-words text-sm">{submission.response}</p>{submission.released ? <div className="rounded-lg bg-brand-soft p-4 text-sm"><p className="font-semibold">{submission.evaluation}</p><p className="mt-2 whitespace-pre-wrap">{submission.feedback}</p></div> : <p className="text-sm text-muted-foreground">Your instructor has not released feedback yet.</p>}</div> : <form onSubmit={submit} className="space-y-4"><Label htmlFor="activity-response">{activity.responseType === 'Link' ? 'Your response link' : activity.responseType === 'File' ? 'File description · preview only' : 'Your response'}</Label>{activity.responseType === 'Link' ? <Input id="activity-response" name="response" type="url" required /> : <Textarea id="activity-response" name="response" maxLength={5000} required className="min-h-40" />}<p className="text-xs text-muted-foreground">Shared only with your instructor in this preview. File uploads and account saving are unavailable.</p><Button type="submit">Submit preview response</Button></form>}
    </section> : <section className="space-y-4"><h3 className="text-lg font-semibold">Individual submissions · teacher only</h3>{activity.questions.length > 0 && <div className="rounded-xl border bg-card p-5"><h4 className="font-semibold">Questions</h4>{activity.questions.map(question => <p key={question.id} className="mt-2 text-sm">{question.prompt}</p>)}</div>}{activity.submissions.length === 0 && <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No preview responses yet. Open the student preview and submit this activity.</p>}{activity.submissions.map(item => <article key={item.id} className="space-y-3 rounded-xl border border-border bg-card p-5"><h4 className="font-semibold">{item.learnerName} · {item.status}</h4><p className="whitespace-pre-wrap break-words text-sm">{item.response}</p><form className="space-y-3" onSubmit={event => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      reviewSubmission(classroom.id, activity.id, item.id, String(form.get('evaluation') ?? '').trim(), String(form.get('feedback') ?? '').trim())
      setNotice('Feedback released to this learner in the preview only. Resets on refresh.')
    }}><Label htmlFor={`evaluation-${item.id}`}>Evaluation</Label><Input id={`evaluation-${item.id}`} name="evaluation" defaultValue={item.evaluation ?? ''} maxLength={150} required /><Label htmlFor={`feedback-${item.id}`}>Learner-visible feedback</Label><Textarea id={`feedback-${item.id}`} name="feedback" defaultValue={item.feedback ?? ''} maxLength={2000} required /><p className="text-xs text-muted-foreground">Audience: {item.learnerName} only. This explicitly releases the evaluation and feedback.</p><Button type="submit">Release preview feedback</Button></form></article>)}</section>}
  </div>
}
```

### `classroom-card.tsx`

Current file: `src/components/features/classrooms/classroom-card.tsx`

```tsx
import { ArrowRight, MoreHorizontal } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getClassroomCoverUrl } from "./classroom-covers"
import { getClassroomCategory, getClassroomMeta } from "./classroom-list-meta"
import { StatusChip } from "./classroom-list-ui"
import type { Classroom, WorkspaceRole } from "./classroom-types"

type ClassroomCardProps = {
  classroom: Classroom
  href: string
  role: WorkspaceRole
}

function ClassroomMenu({ classroom, href }: { classroom: Classroom; href: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`More options for ${classroom.name}`}
            className="h-10 w-12 rounded-xl text-muted-foreground"
          />
        }
      >
        <MoreHorizontal aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link to={href} />}>Open class</DropdownMenuItem>
        <DropdownMenuItem render={<Link to={`${href}?tab=classwork`} />}>Classwork</DropdownMenuItem>
        <DropdownMenuItem render={<Link to={`${href}?tab=materials`} />}>Materials</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ClassroomCard({ classroom, href }: ClassroomCardProps) {
  return <Card className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-none ring-0">
    <div className="flex flex-1 items-start gap-4">
      <div className="relative shrink-0">
        <img src={getClassroomCoverUrl(classroom.id)} alt="" className="size-20 rounded-xl object-cover sm:size-24" />
        <img src="/mascot/owlio-mark.png" alt="" className="absolute inset-0 m-auto size-10 object-contain drop-shadow-sm" />
      </div>
      <div className="min-w-0 py-0.5">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-soft-foreground">{getClassroomCategory(classroom)}</p>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug"><Link to={href} className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand">{classroom.name}</Link></h3>
        <p className="mt-2 text-xs text-muted-foreground">{classroom.instructorName || 'Instructor details unavailable'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{classroom.isMock ? `${classroom.previewStatus === 'inactive' ? 'Inactive' : 'Active'} · preview` : classroom.access === 'owner' ? 'Connected classroom' : 'Enrolled classroom'}</p>
      </div>
    </div>
    <div className="flex items-center gap-2.5">
      <Link to={href} aria-label={`View class ${classroom.name}`} className={cn(buttonVariants({ variant: 'secondary' }), 'h-10 flex-1 rounded-xl bg-brand-soft text-brand-soft-foreground hover:bg-brand-soft/70')}>View class</Link>
      <ClassroomMenu classroom={classroom} href={href} />
    </div>
  </Card>
}

const listColumns = "md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_8rem_auto]"

export function ClassroomListHeader({ role }: { role: WorkspaceRole }) {
  const [first, second] = role === "students" ? ["Educator", "Next session"] : ["Learners", "Next session"]

  return (
    <div role="row" className={cn("hidden gap-4 border-b border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 md:grid", listColumns)}>
      <div role="columnheader">Class</div>
      <div role="columnheader">{first}</div>
      <div role="columnheader">{second}</div>
      <div role="columnheader">Status</div>
      <div role="columnheader"><span className="sr-only">Actions</span></div>
    </div>
  )
}

export function ClassroomListRow({ classroom, href, role }: ClassroomCardProps) {
  const { cells, status } = getClassroomMeta(classroom, role)

  return (
    <div role="row" className={cn("grid gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 md:items-center md:gap-4", listColumns)}>
      <div role="cell" className="flex min-w-0 items-center gap-3">
        <img
          src={getClassroomCoverUrl(classroom.id)}
          alt=""
          aria-hidden="true"
          className="size-12 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <Link to={href} className="block truncate rounded text-sm font-semibold text-slate-900 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand">
            {classroom.name}
          </Link>
          {classroom.subject ? (
            <span className="mt-0.5 inline-block max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{classroom.subject}</span>
          ) : null}
        </div>
      </div>
      {cells.map((cell) => (
        <div key={cell.label} role="cell" className="min-w-0 truncate text-sm text-slate-700">
          <span className="mr-1 text-xs text-slate-500 md:sr-only">{cell.label}:</span>
          {cell.value}
        </div>
      ))}
      <div role="cell">
        <span className="mr-1 text-xs text-slate-500 md:sr-only">Status:</span>
        <StatusChip status={status} />
      </div>
      <div role="cell" className="flex items-center justify-between gap-1 md:justify-end">
        <Link
          to={href}
          aria-label={`Open class ${classroom.name}`}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-brand-soft-foreground outline-none hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand"
        >
          Open class <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <ClassroomMenu classroom={classroom} href={href} />
      </div>
    </div>
  )
}
```

### `classroom-chat-view.tsx`

Current file: `src/components/features/classrooms/classroom-chat-view.tsx`

```tsx
import { useEffect, useMemo, useRef, useState } from "react"
import { FileText } from "lucide-react"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, ClassroomChatMessage, ClassroomChatReplyRef, WorkspaceRole } from "./classroom-types"
import { PersonAvatar } from "./classroom-ui"
import { isYou } from "./classroom-utils"
import { ChatComposer } from "./chat-composer"
import { ChatHeader } from "./chat-header"
import { ChatMessageBubble } from "./chat-message-bubble"
import type { ReactionState } from "./discussion-reaction-data"

export function ClassroomChatView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { sendChatMessage } = useClassroomPrototype()
  const [status, setStatus] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [reactions, setReactions] = useState<Record<string, ReactionState>>({})
  const [replyingTo, setReplyingTo] = useState<ClassroomChatReplyRef | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const authorRole = role === "students" ? "student" : "educator"
  const educators = classroom.members.filter((member) => member.role === "educator")
  const students = classroom.members.filter((member) => member.role === "student")
  const normalizedQuery = query.trim().toLowerCase()

  const messages = useMemo(
    () => normalizedQuery
      ? classroom.chatMessages.filter((message) =>
        `${message.body} ${message.authorName}`.toLowerCase().includes(normalizedQuery))
      : classroom.chatMessages,
    [classroom.chatMessages, normalizedQuery],
  )

  useEffect(() => {
    if (normalizedQuery) return
    const list = listRef.current
    list?.scrollTo({ top: list.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }, [classroom.chatMessages.length, normalizedQuery])

  const toggleReaction = (messageId: string, emoji: string) => {
    setReactions((current) => {
      const state = current[messageId] ?? {}
      const entry = state[emoji] ?? { count: 0, mine: false }
      const next = entry.mine
        ? { count: entry.count - 1, mine: false }
        : { count: entry.count + 1, mine: true }
      return { ...current, [messageId]: { ...state, [emoji]: next } }
    })
  }

  const startReply = (message: ClassroomChatMessage) => {
    setReplyingTo({
      messageId: message.id,
      authorName: message.authorName,
      excerpt: message.body.replace(/\s+/g, " ").trim().slice(0, 120),
    })
  }

  const jumpToMessage = (messageId: string) => {
    if (normalizedQuery) {
      setQuery("")
      setSearchOpen(false)
    }
    requestAnimationFrame(() => {
      document.getElementById(`chat-message-${messageId}`)?.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })
    })
    setHighlightedId(messageId)
    window.setTimeout(() => setHighlightedId((current) => (current === messageId ? null : current)), 1600)
  }

  const handleSend = (body: string) => {
    setQuery("")
    sendChatMessage(classroom.id, body, authorRole, replyingTo ?? undefined)
    setReplyingTo(null)
    setStatus("Message added for this preview session only. It was not delivered or saved.")
  }

  return (
    <div className="grid h-[36rem] max-h-[80dvh] grid-rows-[minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-card lg:max-h-none lg:grid-cols-[minmax(0,1fr)_16rem]">
      <section aria-label={`${classroom.name} group chat`} className="flex min-h-0 min-w-0 flex-col">
        <ChatHeader
          classroom={classroom}
          role={role}
          searchOpen={searchOpen}
          query={query}
          onToggleSearch={() => {
            setSearchOpen((current) => !current)
            setQuery("")
          }}
          onQueryChange={setQuery}
        />
        <div
          ref={listRef}
          role="log"
          aria-live="polite"
          aria-label={`${classroom.name} group chat messages`}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/30 px-4 py-5"
        >
          {messages.length === 0 ? (
            <p className="m-auto max-w-sm text-center text-sm text-muted-foreground">
              {normalizedQuery ? "No messages match your search." : "No messages yet. Start the class-only conversation."}
            </p>
          ) : (
            <ol className="flex flex-col gap-1">
              {messages.map((message, index) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  mine={isYou(message.authorName)}
                  showHeader={index === 0 || messages[index - 1].authorId !== message.authorId}
                  highlighted={highlightedId === message.id}
                  reactions={reactions[message.id] ?? {}}
                  onToggleReaction={(emoji) => toggleReaction(message.id, emoji)}
                  onReply={() => startReply(message)}
                  onJumpToMessage={jumpToMessage}
                />
              ))}
            </ol>
          )}
        </div>
        <p role="status" className="px-4 py-1 text-xs text-amber-800 empty:hidden">{status}</p>
        <ChatComposer onSend={handleSend} replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} />
      </section>

      <aside aria-label="Class info" className="hidden min-h-0 flex-col gap-5 overflow-y-auto border-l border-border p-4 lg:flex">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Class</dt><dd className="truncate text-right font-medium text-foreground">{classroom.subject}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Educator</dt><dd className="truncate text-right font-medium text-foreground">{classroom.instructorName}</dd></div>
        </dl>
        {[{ label: "Educators", people: educators }, { label: "Students", people: students }].map(({ label, people }) => (
          <div key={label} className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground">{label} <span className="font-normal text-muted-foreground">· {people.length}</span></h3>
            <ul className="mt-2 space-y-2">
              {people.map((member) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <PersonAvatar name={member.name} size="sm" />
                  <span className="truncate text-sm text-foreground/80">{member.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">Shared files</h3>
          {classroom.materials.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">No files shared yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {classroom.materials.map((material) => (
                <li key={material.id} className="flex items-center gap-2 text-sm text-foreground/80">
                  <FileText aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{material.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
```

### `classroom-chat.test.tsx`

Current file: `src/components/features/classrooms/classroom-chat.test.tsx`

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { getClassrooms } from '@/services/api/classroom.service'
import { ClassroomDetailView } from './classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom } from './classroom-test-data'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
it('Chat does not offer local-only writes or sample messages', async () => {
  vi.mocked(getClassrooms).mockResolvedValue([classroom])
  render(<TestSession path="/students/classrooms/class-id?tab=chat"><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
  expect(await screen.findByText('This section is under development.')).toBeTruthy()
  expect(screen.queryByRole('textbox')).toBeNull()
  expect(screen.queryByRole('button', { name: /send|post|publish/i })).toBeNull()
})
```

### `classroom-classwork-view.tsx`

Current file: `src/components/features/classrooms/classroom-classwork-view.tsx`

```tsx
import { useState, type FormEvent } from "react"
import { ArrowRight, BookOpen, ClipboardCheck, FileText, FlaskConical, Mic, MessagesSquare, Paperclip, Plus, Presentation, TriangleAlert, Wrench, FolderKanban, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { ActivityTiming, ActivityType, Classroom, QuestionType, WorkspaceRole } from "./classroom-types"
import { QuizTimerSettings } from "./quiz-timer-settings"
import { QuizTimingBadges } from "./quiz-timing-badges"
import { parseTimingFields, type TimingFormResult } from "./quiz-timing"

const activityTypes: ActivityType[] = [
  "Quiz",
  "Test",
  "Assignment",
  "File submission",
  "Project",
  "Presentation",
  "Lab work",
  "Practical activity",
  "Discussion activity",
  "Reading activity",
  "Speaking practice",
]

const activityIcons: Record<ActivityType, LucideIcon> = {
  Quiz: ClipboardCheck,
  Test: ClipboardCheck,
  Assignment: FileText,
  "File submission": Paperclip,
  Project: FolderKanban,
  Presentation,
  "Lab work": FlaskConical,
  "Practical activity": Wrench,
  "Discussion activity": MessagesSquare,
  "Reading activity": BookOpen,
  "Speaking practice": Mic,
}

const questionTypes: QuestionType[] = [
  "Multiple choice",
  "Multiple select",
  "True or false",
  "Identification",
  "Short answer",
  "Essay",
]

export function ClassroomClassworkView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { pathname } = useLocation()
  const workspace = getDashboardRole(pathname) ?? "students"
  const { createActivity, currentLearnerId } = useClassroomPrototype()
  const isStudent = role === "students"
  const [showCreate, setShowCreate] = useState(false)
  const [activityType, setActivityType] = useState<ActivityType>("Assignment")
  const [questionType, setQuestionType] = useState<QuestionType>("Multiple choice")
  const [status, setStatus] = useState("")
  const [timingErrors, setTimingErrors] = useState<TimingFormResult["errors"]>({})
  const isFormBased = activityType === "Quiz" || activityType === "Test"
  const mySubmitted = classroom.activities.filter((activity) => activity.submissions.some((item) => item.learnerId === currentLearnerId)).length
  const toReview = classroom.activities.reduce((total, activity) => total + activity.submissions.filter((item) => item.status === "In review").length, 0)
  const nextDue = classroom.activities.map((activity) => activity.dueDate).filter(Boolean).sort()[0]
  const stats = [
    { label: "Total classwork", value: String(classroom.activities.length), tone: "bg-white" },
    { label: "Next due", value: nextDue || "None", tone: "bg-white" },
    isStudent
      ? { label: "Submitted by you", value: `${mySubmitted} of ${classroom.activities.length}`, tone: "bg-indigo-50" }
      : { label: "Awaiting review", value: String(toReview), tone: "bg-indigo-50" },
    { label: "Status", value: classroom.activities.length ? "Published" : "No classwork", tone: "bg-blue-50" },
  ]

  const visibleActivities = isStudent ? classroom.activities.filter((activity) => activity.status === "Published") : classroom.activities
  const sections = [
    { title: "Assigned", items: visibleActivities.filter((activity) => activity.status === "Published") },
    { title: "Drafts", items: visibleActivities.filter((activity) => activity.status === "Draft") },
  ].filter((section) => section.items.length > 0)

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const prompt = String(form.get("question-prompt") ?? "").trim()
    const options = String(form.get("question-options") ?? "")
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean)

    let timing: ActivityTiming | undefined
    if (isFormBased || form.get("timer-active")) {
      const parsed = parseTimingFields({
        duration: String(form.get("timer-duration") ?? ""),
        opensAt: String(form.get("timer-opens") ?? ""),
        closesAt: String(form.get("timer-closes") ?? ""),
        autoSubmit: form.get("timer-auto-submit") === "on",
      })
      setTimingErrors(parsed.errors)
      if (!parsed.timing) {
        setStatus("Fix the timer settings before publishing.")
        return
      }
      timing = parsed.timing
    } else {
      setTimingErrors({})
    }

    if (isFormBased && !prompt) {
      setStatus("Add a question prompt before publishing this demo activity.")
      return
    }
    if (isFormBased && ["Multiple choice", "Multiple select"].includes(questionType) && options.length < 2) {
      setStatus("Add at least two comma-separated options for this demo question.")
      return
    }

    createActivity(classroom.id, {
      title: String(form.get("activity-title") ?? ""),
      type: activityType,
      instructions: String(form.get("activity-instructions") ?? ""),
      dueDate: String(form.get("activity-due-date") ?? ""),
      scoringNote: String(form.get("activity-evaluation") ?? ""),
      responseType: isFormBased ? "Quiz" : String(form.get("response-type") ?? "Text") as "Text" | "File" | "Link",
      questions: isFormBased ? [{
        id: `question-${crypto.randomUUID()}`,
        type: questionType,
        prompt,
        options,
      }] : [],
      timing,
      showLeaderboard: isFormBased ? form.get("show-leaderboard") === "on" : undefined,
    })
    event.currentTarget.reset()
    setActivityType("Assignment")
    setQuestionType("Multiple choice")
    setTimingErrors({})
    setShowCreate(false)
    setStatus("Demo classwork was published in this session only. It was not saved.")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Classwork</h3>
          <p className="mt-1 text-sm text-slate-600">Activities and assignment work for {classroom.name}.</p>
        </div>
        {!isStudent && (
          <Button type="button" onClick={() => setShowCreate((current) => !current)}>
            <Plus aria-hidden="true" /> {showCreate ? "Close editor" : "Create classwork"}
          </Button>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, tone }) => (
          <div key={label} className={`min-w-0 rounded-2xl border border-slate-200 p-3 sm:p-4 ${tone}`}>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 break-words text-base font-semibold text-slate-900 sm:text-lg">{value}</dd>
          </div>
        ))}
      </dl>

      <Alert className="border-amber-200 bg-amber-50 text-amber-900">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>Prototype classwork</AlertTitle>
        <AlertDescription className="text-amber-800">Activity content, responses, evaluation, and feedback are mock data. Nothing is submitted or saved to a classroom service.</AlertDescription>
      </Alert>

      {status && <p role="status" className="text-sm text-amber-800">{status}</p>}

      {showCreate && !isStudent && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Create classwork preview</CardTitle>
            <CardDescription>Publish a demo activity to this classroom's in-memory workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="activity-title">Activity title</Label>
                  <Input id="activity-title" name="activity-title" required maxLength={100} placeholder="e.g. Ecosystem reflection" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="activity-type">Activity type</Label>
                  <select
                    id="activity-type"
                    value={activityType}
                    onChange={(event) => setActivityType(event.currentTarget.value as ActivityType)}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {activityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="activity-instructions">Instructions</Label>
                <Textarea id="activity-instructions" name="activity-instructions" required maxLength={2000} placeholder="Explain what learners should do…" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="activity-due-date">Due date <span className="font-normal text-slate-500">(optional)</span></Label>
                  <Input id="activity-due-date" name="activity-due-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="activity-evaluation">Evaluation note <span className="font-normal text-slate-500">(optional)</span></Label>
                  <Input id="activity-evaluation" name="activity-evaluation" maxLength={200} placeholder="e.g. Feedback-based review" />
                </div>
              </div>
              {isFormBased ? (
                <fieldset className="grid gap-4 rounded-xl border border-slate-200 p-4">
                  <legend className="px-1 text-sm font-semibold text-slate-800">Question preview</legend>
                  <div className="grid gap-2">
                    <Label htmlFor="question-type">Question type</Label>
                    <select
                      id="question-type"
                      value={questionType}
                      onChange={(event) => setQuestionType(event.currentTarget.value as QuestionType)}
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {questionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="question-prompt">Question prompt</Label>
                    <Textarea id="question-prompt" name="question-prompt" required maxLength={1000} placeholder="Write a question…" />
                  </div>
                  {["Multiple choice", "Multiple select"].includes(questionType) && (
                    <div className="grid gap-2">
                      <Label htmlFor="question-options">Answer options</Label>
                      <Input id="question-options" name="question-options" required placeholder="Separate options with commas" />
                    </div>
                  )}
                  <p className="text-xs text-slate-500">The prototype captures one example question; quiz scoring and answer-key behavior are not connected.</p>
                </fieldset>
              ) : (
                <div className="grid gap-2 sm:max-w-sm">
                  <Label htmlFor="response-type">Student response preview</Label>
                  <select
                    id="response-type"
                    name="response-type"
                    defaultValue="Text"
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="Text">Written response</option>
                    <option value="File">File name preview</option>
                    <option value="Link">Link response</option>
                  </select>
                </div>
              )}
              <QuizTimerSettings required={isFormBased} isQuizOrTest={isFormBased} errors={timingErrors} />
              <div className="flex flex-wrap gap-2">
                <Button type="submit">Publish demo activity</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {sections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-sm text-slate-600">{isStudent ? "No demo classwork is available yet." : "Create a demo activity to preview learner classwork."}</CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} aria-label={`${section.title} classwork`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <h4 className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900">
                {section.title} <span className="font-normal text-slate-500">· {section.items.length}</span>
              </h4>
              <ul className="divide-y divide-slate-100">
                {section.items.map((activity) => {
                  const submission = activity.submissions.find((item) => item.learnerId === currentLearnerId)
                  const Icon = activityIcons[activity.type]
                  const statusLabel = isStudent ? submission?.status ?? "Not started" : activity.status === "Draft" ? "Draft" : "Assigned"
                  return (
                    <li key={activity.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-semibold text-slate-900">{activity.title}</h5>
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo</Badge>
                          <QuizTimingBadges activity={activity} />
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{activity.instructions}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {activity.type} · {activity.dueDate ? `Due ${activity.dueDate}` : "No due date"}{isStudent ? "" : ` · ${activity.submissions.length} demo submissions`}
                        </p>
                      </div>
                      <Badge variant="secondary">{statusLabel}</Badge>
                      <Link
                        to={`/${workspace}/classrooms/${classroom.id}/classwork/${activity.id}`}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-brand-soft-foreground outline-none hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        {isStudent ? "Open workspace" : "Review activity"} <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
```

### `classroom-covers.ts`

Current file: `src/components/features/classrooms/classroom-covers.ts`

```ts
export type ClassroomCoverTheme = {
  id: string
  file: string
  accent: string
}

export const classroomCoverThemes: ClassroomCoverTheme[] = [
  { id: "coral", file: "coral.svg", accent: "bg-orange-100 text-orange-800" },
  { id: "emerald", file: "emerald.svg", accent: "bg-emerald-100 text-emerald-800" },
  { id: "steel", file: "steel.svg", accent: "bg-slate-200 text-slate-700" },
  { id: "azure", file: "azure.svg", accent: "bg-blue-100 text-blue-800" },
  { id: "violet", file: "violet.svg", accent: "bg-violet-100 text-violet-800" },
  { id: "teal", file: "teal.svg", accent: "bg-cyan-100 text-cyan-800" },
]

function hashClassroomId(classroomId: string): number {
  let hash = 0

  for (let index = 0; index < classroomId.length; index += 1) {
    hash = (hash * 31 + classroomId.charCodeAt(index)) % 100000
  }

  return hash
}

export function getClassroomCoverTheme(classroomId: string): ClassroomCoverTheme {
  const index = hashClassroomId(classroomId) % classroomCoverThemes.length
  return classroomCoverThemes[index]
}

export function getClassroomCoverUrl(classroomId: string): string {
  return `/classroom-covers/${getClassroomCoverTheme(classroomId).file}`
}
```

### `classroom-detail-tabs.test.tsx`

Current file: `src/components/features/classrooms/classroom-detail-tabs.test.tsx`

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getClassrooms } from '@/services/api/classroom.service'
import { ClassroomDetailView } from './classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, teacher } from './classroom-test-data'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), getClassroomStudents: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
beforeEach(() => { vi.mocked(getClassrooms).mockResolvedValue([classroom]) })
describe('connected classroom details', () => {
  it.each(['classwork','materials','chat','feed'])('preserves %s deep links without simulated activities', async tab => {
    render(<TestSession path={'/students/classrooms/class-id?tab=' + tab}><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
    await screen.findByText(classroom.name)
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe({ classwork: 'Classwork', materials: 'Materials', chat: 'Chat', feed: 'Discussion' }[tab])
    expect(screen.getByText('This section is under development.')).toBeTruthy()
  })
  it('defaults unknown tabs to real classroom details', async () => {
    render(<TestSession path="/students/classrooms/class-id?tab=unknown"><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
    expect(await screen.findByText('About this classroom')).toBeTruthy()
  })
  it('does not invent an invite code after reloading an owner classroom', async () => {
    render(<TestSession user={teacher} path="/educators/classrooms/class-id"><Routes><Route path="/educators/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
    expect(await screen.findByText(/Retrieving or replacing a lost code/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Copy invite code' })).toBeNull()
  })
})
```

### `classroom-detail-view.tsx`

Current file: `src/components/features/classrooms/classroom-detail-view.tsx`

```tsx
import { useState } from 'react'
import { ArrowLeft, BookOpen, Users, Video } from 'lucide-react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClassroomPrototype } from './classroom-prototype-context'
import { ClassroomMembersView } from './classroom-members-view'
import { UnderDevelopment } from './classroom-ui'
import { ClassroomPreviewNotice } from './classroom-preview-notice'
import { getClassroomCoverUrl } from './classroom-covers'
import { getClassroomCategory } from './classroom-list-meta'
import { ClassroomFeedView } from './classroom-feed-view'
import { ClassroomClassworkView } from './classroom-classwork-view'
import { ClassroomAttendanceView, ClassroomMaterialsView, ClassroomPeopleView, ClassroomProgressView, ClassroomScheduleView } from './classroom-records-view'

const sections = [{ value: 'feed', label: 'Discussion' }, { value: 'classwork', label: 'Classwork' },
  { value: 'materials', label: 'Materials' }, { value: 'schedule', label: 'Schedule' },
  { value: 'people', label: 'Members' }, { value: 'about', label: 'About' },
  { value: 'attendance', label: 'Attendance' }, { value: 'progress', label: 'Grades & Feedback' }]

export function ClassroomDetailView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const { classroomId } = useParams()
  const [params, setParams] = useSearchParams()
  const { getClassroom, classroomsLoading, classroomsError, reloadClassrooms } = useClassroomPrototype()
  const [notice, setNotice] = useState('')
  const classroom = classroomId ? getClassroom(classroomId) : undefined
  const tabs = [...sections, ...(params.get('tab') === 'chat' ? [{ value: 'chat', label: 'Chat' }] : [])]
  const defaultTab = classroom?.isMock ? 'feed' : 'about'
  const tab = tabs.find(item => item.value === params.get('tab'))?.value ?? defaultTab
  const owned = classroom?.access === 'owner'
  const visible = classroom && (role === 'students' ? !owned : owned)
  if (classroomsLoading) return <p role="status">Loading classroom…</p>
  if (classroomsError) return <section role="alert" className="space-y-3 rounded-xl border p-6"><h2>Classroom could not be loaded</h2><p>{classroomsError}</p><Button onClick={reloadClassrooms}>Try again</Button></section>
  if (!classroom || !visible) return <section className="space-y-3 rounded-xl border p-6"><h2>Classroom unavailable</h2>
    <p>This classroom is not available to your account in this workspace.</p><Link className="underline" to={'/' + role + '/classrooms'}>Back to classrooms</Link></section>
  const selectTab = (value: string) => setParams(current => { const next = new URLSearchParams(current); if (value === defaultTab) next.delete('tab'); else next.set('tab', value); return next }, { replace: true })
  async function copyCode() {
    if (!classroom?.joinCode) return
    try { await navigator.clipboard.writeText(classroom.joinCode); setNotice('Classroom invite code copied.') }
    catch { setNotice('Copy was unavailable. Select the invite code to copy it manually.') }
  }
  return <div className="mx-auto max-w-7xl space-y-5">
    <Link className="inline-flex items-center gap-2 rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" to={'/' + role + '/classrooms'}><ArrowLeft aria-hidden="true" className="size-4" />Back to classrooms</Link>
    <ClassroomPreviewNotice role={role} classroomId={classroom.id} />
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative h-32 overflow-hidden sm:h-44"><img src={getClassroomCoverUrl(classroom.id)} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" /><span className="absolute right-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-medium">{getClassroomCategory(classroom)}</span></div>
      <header className="relative flex flex-wrap items-end justify-between gap-5 px-5 pb-6 sm:px-7">
        <div className="min-w-0 flex-1 basis-80"><div className="relative -mt-8 mb-4 flex size-20 items-center justify-center rounded-2xl border-4 border-card bg-brand-soft shadow-sm"><img src="/mascot/owlio-mark.png" alt="" className="size-12 object-contain" /></div><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{classroom.name}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1.5"><BookOpen aria-hidden="true" className="size-4" />{classroom.instructorName || 'Instructor details unavailable'}</span>{owned && classroom.isMock && <span className="inline-flex items-center gap-1.5"><Users aria-hidden="true" className="size-4" />{classroom.enrolledLearnerIds.length} enrolled learners · preview</span>}<span>{owned ? 'Teaching workspace' : 'Enrolled member'}</span></p>
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => selectTab('classwork')}>View classwork</Button>
          {classroom.meetingId && <Link className={buttonVariants()} to={`/${role}/classrooms/meeting-room?room=${encodeURIComponent(classroom.meetingId)}`}><Video aria-hidden="true" />Meeting room</Link>}
        </div>
      </header>
    </section>
    {owned && <details className="rounded-xl border border-border bg-card p-4"><summary className="cursor-pointer rounded text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">Teacher tools · classroom invite</summary><section aria-label="Classroom invite" className="mt-4 space-y-3"><h3 className="text-sm font-semibold">Student invite code</h3>
      {classroom.joinCode ? <><code className="block break-all select-all rounded-lg bg-muted p-3 text-sm">{classroom.joinCode}</code><Button variant="outline" onClick={() => void copyCode()}>Copy invite code</Button>
        <p className="text-xs text-muted-foreground">{classroom.isMock ? 'Use this code in the student preview to enroll Alex Rivera. This is a demo invite, valid in this tab until refresh.' : 'Keep this code private. Save it now; it cannot be retrieved after reloading or signing out.'}</p></>
        : <p className="text-sm text-muted-foreground">The code was shown when this classroom was created. Retrieving or replacing a lost code is not available yet.</p>}
      {notice && <p role="status" className="text-sm">{notice}</p>}</section></details>}
    <Tabs value={tab} onValueChange={selectTab}>
      <div className="max-w-full overflow-x-auto rounded-xl border border-border bg-card p-1"><TabsList variant="line" className="h-12 min-w-max">{tabs.map(item => <TabsTrigger key={item.value} value={item.value} className="px-4 py-3">{item.value === 'progress' && classroom.ownerWorkspace !== 'educators' ? 'Progress & Feedback' : item.label}</TabsTrigger>)}</TabsList></div>
      <TabsContent value="about" className="space-y-3 rounded-2xl border border-border bg-card p-6"><h3 className="font-semibold">About this classroom</h3><p className="text-sm leading-6 text-muted-foreground">{classroom.description || 'No description provided.'}</p><p className="text-xs text-muted-foreground">{classroom.isMock ? 'Shared classroom preview. Teaching content is visible to enrolled members; individual attendance and released feedback are shown only to the relevant learner. No online meeting is connected.' : 'Classroom creation and enrollment are connected. Meetings and learning activities are not available in this classroom yet.'}</p></TabsContent>
      <TabsContent value="people" className="rounded-2xl border border-border bg-card p-5">{classroom.isMock ? <ClassroomPeopleView classroom={classroom} /> : <ClassroomMembersView classroom={classroom} role={role} />}</TabsContent>
      <TabsContent value="feed">{classroom.isMock ? <ClassroomFeedView key={classroom.id + role} classroom={classroom} role={role} /> : <UnderDevelopment title="Discussion" />}</TabsContent>
      <TabsContent value="classwork">{classroom.isMock ? <ClassroomClassworkView key={classroom.id + role} classroom={classroom} role={role} /> : <UnderDevelopment title="Classwork" />}</TabsContent>
      <TabsContent value="materials">{classroom.isMock ? <ClassroomMaterialsView classroom={classroom} /> : <UnderDevelopment title="Materials" />}</TabsContent>
      <TabsContent value="schedule">{classroom.isMock ? <ClassroomScheduleView key={classroom.id + role} classroom={classroom} role={role} /> : <UnderDevelopment title="Schedule" />}</TabsContent>
      <TabsContent value="attendance">{classroom.isMock ? <ClassroomAttendanceView classroom={classroom} role={role} /> : <UnderDevelopment title="Attendance" />}</TabsContent>
      <TabsContent value="progress">{classroom.isMock ? <ClassroomProgressView classroom={classroom} role={role} /> : <UnderDevelopment title="Progress" />}</TabsContent>
      {tab === 'chat' && <TabsContent value="chat"><UnderDevelopment title="Chat" /></TabsContent>}
    </Tabs>
  </div>
}
```

### `classroom-discussion.test.tsx`

Current file: `src/components/features/classrooms/classroom-discussion.test.tsx`

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { getClassrooms } from '@/services/api/classroom.service'
import { ClassroomDetailView } from './classroom-detail-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom } from './classroom-test-data'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
it('Discussion does not offer local-only writes or sample messages', async () => {
  vi.mocked(getClassrooms).mockResolvedValue([classroom])
  render(<TestSession path="/students/classrooms/class-id?tab=feed"><Routes><Route path="/students/classrooms/:classroomId" element={<ClassroomDetailView />} /></Routes></TestSession>)
  expect(await screen.findByText('This section is under development.')).toBeTruthy()
  expect(screen.queryByRole('textbox')).toBeNull()
  expect(screen.queryByRole('button', { name: /send|post|publish/i })).toBeNull()
})
```

### `classroom-feed-view.tsx`

Current file: `src/components/features/classrooms/classroom-feed-view.tsx`

```tsx
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
```

### `classroom-form-dialogs.tsx`

Current file: `src/components/features/classrooms/classroom-form-dialogs.tsx`

```tsx
import type { FormEvent, RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type CreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  pending: boolean
  error: string
  finalFocus?: () => HTMLElement | boolean
  preview?: boolean
}

export function ClassroomCreateDialog({ open, onOpenChange, onSubmit, pending, error, finalFocus, preview }: CreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent finalFocus={finalFocus} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a classroom</DialogTitle>
          <DialogDescription>{preview ? 'Create a demo class and a preview invite code. Changes reset on refresh.' : 'Create a connected class record and generate a student invite code.'}</DialogDescription>
        </DialogHeader>
        <form id="create-class-form" onSubmit={onSubmit} aria-busy={pending} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="class-name">Classroom name</Label>
            <Input id="class-name" name="class-name" required maxLength={120} placeholder="e.g. Foundations of Biology" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="class-description">Description</Label>
            <Textarea id="class-description" name="class-description" maxLength={2000} placeholder="What will learners explore in this class?" />
          </div>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Discard</Button>
          <Button type="submit" form="create-class-form" disabled={pending}>{pending ? "Creating…" : "Create classroom"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type JoinDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  code: string
  onCodeChange: (code: string) => void
  joining: boolean
  error: string
  disclosure: string
  inputRef: RefObject<HTMLInputElement | null>
  finalFocus?: () => HTMLElement | boolean
}

export function ClassroomJoinDialog({ open, onOpenChange, onSubmit, code, onCodeChange, joining, error, disclosure, inputRef, finalFocus }: JoinDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="join-class-panel" finalFocus={finalFocus} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Join a classroom</DialogTitle>
          <DialogDescription>Enter an invite code shared by the educator.</DialogDescription>
        </DialogHeader>
        <form id="join-class-form" onSubmit={onSubmit} aria-busy={joining} className="grid gap-2">
          <Label htmlFor="class-join-code">Classroom invite code</Label>
          <Input
            id="class-join-code"
            ref={inputRef}
            value={code}
            onChange={(event) => onCodeChange(event.currentTarget.value)}
            autoComplete="off"
            disabled={joining}
            placeholder="Paste your classroom invite code"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "join-disclosure join-status" : "join-disclosure"}
          />
          {error && <p id="join-status" role="alert" className="text-sm text-rose-700">{error}</p>}
          <p id="join-disclosure" className="text-xs leading-5 text-slate-500">{disclosure}</p>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Discard</Button>
          <Button type="submit" form="join-class-form" disabled={!code.trim() || joining}>{joining ? "Joining…" : "Join class"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### `classroom-list-meta.ts`

Current file: `src/components/features/classrooms/classroom-list-meta.ts`

```ts
import type { Classroom, WorkspaceRole } from "./classroom-types"

export type ClassroomMetaCell = { label: string; value: string }
export type ClassroomStatus = { label: string; tone: "connected" | "demo" }

export function getClassroomCategory(classroom: Classroom) {
  return classroom.ownerWorkspace === 'educators' ? 'School Classes' : classroom.ownerWorkspace === 'tutors' ? 'Tutoring' : classroom.ownerWorkspace === 'esl' ? 'ESL' : 'Category unavailable'
}

export function getNextSession(classroom: Classroom) {
  const next = [...classroom.sessions].filter(item => new Date(`${item.date}T${item.time || '23:59'}`).getTime() >= Date.now())
    .sort((first, second) => `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`))[0]
  if (!next) return "-"
  return next.time ? `${next.date} · ${next.time}` : next.date
}

export function getClassroomMeta(classroom: Classroom, role: WorkspaceRole): { cells: ClassroomMetaCell[]; status: ClassroomStatus } {
  const nextSession = { label: "Next session", value: getNextSession(classroom) }

  if (role === "students") {
    return {
      cells: [{ label: "Educator", value: classroom.instructorName || "-" }, nextSession],
      status: classroom.isMock ? { label: classroom.previewStatus === 'inactive' ? 'Inactive · demo' : 'Active · demo', tone: "demo" } : { label: "Enrolled", tone: "connected" },
    }
  }

  return {
    cells: [
      { label: "Learners", value: classroom.isMock ? String(classroom.enrolledLearnerIds.length) : "-" },
      nextSession,
    ],
    status: classroom.isMock ? { label: classroom.previewStatus === 'inactive' ? 'Inactive · demo' : 'Active · demo', tone: "demo" } : { label: "Connected", tone: "connected" },
  }
}
```

### `classroom-list-ui.tsx`

Current file: `src/components/features/classrooms/classroom-list-ui.tsx`

```tsx
import type { ReactNode } from "react"
import { CircleCheck, FlaskConical, LayoutGrid, List } from "lucide-react"
import { cn } from "cn"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ClassroomStatus } from "./classroom-list-meta"

export function StatusChip({ status, className }: { status: ClassroomStatus; className?: string }) {
  const Icon = status.tone === "demo" ? FlaskConical : CircleCheck

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-xs font-medium",
        status.tone === "demo"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
        className
      )}
    >
      <Icon aria-hidden="true" className="size-3" />
      {status.label}
    </span>
  )
}

export function MetaCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-500">{label}</p>
      <div className="mt-0.5 truncate text-sm font-medium text-slate-900">{children}</div>
    </div>
  )
}

export type FilterPillOption = { value: string; label: string; count: number }

export function FilterPills({
  label,
  options,
  value,
  onValueChange,
}: {
  label: string
  options: FilterPillOption[]
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1 [scrollbar-width:none]">
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand",
              active ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            )}
          >
            {option.label}
            <span className={cn("text-xs", active ? "text-brand-soft-foreground" : "text-slate-500")}>{option.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export type ClassroomView = "grid" | "list"

export function GridListToggle({ value, onValueChange }: { value: ClassroomView; onValueChange: (value: ClassroomView) => void }) {
  return (
    <ToggleGroup
      aria-label="Class layout"
      value={[value]}
      onValueChange={(next) => {
        const selected = next[0]
        if (selected === "grid" || selected === "list") onValueChange(selected)
      }}
      spacing={1}
      className="rounded-xl border border-slate-200 bg-slate-50 p-1"
    >
      <ToggleGroupItem value="grid" aria-label="Grid view" title="Grid view" className="size-8 rounded-lg data-[pressed]:bg-white data-[pressed]:shadow-sm">
        <LayoutGrid aria-hidden="true" className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" title="List view" className="size-8 rounded-lg data-[pressed]:bg-white data-[pressed]:shadow-sm">
        <List aria-hidden="true" className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
```

### `classroom-members-view.test.tsx`

Current file: `src/components/features/classrooms/classroom-members-view.test.tsx`

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getClassroomStudents } from '@/services/api/classroom.service'
import { ClassroomMembersView } from './classroom-members-view'
import type { Classroom } from './classroom-types'
vi.mock('@/services/api/classroom.service', () => ({ getClassroomStudents: vi.fn() }))
afterEach(() => { cleanup(); vi.resetAllMocks() })
const classroom = { id: 'class-id', access: 'owner' } as Classroom
describe('API classroom roster', () => {
  it('renders only students returned by the service', async () => {
    vi.mocked(getClassroomStudents).mockResolvedValue({ items: [{ studentId: 'real-id', name: 'Actual Student', joinedAt: '2026-01-01' }], nextCursor: null })
    render(<ClassroomMembersView classroom={classroom} role="educators" />)
    expect(await screen.findByText('Actual Student')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /remove|add|accept/i })).toBeNull()
  })
  it('does not request the owner-only roster for students', () => {
    render(<ClassroomMembersView classroom={{ ...classroom, access: 'student' }} role="students" />)
    expect(screen.getByText(/Only the classroom owner/)).toBeTruthy()
    expect(getClassroomStudents).not.toHaveBeenCalled()
  })
  it('distinguishes service errors from empty rosters', async () => {
    vi.mocked(getClassroomStudents).mockRejectedValue(new Error('Not authorized'))
    render(<ClassroomMembersView classroom={classroom} role="educators" />)
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('Not authorized'))
    expect(screen.queryByText('No students have joined yet.')).toBeNull()
  })
})
```

### `classroom-members-view.tsx`

Current file: `src/components/features/classrooms/classroom-members-view.tsx`

```tsx
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getClassroomStudents, type ApiPage, type ApiStudent } from '@/services/api/classroom.service'
import type { Classroom, WorkspaceRole } from './classroom-types'

export function ClassroomMembersView({ classroom }: { classroom: Classroom; role: WorkspaceRole }) {
  return classroom.access !== 'owner' ? <p>Only the classroom owner can view the student roster.</p> : <Roster key={classroom.id} classroomId={classroom.id} />
}
function Roster({ classroomId }: { classroomId: string }) {
  const [page, setPage] = useState<ApiPage<ApiStudent>>({ items: [], nextCursor: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    getClassroomStudents(classroomId, undefined, controller.signal).then(result => {
      if (!controller.signal.aborted) { setPage(result); setError('') }
    }).catch(failure => { if (!controller.signal.aborted) setError(getApiErrorMessage(failure, 'Students could not be loaded.')) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [classroomId, reload])
  async function more() {
    if (loading || !page.nextCursor) return
    setLoading(true); setError('')
    try {
      const result = await getClassroomStudents(classroomId, page.nextCursor)
      setPage(current => ({ items: [...current.items, ...result.items], nextCursor: result.nextCursor }))
    } catch (failure) { setError(getApiErrorMessage(failure, 'More students could not be loaded.')) }
    finally { setLoading(false) }
  }
  return <section className="space-y-3"><h3 className="text-lg font-semibold">Students</h3>
    {error && <div role="alert"><p>{error}</p><Button variant="outline" onClick={() => { setLoading(true); setReload(value => value + 1) }}>Try again</Button></div>}
    {loading && <p role="status">Loading students…</p>}
    {!loading && !error && page.items.length === 0 && <p>No students have joined yet.</p>}
    <ul className="divide-y">{page.items.map(student => <li key={student.studentId} className="py-3">{student.name}</li>)}</ul>
    {page.nextCursor && <Button variant="outline" disabled={loading} onClick={() => void more()}>Load more students</Button>}
    <p className="text-sm text-muted-foreground">Students join using the private invite code. Adding or removing members here is not available yet.</p>
  </section>
}
```

### `classroom-preview-data.ts`

Current file: `src/components/features/classrooms/classroom-preview-data.ts`

```ts
import type { Classroom, WorkspaceRole } from './classroom-types'

export const PREVIEW_LEARNER_ID = 'preview-learner'
export const PREVIEW_LEARNER_NAME = 'Alex Rivera'
export const previewTeachers = {
  educators: { id: 'preview-educator', name: 'Sofia Reyes' },
  tutors: { id: 'preview-tutor', name: 'Daniel Cruz' },
  esl: { id: 'preview-esl', name: 'Mia Santos' },
} satisfies Record<Exclude<WorkspaceRole, 'students'>, { id: string; name: string }>

export function makePreviewClass(id: string, name: string, subject: string, workspace: Exclude<WorkspaceRole, 'students'>, enrolled = true, offset = 1): Classroom {
  const teacher = previewTeachers[workspace]
  const future = new Date()
  future.setDate(future.getDate() + offset)
  const date = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`
  const past = new Date()
  past.setDate(past.getDate() - 2)
  const pastDate = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`
  const learner = { id: PREVIEW_LEARNER_ID, name: PREVIEW_LEARNER_NAME, role: 'student' as const }
  const peer = { id: 'preview-peer', name: 'Jamie Tan', role: 'student' as const }
  const activityTitle = workspace === 'esl' ? 'Introduce your favorite place' : workspace === 'tutors' ? 'Guided practice reflection' : 'Apply what we learned'
  return {
    id, name, subject, ownerId: teacher.id, instructorName: teacher.name, ownerWorkspace: workspace,
    description: `A place to learn ${subject.toLowerCase()}, ask questions, and build confidence together. Find our shared resources, upcoming sessions, and activities here.`,
    joinCode: id === 'conversation-club' ? 'OWL-CONVERSATION' : `OWL-${id.toUpperCase()}`,
    meetingId: null, access: 'owner', previewStatus: 'active', isMock: true,
    enrolledLearnerIds: [peer.id, ...(enrolled ? [learner.id] : [])],
    members: [{ ...teacher, role: 'educator' }, peer, ...(enrolled ? [learner] : [])], memberRequests: [], chatMessages: [],
    posts: [
      { id: `${id}-welcome`, authorId: teacher.id, authorName: teacher.name, authorRole: 'educator', kind: 'announcement',
        title: 'Start here · welcome to our class', body: `Welcome to ${name}! Explore Materials before our next session. Use Discussion to ask questions and help each other. Individual feedback stays in your own results.`,
        createdAt: past.toISOString(), comments: [] },
      { id: `${id}-discussion`, authorId: peer.id, authorName: peer.name, authorRole: 'student', kind: 'discussion',
        title: 'What would you like to practice together?', body: `I found the examples in our ${subject.toLowerCase()} guide helpful. Which part would you like us to go over next?`,
        createdAt: new Date(past.getTime() + 3600000).toISOString(), comments: [{ id: `${id}-reply`, authorId: teacher.id, authorName: teacher.name, authorRole: 'educator', body: 'Bring one example to our next session and we will work through it together.', createdAt: new Date(past.getTime() + 7200000).toISOString() }] },
    ],
    materials: [
      { id: `${id}-guide`, title: `${subject} · getting started`, description: 'Instructor-published study guide and worked examples. Shared with enrolled class members.', kind: 'Document' },
      { id: `${id}-practice`, title: 'Practice prompts', description: 'Use these prompts to prepare for our next class discussion. Shared with enrolled class members.', kind: 'Presentation' },
    ],
    sessions: [
      { id: `${id}-previous`, title: `${subject} · foundations`, date: pastDate, time: '16:00', meetingNote: 'Preview · browser local time' },
      { id: `${id}-next`, title: `${subject} · practice together`, date, time: '16:00', meetingNote: 'Preview · browser local time; no meeting connected' },
    ],
    attendance: [{ id: `${id}-attendance`, sessionId: `${id}-previous`, learnerId: PREVIEW_LEARNER_ID, status: 'Present' }],
    activities: [
      { id: `${id}-activity`, title: activityTitle, type: 'Assignment', instructions: `Choose one idea from our ${subject.toLowerCase()} session. Explain it in your own words and include an example.`, dueDate: date, scoringNote: 'Instructor-reviewed feedback', questions: [], responseType: 'Text', status: 'Published', submissions: [] },
      { id: `${id}-draft`, title: 'Next session preparation · teacher draft', type: 'Reading activity', instructions: 'Unpublished preparation for the next session.', dueDate: '', scoringNote: '', questions: [], responseType: 'Text', status: 'Draft', submissions: [] },
    ],
    progress: [
      { id: `${id}-feedback`, learnerId: PREVIEW_LEARNER_ID, learnerName: PREVIEW_LEARNER_NAME, activityTitle: `${subject} · introductory practice`, evaluation: 'Reviewed', feedback: 'Your explanation is clear. Try adding one concrete example in your next response.', released: true },
      { id: `${id}-unreleased`, learnerId: PREVIEW_LEARNER_ID, learnerName: PREVIEW_LEARNER_NAME, activityTitle: 'Teacher review in progress', evaluation: 'Draft evaluation', feedback: 'Unreleased individual feedback.', released: false },
      { id: `${id}-peer-feedback`, learnerId: peer.id, learnerName: peer.name, activityTitle: 'Individual practice', evaluation: 'Reviewed', feedback: 'Private feedback for another learner.', released: true },
    ],
  }
}

export function seedPreviewClassrooms(): Classroom[] {
  return [
    makePreviewClass('human-computer-interaction', 'Human Computer Interaction · BSIT 3A', 'Human Computer Interaction', 'educators'),
    makePreviewClass('quantitative-methods', 'Quantitative Methods · BSIT 2A', 'Quantitative Methods', 'educators', true, 3),
    makePreviewClass('algebra-coaching', 'Algebra coaching circle', 'Algebra', 'tutors', true, 2),
    makePreviewClass('coding-studio', 'The coding studio', 'Programming', 'tutors', true, 4),
    makePreviewClass('everyday-english', 'Everyday English', 'Speaking & listening', 'esl', true, 1),
    makePreviewClass('writing-workshop', 'English writing workshop', 'Writing', 'esl', true, 5),
    makePreviewClass('conversation-club', 'English conversation club', 'Conversation', 'esl', false, 6),
    { ...makePreviewClass('past-math', 'Math foundations · completed preview', 'Mathematics', 'educators'), previewStatus: 'inactive' },
  ]
}
```

### `classroom-preview-notice.tsx`

Current file: `src/components/features/classrooms/classroom-preview-notice.tsx`

```tsx
import { FlaskConical } from 'lucide-react'
import { Link } from 'react-router'
import { useClassroomPrototype } from './classroom-prototype-context'
import type { WorkspaceRole } from './classroom-types'

const workspaces: { role: WorkspaceRole; label: string }[] = [
  { role: 'students', label: 'Student' }, { role: 'educators', label: 'Educator' },
  { role: 'tutors', label: 'Tutor' }, { role: 'esl', label: 'ESL teacher' },
]

export function ClassroomPreviewNotice({ role, classroomId }: { role: WorkspaceRole; classroomId?: string }) {
  const { connectedModeEnabled, getClassroomsForWorkspace } = useClassroomPrototype()
  if (connectedModeEnabled) return null
  return <aside aria-label="Classroom preview" className="rounded-xl border border-brand/20 bg-brand-soft/50 p-4 text-sm">
    <p className="flex items-center gap-2 font-semibold"><FlaskConical aria-hidden="true" className="size-4 text-brand" />Demo / Preview data</p>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">Explore as Alex Rivera or a sample teacher. Changes stay in this tab while you switch workspaces and reset on refresh. Nothing is saved to an account.</p>
    <nav aria-label="Preview as a role" className="mt-3 flex flex-wrap gap-2">{workspaces.map(item => <Link key={item.role}
      to={`/${item.role}/classrooms${classroomId && getClassroomsForWorkspace(item.role).some(item => item.id === classroomId) ? `/${classroomId}` : ''}`} aria-current={role === item.role ? 'page' : undefined}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand ${role === item.role ? 'border-brand bg-brand text-brand-foreground' : 'border-border bg-background hover:bg-muted'}`}>
      {item.label} preview
    </Link>)}</nav>
  </aside>
}
```

### `classroom-preview-provider.tsx`

Current file: `src/components/features/classrooms/classroom-preview-provider.tsx`

```tsx
import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { ClassroomPrototypeContext, type ClassroomPrototypeContextValue } from './classroom-prototype-context'
import { classroomForPreviewRole, classroomPreviewStore, previewAuthor } from './classroom-preview-store'
import { makePreviewClass, PREVIEW_LEARNER_ID } from './classroom-preview-data'
import type { Classroom } from './classroom-types'

function unavailable(): never { throw new Error('This action is not included in the classroom preview.') }

export function ClassroomPreviewProvider({ children }: { children: ReactNode }) {
  const records = useSyncExternalStore(classroomPreviewStore.subscribe, classroomPreviewStore.getSnapshot)
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const value = useMemo<ClassroomPrototypeContextValue>(() => {
    const author = previewAuthor(role)
    const visible = (workspace = role) => records.flatMap(item => {
      const classroom = classroomForPreviewRole(item, workspace)
      return classroom ? [classroom] : []
    })
    const update = (id: string, change: (record: Classroom) => Classroom, ownerOnly = false) => classroomPreviewStore.update(id, role, change, ownerOnly)
    return {
      classrooms: visible(), classroomsLoading: false, classroomsError: null, connectedModeEnabled: false,
      currentLearnerId: PREVIEW_LEARNER_ID,
      getClassroom: id => visible().find(item => item.id === id),
      getClassroomsForWorkspace: visible,
      reloadClassrooms: () => {},
      createClassroom: async (input, workspace) => {
        if (role === 'students' || role !== workspace) throw new Error('Select a teaching workspace to create a preview class.')
        if (!input.name.trim()) throw new Error('Enter a classroom name.')
        const classroom = makePreviewClass(`preview-${crypto.randomUUID()}`, input.name.trim(), 'Learning together', workspace, false)
        classroom.description = input.description.trim()
        classroom.members = classroom.members.filter(member => member.role === 'educator')
        classroom.enrolledLearnerIds = []
        classroom.posts = []; classroom.materials = []; classroom.sessions = []; classroom.activities = []; classroom.attendance = []; classroom.progress = []
        classroomPreviewStore.insert(classroom)
        return classroom
      },
      joinClassroom: async code => {
        if (role !== 'students') throw new Error('Use the student preview to join a class.')
        const classroom = classroomPreviewStore.join(code)
        return { status: 'joined', classroomId: classroom.id, classroomName: classroom.name, source: 'demo' }
      },
      createPost: (id, input) => {
        if (!input.body.trim()) return
        if (input.kind === 'announcement' && role === 'students') throw new Error('Announcements are teacher-authored in this preview.')
        update(id, classroom => ({ ...classroom, posts: [{ id: crypto.randomUUID(), authorId: author.id, authorName: author.name,
          authorRole: author.role, title: input.title.trim(), body: input.body.trim(), kind: input.kind ?? 'discussion', createdAt: new Date().toISOString(), comments: [],
        }, ...classroom.posts] }))
      },
      addComment: (id, postId, body) => {
        if (!body.trim()) return
        update(id, classroom => ({ ...classroom, posts: classroom.posts.map(post => post.id === postId ? { ...post, comments: [...post.comments, {
          id: crypto.randomUUID(), authorId: author.id, authorName: author.name, authorRole: author.role, body: body.trim(), createdAt: new Date().toISOString(),
        }] } : post) }))
      },
      togglePostReaction: (id, postId, emoji) => update(id, classroom => ({ ...classroom, posts: classroom.posts.map(post => {
        if (post.id !== postId) return post
        const members = post.reactionMembers?.[emoji] ?? []
        return { ...post, reactionMembers: { ...post.reactionMembers, [emoji]: members.includes(author.id) ? members.filter(item => item !== author.id) : [...members, author.id] } }
      }) })),
      createActivity: (id, input) => {
        const activityId = crypto.randomUUID()
        update(id, classroom => ({ ...classroom, activities: [{ ...input, id: activityId, title: input.title.trim(), status: 'Published', submissions: [] }, ...classroom.activities] }), true)
        return activityId
      },
      submitActivity: (id, activityId, response, fileName) => {
        if (role !== 'students') throw new Error('Use the student preview to submit work.')
        update(id, classroom => ({ ...classroom, activities: classroom.activities.map(activity => activity.id === activityId && activity.status === 'Published' ? {
          ...activity, submissions: [...activity.submissions.filter(item => item.learnerId !== PREVIEW_LEARNER_ID), {
            id: crypto.randomUUID(), learnerId: PREVIEW_LEARNER_ID, learnerName: author.name, response, fileName,
            submittedAt: new Date().toISOString(), status: 'Submitted', released: false,
          }],
        } : activity) }))
      },
      reviewSubmission: (id, activityId, submissionId, evaluation, feedback, score) => update(id, classroom => {
        const submission = classroom.activities.find(item => item.id === activityId)?.submissions.find(item => item.id === submissionId)
        if (!submission) throw new Error('Submission unavailable.')
        return { ...classroom,
          activities: classroom.activities.map(activity => activity.id === activityId ? { ...activity, submissions: activity.submissions.map(item => item.id === submissionId ? {
            ...item, evaluation, feedback, score, released: true, status: 'Returned',
          } : item) } : activity),
          progress: [...classroom.progress.filter(item => item.id !== submissionId), { id: submissionId, learnerId: submission.learnerId, learnerName: submission.learnerName,
            activityTitle: classroom.activities.find(item => item.id === activityId)!.title, evaluation, feedback, released: true }],
        }
      }, true),
      markAttendance: (id, sessionId, learnerId, status) => update(id, classroom => ({ ...classroom, attendance: [
        ...classroom.attendance.filter(item => item.sessionId !== sessionId || item.learnerId !== learnerId),
        { id: crypto.randomUUID(), sessionId, learnerId, status },
      ] }), true),
      addSession: (id, session) => update(id, classroom => ({ ...classroom, sessions: [...classroom.sessions, { ...session, id: crypto.randomUUID() }] }), true),
      startActivityAttempt: (id, activityId) => {
        if (role !== 'students') throw new Error('Use the student preview to start an activity.')
        update(id, classroom => ({ ...classroom, activities: classroom.activities.map(activity => activity.id === activityId && activity.status === 'Published' && !activity.attempts?.some(item => item.learnerId === PREVIEW_LEARNER_ID) ? {
          ...activity, attempts: [...(activity.attempts ?? []), { learnerId: PREVIEW_LEARNER_ID, startedAt: new Date().toISOString() }],
        } : activity) }))
      },
      createMeetingLink: unavailable, requestMember: unavailable, resolveMemberRequest: unavailable, removeMember: unavailable,
      sendChatMessage: unavailable,
    }
  }, [records, role])
  return <ClassroomPrototypeContext.Provider value={value}>{children}</ClassroomPrototypeContext.Provider>
}
```

### `classroom-preview-store.ts`

Current file: `src/components/features/classrooms/classroom-preview-store.ts`

```ts
import { PREVIEW_LEARNER_ID, PREVIEW_LEARNER_NAME, previewTeachers, seedPreviewClassrooms } from './classroom-preview-data'
import type { Classroom, WorkspaceRole } from './classroom-types'

export function classroomForPreviewRole(classroom: Classroom, role: WorkspaceRole): Classroom | undefined {
  if (role !== 'students') return classroom.ownerWorkspace === role ? { ...classroom, access: 'owner' } : undefined
  if (!classroom.enrolledLearnerIds.includes(PREVIEW_LEARNER_ID)) return undefined
  return {
    ...classroom, access: 'student', joinCode: null, memberRequests: [], chatMessages: [],
    members: classroom.members.filter(member => member.id === PREVIEW_LEARNER_ID || member.id === classroom.ownerId),
    enrolledLearnerIds: [PREVIEW_LEARNER_ID],
    activities: classroom.activities.filter(activity => activity.status === 'Published').map(activity => ({ ...activity,
      submissions: activity.submissions.filter(item => item.learnerId === PREVIEW_LEARNER_ID).map(item => item.released ? item : {
        id: item.id, learnerId: item.learnerId, learnerName: item.learnerName, response: item.response,
        fileName: item.fileName, submittedAt: item.submittedAt, status: item.status, released: false,
      }),
      attempts: activity.attempts?.filter(item => item.learnerId === PREVIEW_LEARNER_ID),
    })),
    attendance: classroom.attendance.filter(record => record.learnerId === PREVIEW_LEARNER_ID),
    progress: classroom.progress.filter(record => record.learnerId === PREVIEW_LEARNER_ID && record.released),
  }
}

export function createClassroomPreviewStore(initial = seedPreviewClassrooms()) {
  let records = initial
  const listeners = new Set<() => void>()
  const emit = () => listeners.forEach(listener => listener())
  return {
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    getSnapshot: () => records,
    reset: () => { records = seedPreviewClassrooms(); emit() },
    insert: (classroom: Classroom) => { records = [classroom, ...records]; emit() },
    update: (id: string, role: WorkspaceRole, change: (record: Classroom) => Classroom, ownerOnly = false) => {
      const classroom = records.find(item => item.id === id)
      const visible = classroom && classroomForPreviewRole(classroom, role)
      if (!visible || (ownerOnly && visible.access !== 'owner')) throw new Error('This action is unavailable in this classroom preview.')
      records = records.map(item => item.id === id ? change(item) : item)
      emit()
    },
    join: (code: string) => {
      const classroom = records.find(item => item.joinCode === code.trim().toUpperCase())
      if (!classroom) throw new Error('That preview code was not found. Check the code and try again.')
      if (classroom.previewStatus === 'inactive') throw new Error('This preview class is inactive.')
      if (!classroom.enrolledLearnerIds.includes(PREVIEW_LEARNER_ID)) {
        records = records.map(item => item.id === classroom.id ? { ...item,
          enrolledLearnerIds: [...item.enrolledLearnerIds, PREVIEW_LEARNER_ID],
          members: [...item.members, { id: PREVIEW_LEARNER_ID, name: PREVIEW_LEARNER_NAME, role: 'student' }],
        } : item)
        emit()
      }
      return classroomForPreviewRole(records.find(item => item.id === classroom.id)!, 'students')!
    },
  }
}

export function previewAuthor(role: WorkspaceRole) {
  return role === 'students'
    ? { id: PREVIEW_LEARNER_ID, name: PREVIEW_LEARNER_NAME, role: 'student' as const }
    : { ...previewTeachers[role], role: 'educator' as const }
}

export const classroomPreviewStore = createClassroomPreviewStore()
```

### `classroom-preview.test.tsx`

Current file: `src/components/features/classrooms/classroom-preview.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ClassroomPrototypeProvider } from './classroom-prototype-provider'
import { ClassroomsView } from './classrooms-view'
import { ClassroomDetailView } from './classroom-detail-view'
import { ClassroomActivityView } from './classroom-activity-view'
import { classroomForPreviewRole, classroomPreviewStore } from './classroom-preview-store'
import { PREVIEW_LEARNER_ID } from './classroom-preview-data'
import { AuthSessionContext } from '@/components/features/auth/auth-session-context'
import { getClassrooms } from '@/services/api/classroom.service'

vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: false }))
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
beforeEach(() => { classroomPreviewStore.reset(); vi.clearAllMocks() })
afterEach(cleanup)

function PreviewLocation() {
  const location = useLocation()
  return <output aria-label="Current preview URL">{location.pathname + location.search}</output>
}

function preview(path = '/students/classrooms') {
  return render(<MemoryRouter initialEntries={[path]}><AuthSessionContext.Provider value={{ user: null, status: 'anonymous', error: null,
    signIn: async () => { throw new Error('Preview only') }, signOut: async () => {}, refreshCurrentUser: async () => {} }}><ClassroomPrototypeProvider>
    <PreviewLocation /><Routes>{['students', 'educators', 'tutors', 'esl'].map(role => <Route key={role} path={`/${role}/classrooms`}>
      <Route index element={<ClassroomsView />} /><Route path=":classroomId" element={<ClassroomDetailView />} /><Route path=":classroomId/classwork/:activityId" element={<ClassroomActivityView />} />
    </Route>)}</Routes>
  </ClassroomPrototypeProvider></AuthSessionContext.Provider></MemoryRouter>)
}

describe('shared classroom preview', () => {
  it('filters student enrollments by teaching category, supports search and list layout, and never calls the API', async () => {
    const user = userEvent.setup()
    preview()
    expect(screen.getAllByRole('link', { name: /^View class / })).toHaveLength(7)
    expect(screen.queryByText('English conversation club')).toBeNull()
    await user.click(screen.getByRole('button', { name: /^Tutoring/ }))
    expect(screen.getAllByRole('link', { name: /^View class / })).toHaveLength(2)
    await user.type(screen.getByRole('searchbox', { name: 'Search classes' }), 'coding')
    expect(screen.getAllByRole('link', { name: /^View class / })).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'List view' }))
    expect(within(screen.getByRole('table', { name: 'Classes' })).getByText('The coding studio')).toBeTruthy()
    expect(getClassrooms).not.toHaveBeenCalled()
  })

  it('enrolls the student in the same ESL record and exposes it in the ESL filter', async () => {
    const user = userEvent.setup()
    preview()
    await user.click(screen.getByRole('button', { name: 'Join a class' }))
    await user.type(screen.getByLabelText('Classroom invite code'), 'owl-conversation')
    await user.click(screen.getByRole('button', { name: 'Join class' }))
    expect(await screen.findByText('English conversation club')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /^ESL/ }))
    expect(screen.getAllByRole('link', { name: /^View class / })).toHaveLength(3)
    expect(classroomPreviewStore.getSnapshot().filter(item => item.id === 'conversation-club')).toHaveLength(1)
    expect(classroomPreviewStore.getSnapshot().find(item => item.id === 'conversation-club')?.enrolledLearnerIds).toContain(PREVIEW_LEARNER_ID)
  })

  it('keeps a teacher announcement and learner reply shared across workspace navigation', async () => {
    const user = userEvent.setup()
    preview('/tutors/classrooms/algebra-coaching')
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Discussion')
    await user.selectOptions(screen.getByLabelText('Post type'), 'announcement')
    await user.type(screen.getByLabelText('Write a class post'), 'Please bring your practice notebook.')
    await user.click(screen.getByRole('button', { name: 'Post to class' }))
    await user.click(screen.getByRole('link', { name: 'Student preview' }))
    const featured = screen.getByRole('region', { name: 'Featured announcements' })
    expect(within(featured).getByText('Please bring your practice notebook.')).toBeTruthy()
    expect(screen.queryByLabelText('Post type')).toBeNull()
    const article = within(featured).getByText('Please bring your practice notebook.').closest('article')!
    await user.click(within(article).getByRole('button', { name: 'Reply' }))
    await user.type(within(article).getByLabelText('Reply to Daniel Cruz'), 'Ready for the next session!')
    await user.click(within(article).getByRole('button', { name: 'Submit' }))
    await user.click(screen.getByRole('link', { name: 'Tutor preview' }))
    const updated = screen.getByText('Please bring your practice notebook.').closest('article')!
    await user.click(within(updated).getByRole('button', { name: /1 reply/ }))
    expect(within(updated).getByText('Ready for the next session!')).toBeTruthy()
  })

  it('excludes drafts, unreleased feedback, other learner results, and join codes from the student projection', () => {
    const classroom = classroomPreviewStore.getSnapshot()[0]
    const student = classroomForPreviewRole(classroom, 'students')!
    expect(student.joinCode).toBeNull()
    expect(student.activities.every(item => item.status === 'Published')).toBe(true)
    expect(student.progress).toHaveLength(1)
    expect(student.progress.every(item => item.learnerId === PREVIEW_LEARNER_ID && item.released)).toBe(true)
    expect(classroomForPreviewRole(classroomPreviewStore.getSnapshot().find(item => item.id === 'conversation-club')!, 'students')).toBeUndefined()
    expect(classroomForPreviewRole(classroom, 'tutors')).toBeUndefined()
    expect(() => classroomPreviewStore.update(classroom.id, 'students', item => item, true)).toThrow()
  })

  it('shares a student submission with the teacher and only returns deliberately released feedback', async () => {
    const user = userEvent.setup()
    preview('/students/classrooms/algebra-coaching/classwork/algebra-coaching-activity')
    await user.type(screen.getByLabelText('Your response'), 'I used a balance to explain both sides of an equation.')
    await user.click(screen.getByRole('button', { name: 'Submit preview response' }))
    expect(screen.getByText('Your instructor has not released feedback yet.')).toBeTruthy()
    await user.click(screen.getByRole('link', { name: 'Tutor preview' }))
    await user.click(screen.getByRole('tab', { name: 'Classwork' }))
    await user.click(screen.getAllByRole('link', { name: /Review activity/ })[0])
    await user.type(screen.getByLabelText('Evaluation'), 'Reviewed')
    await user.type(screen.getByLabelText('Learner-visible feedback'), 'Your balance example explains the idea well.')
    await user.click(screen.getByRole('button', { name: 'Release preview feedback' }))
    await user.click(screen.getByRole('link', { name: 'Student preview' }))
    await user.click(screen.getByRole('tab', { name: 'Progress & Feedback' }))
    expect(screen.getByText('Your balance example explains the idea well.')).toBeTruthy()
    expect(screen.queryByText('Teacher review in progress')).toBeNull()
    expect(screen.queryByText('Private feedback for another learner.')).toBeNull()
  })

  it('keeps the classroom route and unrelated query parameters when selecting tabs', () => {
    preview('/students/classrooms/everyday-english?tab=materials&context=lesson')
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Materials')
    fireEvent.click(screen.getByRole('tab', { name: 'Schedule' }))
    expect(screen.getByText('Class schedule')).toBeTruthy()
    expect(screen.getByLabelText('Current preview URL').textContent).toBe('/students/classrooms/everyday-english?tab=schedule&context=lesson')
  })

  it('creates an empty tutor class, then enrolls the student using its preview code', async () => {
    const user = userEvent.setup()
    preview('/tutors/classrooms')
    await user.click(screen.getByRole('button', { name: 'Create class' }))
    await user.type(screen.getByLabelText('Classroom name'), 'Geometry together')
    await user.click(screen.getByRole('button', { name: 'Create classroom' }))
    const created = classroomPreviewStore.getSnapshot().find(item => item.name === 'Geometry together')!
    expect(created.ownerWorkspace).toBe('tutors')
    expect(created.enrolledLearnerIds).toHaveLength(0)
    await user.click(screen.getByRole('link', { name: 'Student preview' }))
    expect(screen.queryByText('Geometry together')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Join a class' }))
    await user.type(screen.getByLabelText('Classroom invite code'), created.joinCode!)
    await user.click(screen.getByRole('button', { name: 'Join class' }))
    await user.click(screen.getByRole('button', { name: /^Tutoring/ }))
    expect(await screen.findByRole('link', { name: 'View class Geometry together' })).toHaveProperty('href', expect.stringContaining(created.id))
    expect(classroomPreviewStore.getSnapshot().filter(item => item.id === created.id)).toHaveLength(1)
  })

  it('shares reaction counts between roles without treating another member’s reaction as your own', async () => {
    const user = userEvent.setup()
    preview('/students/classrooms/everyday-english')
    const article = screen.getByText('Start here · welcome to our class').closest('article')!
    await user.click(within(article).getByRole('button', { name: 'Add reaction' }))
    const choice = within(article).getAllByRole('button', { name: /^Add .+ reaction$/ })[0]
    const label = choice.getAttribute('aria-label')!.replace(/^Add /, '').replace(/ reaction$/, '')
    await user.click(choice)
    expect(within(article).getByRole('button', { name: `${label}, 1 reaction` }).getAttribute('aria-pressed')).toBe('true')
    await user.click(screen.getByRole('link', { name: 'ESL teacher preview' }))
    const teacherArticle = screen.getByText('Start here · welcome to our class').closest('article')!
    expect(within(teacherArticle).getByRole('button', { name: `${label}, 1 reaction` }).getAttribute('aria-pressed')).toBe('false')
  })
})
```

### `classroom-prototype-context.ts`

Current file: `src/components/features/classrooms/classroom-prototype-context.ts`

```ts
import { createContext, useContext } from "react"
import type {
  AttendanceStatus,
  Classroom,
  ClassroomChatReplyRef,
  ClassroomSession,
  CreateActivityInput,
  CreateClassroomInput,
  WorkspaceRole,
} from "./classroom-types"

export type JoinClassroomResult =
  | { status: "joined"; classroomId: string; classroomName: string; source: "connected" | "demo" }
  | { status: "already-previewed"; classroomName: string }
  | { status: "unavailable" }

export type ClassroomPrototypeContextValue = {
  classrooms: Classroom[]
  classroomsLoading: boolean
  classroomsError: string | null
  connectedModeEnabled: boolean
  currentLearnerId?: string
  getClassroom: (classroomId: string) => Classroom | undefined
  getClassroomsForWorkspace: (role: WorkspaceRole) => Classroom[]
  reloadClassrooms: () => void
  createClassroom: (input: CreateClassroomInput, ownerWorkspace: Exclude<WorkspaceRole, "students">) => Promise<Classroom>
  joinClassroom: (joinCode: string) => Promise<JoinClassroomResult>
  createMeetingLink: (classroomId: string, meetingId: string) => void
  createPost: (classroomId: string, input: { title: string; body: string; authorRole: "student" | "educator"; kind?: "announcement" | "discussion" }) => void
  togglePostReaction: (classroomId: string, postId: string, emoji: string) => void
  addComment: (classroomId: string, postId: string, body: string, authorRole: "student" | "educator") => void
  requestMember: (classroomId: string, input: { name: string; email: string }, requestedByRole: "student" | "educator") => void
  resolveMemberRequest: (classroomId: string, requestId: string, decision: "accept" | "decline") => void
  removeMember: (classroomId: string, memberId: string) => void
  sendChatMessage: (classroomId: string, body: string, authorRole: "student" | "educator", replyTo?: ClassroomChatReplyRef) => void
  createActivity: (classroomId: string, input: CreateActivityInput) => string
  submitActivity: (classroomId: string, activityId: string, response: string, fileName?: string) => void
  startActivityAttempt: (classroomId: string, activityId: string) => void
  reviewSubmission: (
    classroomId: string,
    activityId: string,
    submissionId: string,
    evaluation: string,
    feedback: string,
    score?: number,
  ) => void
  markAttendance: (classroomId: string, sessionId: string, learnerId: string, status: AttendanceStatus) => void
  addSession: (classroomId: string, session: Omit<ClassroomSession, "id">) => void
}

export const ClassroomPrototypeContext = createContext<ClassroomPrototypeContextValue | null>(null)

export function useClassroomPrototype() {
  const context = useContext(ClassroomPrototypeContext)
  if (!context) throw new Error("useClassroomPrototype must be used within ClassroomPrototypeProvider")
  return context
}
```

### `classroom-prototype-provider.tsx`

Current file: `src/components/features/classrooms/classroom-prototype-provider.tsx`

```tsx
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuthSession } from '@/components/features/auth/auth-session-context'
import { getApiErrorMessage } from '@/services/api/api-error'
import type { AuthUser } from '@/services/api/api.types'
import { createClassroom, getClassrooms, joinClassroomByCode, type ApiClassroom } from '@/services/api/classroom.service'
import { ClassroomPrototypeContext, type ClassroomPrototypeContextValue } from './classroom-prototype-context'
import type { Classroom } from './classroom-types'
import { API_INTEGRATION_ENABLED } from '@/lib/api-mode'
import { ClassroomPreviewProvider } from './classroom-preview-provider'

function unsupported(): never { throw new Error('This classroom feature is not available yet.') }

function fromApi(record: ApiClassroom, user: AuthUser, joinCode: string | null = null): Classroom {
  const owned = record.ownerId === user.id
  return { id: record.id, ownerId: record.ownerId, name: record.name, description: record.description,
    subject: '', instructorName: owned ? user.name : '', ownerWorkspace: null,
    joinCode: owned ? joinCode : null, meetingId: null, access: owned ? 'owner' : 'student',
    members: [], memberRequests: [], enrolledLearnerIds: [], posts: [], chatMessages: [],
    materials: [], sessions: [], attendance: [], activities: [], progress: [], isMock: false }
}

export function ClassroomPrototypeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthSession()
  if (!API_INTEGRATION_ENABLED) return <ClassroomPreviewProvider>{children}</ClassroomPreviewProvider>
  // Remount on account/role changes so data and one-time invite codes cannot cross sessions.
  return <ClassroomSessionProvider key={user ? user.id + ':' + user.roles.join(',') : 'anonymous'} user={user}>{children}</ClassroomSessionProvider>
}

function ClassroomSessionProvider({ user, children }: { user: AuthUser | null; children: ReactNode }) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [classroomsLoading, setLoading] = useState(Boolean(user))
  const [classroomsError, setError] = useState<string | null>(null)
  const generation = useRef(0)
  const load = useCallback((signal?: AbortSignal) => {
    if (!user) return Promise.resolve()
    const request = ++generation.current
    return getClassrooms(signal).then(records => {
      if (signal?.aborted || request !== generation.current) return
      setClassrooms(current => records.map(record => fromApi(record, user,
        current.find(item => item.id === record.id)?.joinCode ?? null)))
      setError(null)
    }).catch(error => {
      if (signal?.aborted || request !== generation.current) return
      setClassrooms([])
      setError(getApiErrorMessage(error, 'Your classes could not be loaded.'))
    }).finally(() => {
      if (!signal?.aborted && request === generation.current) setLoading(false)
    })
  }, [user])
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])
  const reloadClassrooms = useCallback(() => { setLoading(Boolean(user)); void load() }, [load, user])
  const value = useMemo<ClassroomPrototypeContextValue>(() => ({
    classrooms, classroomsLoading, classroomsError, connectedModeEnabled: true, currentLearnerId: user?.id,
    getClassroom: id => classrooms.find(item => item.id === id),
    getClassroomsForWorkspace: role => classrooms.filter(item => role === 'students' ? item.access === 'student' : item.access === 'owner'),
    reloadClassrooms,
    createClassroom: async input => {
      if (!user) throw new Error('Sign in before creating a classroom.')
      const result = await createClassroom(input)
      const classroom = fromApi(result.classroom, user, result.joinCode)
      generation.current++
      setClassrooms(current => [classroom, ...current.filter(item => item.id !== classroom.id)])
      setLoading(false); setError(null)
      return classroom
    },
    joinClassroom: async code => {
      if (!user) throw new Error('Sign in before joining a classroom.')
      const classroom = fromApi(await joinClassroomByCode(code.trim()), user)
      generation.current++
      setClassrooms(current => [classroom, ...current.filter(item => item.id !== classroom.id)])
      setLoading(false); setError(null)
      return { status: 'joined', classroomId: classroom.id, classroomName: classroom.name, source: 'connected' }
    },
    // These screens have no API contract yet; never simulate a successful write.
    createMeetingLink: unsupported, createPost: unsupported, addComment: unsupported, togglePostReaction: unsupported,
    requestMember: unsupported, resolveMemberRequest: unsupported, removeMember: unsupported,
    sendChatMessage: unsupported, createActivity: unsupported, submitActivity: unsupported,
    startActivityAttempt: unsupported, reviewSubmission: unsupported, markAttendance: unsupported, addSession: unsupported,
  }), [classrooms, classroomsLoading, classroomsError, reloadClassrooms, user])
  return <ClassroomPrototypeContext.Provider value={value}>{children}</ClassroomPrototypeContext.Provider>
}
```

### `classroom-quiz.test.tsx`

Current file: `src/components/features/classrooms/classroom-quiz.test.tsx`

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { ClassroomActivityView } from './classroom-activity-view'
vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: true }))
afterEach(cleanup)
it('does not render sample quizzes or accept submissions without an activity API', () => {
  render(<MemoryRouter initialEntries={['/students/classrooms/biology-101/classwork/sample-quiz']}><ClassroomActivityView /></MemoryRouter>)
  expect(screen.getByText('Classroom activities are not available yet')).toBeTruthy()
  expect(screen.queryByRole('button', { name: /start|submit|return/i })).toBeNull()
  expect(screen.getByRole('link', { name: 'Back to classrooms' }).getAttribute('href')).toBe('/students/classrooms')
})
```

### `classroom-records-view.tsx`

Current file: `src/components/features/classrooms/classroom-records-view.tsx`

```tsx
import { useState, type FormEvent } from "react"
import { BookOpen, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { AttendanceStatus, Classroom, WorkspaceRole } from "./classroom-types"

export function ClassroomMaterialsView({
  classroom,
  kindGroup = "all",
}: {
  classroom: Classroom
  kindGroup?: "all" | "media" | "files"
}) {
  const materials = classroom.materials.filter((material) => kindGroup === "all"
    || (kindGroup === "media" ? material.kind === "Link" || material.kind === "Video" : material.kind === "Document" || material.kind === "Presentation"),
  )
  const title = kindGroup === "media" ? "Class media" : kindGroup === "files" ? "Class files" : "Class materials"
  const headingId = kindGroup === "all" ? "materials-heading" : `${kindGroup}-heading`
  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div>
        <h3 id={headingId} className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">Resources listed for {classroom.name}.</p>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Resource entries are preview metadata only. No documents or media are uploaded or stored.</p>
      {materials.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-8 text-sm text-slate-600">{classroom.isMock ? `No demo ${kindGroup === "all" ? "materials" : kindGroup} in this classroom yet.` : `No ${kindGroup === "all" ? "materials" : kindGroup} are connected to this classroom.`}</CardContent></Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {materials.map((material) => (
            <li key={material.id}>
              <Card>
                <CardContent className="flex items-start gap-3 py-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><BookOpen aria-hidden="true" className="size-4" /></span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900">{material.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{material.description}</p>
                    <Badge variant="outline" className="mt-2">{material.kind} · demo</Badge>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ClassroomPeopleView({ classroom }: { classroom: Classroom }) {
  return (
    <section className="space-y-4" aria-labelledby="people-heading">
      <div>
        <h3 id="people-heading" className="text-lg font-semibold text-slate-900">People in this class</h3>
        <p className="mt-1 text-sm text-slate-600">{classroom.isMock
          ? classroom.access === 'student' ? 'Your instructor and your own enrollment.' : `${classroom.members.length} demo members.`
          : "Connected classroom membership is verified by the API."}
        </p>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">{classroom.isMock
        ? "This is a sample roster, not live membership data."
        : "The classroom API does not return a full member roster yet; only the instructor and current learner context are shown."}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {classroom.members.map((member) => (
          <li key={member.id}>
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{member.name}</p>
                  <p className="text-xs capitalize text-slate-500">{member.role} · demo</p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ClassroomScheduleView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { addSession } = useClassroomPrototype()
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState("")
  const isStudent = role === "students"

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    addSession(classroom.id, {
      title: String(form.get("session-title") ?? "").trim(),
      date: String(form.get("session-date") ?? ""),
      time: String(form.get("session-time") ?? ""),
      meetingNote: "Demo schedule · local time",
    })
    event.currentTarget.reset()
    setShowForm(false)
    setStatus("Demo session added for this in-memory preview only.")
  }

  return (
    <section className="space-y-4" aria-labelledby="schedule-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="schedule-heading" className="text-lg font-semibold text-slate-900">Class schedule</h3>
          <p className="mt-1 text-sm text-slate-600">Sessions for {classroom.name}.</p>
        </div>
        {!isStudent && <Button type="button" variant="outline" onClick={() => setShowForm((current) => !current)}><CalendarDays aria-hidden="true" /> Add session preview</Button>}
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">Schedule entries are local-time mock previews. No reminders, recurrence, or calendar integration is active.</p>
      {status && <p role="status" className="text-sm text-amber-800">{status}</p>}
      {showForm && !isStudent && (
        <Card>
          <CardHeader><CardTitle>Add a demo session</CardTitle><CardDescription>This session will appear only in this app session.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2 sm:col-span-3"><Label htmlFor="session-title">Session name</Label><Input id="session-title" name="session-title" required maxLength={80} /></div>
              <div className="grid gap-2"><Label htmlFor="session-date">Date</Label><Input id="session-date" name="session-date" type="date" required /></div>
              <div className="grid gap-2"><Label htmlFor="session-time">Local time</Label><Input id="session-time" name="session-time" type="time" required /></div>
              <div className="flex items-end gap-2"><Button type="submit">Add demo session</Button><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      {classroom.sessions.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-8 text-sm text-slate-600">No demo sessions scheduled.</CardContent></Card>
      ) : (
        <ol className="space-y-3">
          {classroom.sessions.map((session) => (
            <li key={session.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-3 py-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><CalendarDays aria-hidden="true" className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900">{session.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{session.date} · {session.time} · {session.meetingNote}</p>
                  </div>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo</Badge>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function ClassroomAttendanceView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { markAttendance, currentLearnerId } = useClassroomPrototype()
  const [status, setStatus] = useState("")
  const isStudent = role === "students"
  const sessions = classroom.sessions
  const statuses: AttendanceStatus[] = ["Present", "Absent", "Late", "Excused"]
  const learnerMembers = classroom.members.filter((member) => member.role === "student")
  const visibleMembers = isStudent ? learnerMembers.filter((member) => member.id === currentLearnerId) : learnerMembers

  return (
    <section className="space-y-4" aria-labelledby="attendance-heading">
      <div>
        <h3 id="attendance-heading" className="text-lg font-semibold text-slate-900">Attendance</h3>
        <p className="mt-1 text-sm text-slate-600">{isStudent ? "Your permitted attendance preview for this class." : "Educator-managed attendance preview for this class."}</p>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">Attendance here is mock data and does not create an official record. It is recorded explicitly by the teacher, never inferred from meeting presence.</p>
      {status && <p role="status" className="text-sm text-amber-800">{status}</p>}
      {sessions.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-8 text-sm text-slate-600">Add a demo session before viewing attendance.</CardContent></Card>
      ) : sessions.map((session) => (
        <Card key={session.id}>
          <CardHeader><CardTitle className="text-base">{session.title}</CardTitle><CardDescription>{session.date} · {session.time} · demo</CardDescription></CardHeader>
          <CardContent>
            {visibleMembers.length === 0 ? (
              <p className="text-sm text-slate-600">No demo learner attendance to display.</p>
            ) : (
              <ul className="space-y-3">
                {visibleMembers.map((member) => {
                  const record = classroom.attendance.find((item) => item.sessionId === session.id && item.learnerId === member.id)
                  return (
                    <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="text-sm font-medium text-slate-800">{isStudent ? "You · demo learner" : member.name}</span>
                      {isStudent ? (
                        <Badge variant="outline">{record?.status ?? "Not recorded · demo"}</Badge>
                      ) : (
                        <Label className="sr-only" htmlFor={`attendance-${session.id}-${member.id}`}>Attendance for {member.name}</Label>
                      )}
                      {!isStudent && (
                        <select
                          id={`attendance-${session.id}-${member.id}`}
                          value={record?.status ?? ""}
                          onChange={(event) => {
                            const nextStatus = event.currentTarget.value as AttendanceStatus
                            if (!nextStatus) return
                            markAttendance(classroom.id, session.id, member.id, nextStatus)
                            setStatus(`${member.name}'s attendance preview was changed for this session only.`)
                          }}
                          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <option value="" disabled>Select status</option>
                          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

export function ClassroomProgressView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { currentLearnerId } = useClassroomPrototype()
  const isStudent = role === "students"
  const progress = classroom.progress.filter((record) => isStudent
    ? record.learnerId === currentLearnerId && record.released
    : true,
  )

  return (
    <section className="space-y-4" aria-labelledby="progress-heading">
      <div>
        <h3 id="progress-heading" className="text-lg font-semibold text-slate-900">{isStudent ? "Your released results" : classroom.ownerWorkspace === "tutors" || classroom.ownerWorkspace === "esl" ? "Learner evaluations" : "Grades & progress"}</h3>
        <p className="mt-1 text-sm text-slate-600">{isStudent ? "Only your released classroom feedback is shown." : `Mock learning records for ${classroom.name}.`}</p>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">Preview records only. These are not official grades or saved progress.</p>
      {progress.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-8 text-sm text-slate-600">{isStudent ? "No released demo results yet." : "No demo evaluations yet."}</CardContent></Card>
      ) : (
        <ul className="space-y-3">
          {progress.map((record) => (
            <li key={record.id}>
              <Card>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{record.activityTitle}</h4>
                      {!isStudent && <p className="mt-1 text-xs text-slate-500">{record.learnerName}</p>}
                    </div>
                    <Badge variant="outline">{record.evaluation} · {record.released ? 'Released' : 'Unreleased'}</Badge>
                  </div>
                  {record.feedback && <p className="mt-3 whitespace-pre-wrap text-sm leading-5 text-slate-700">{record.feedback}</p>}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
```

### `classroom-test-data.ts`

Current file: `src/components/features/classrooms/classroom-test-data.ts`

```ts
import type { AuthUser } from '@/services/api/api.types'
import type { ApiClassroom } from '@/services/api/classroom.service'

export const student: AuthUser = { id: 'student-id', name: 'Student Account', email: 'student@example.test',
  roles: ['STUDENT'], status: 'ACTIVE', emailVerifiedAt: '2026-01-01', createdAt: '2026-01-01' }
export const teacher: AuthUser = { ...student, id: 'teacher-id', name: 'Teacher Account', roles: ['EDUCATOR'] }
export const classroom: ApiClassroom = { id: 'class-id', ownerId: teacher.id, name: 'Server Mathematics', description: 'From the API', createdAt: '2026-01-01' }
```

### `classroom-test-fixtures.tsx`

Current file: `src/components/features/classrooms/classroom-test-fixtures.tsx`

```tsx
import type { ReactNode } from 'react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { AuthSessionContext } from '@/components/features/auth/auth-session-context'
import type { AuthUser } from '@/services/api/api.types'
import { student } from './classroom-test-data'
import { ClassroomPrototypeProvider } from './classroom-prototype-provider'

vi.mock('@/lib/api-mode', () => ({ API_INTEGRATION_ENABLED: true }))

export function TestSession({ user = student, path = '/students/classrooms', children }: { user?: AuthUser | null; path?: string; children: ReactNode }) {
  return <MemoryRouter initialEntries={[path]}><AuthSessionContext.Provider value={{ user, status: user ? 'authenticated' : 'anonymous', error: null,
    signIn: async () => { throw new Error('Not used') }, signOut: async () => {}, refreshCurrentUser: async () => {} }}>
    <ClassroomPrototypeProvider>{children}</ClassroomPrototypeProvider>
  </AuthSessionContext.Provider></MemoryRouter>
}
```

### `classroom-types.ts`

Current file: `src/components/features/classrooms/classroom-types.ts`

```ts
export type WorkspaceRole = "students" | "educators" | "tutors" | "esl"

export type ClassroomMember = {
  id: string
  name: string
  role: "student" | "educator"
}

export type ClassroomComment = {
  id: string
  authorId: string
  authorName: string
  authorRole: "student" | "educator"
  body: string
  createdAt: string
}

export type MemberRequest = {
  id: string
  name: string
  email: string
  requestedBy: string
  requestedByRole: "student" | "educator"
  status: "pending" | "declined"
}

export type ClassroomPost = {
  id: string
  authorId: string
  authorName: string
  authorRole: "student" | "educator"
  kind: "announcement" | "discussion"
  title?: string
  views?: number
  body: string
  createdAt: string
  comments: ClassroomComment[]
  reactionMembers?: Record<string, string[]>
}

export type ClassroomChatReplyRef = {
  messageId: string
  authorName: string
  excerpt: string
}

export type ClassroomChatMessage = {
  id: string
  authorId: string
  authorName: string
  authorRole: "student" | "educator"
  body: string
  createdAt: string
  replyTo?: ClassroomChatReplyRef
}

export type ClassroomMaterial = {
  id: string
  title: string
  description: string
  kind: "Document" | "Link" | "Video" | "Presentation"
}

export type ClassroomSession = {
  id: string
  title: string
  date: string
  time: string
  meetingNote: string
}

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused"

export type ClassroomAttendance = {
  id: string
  sessionId: string
  learnerId: string
  status: AttendanceStatus
}

export type ActivityType =
  | "Quiz"
  | "Test"
  | "Assignment"
  | "File submission"
  | "Project"
  | "Presentation"
  | "Lab work"
  | "Practical activity"
  | "Discussion activity"
  | "Reading activity"
  | "Speaking practice"

export type QuestionType =
  | "Multiple choice"
  | "Multiple select"
  | "True or false"
  | "Identification"
  | "Short answer"
  | "Essay"

export type ActivityQuestion = {
  id: string
  type: QuestionType
  prompt: string
  options: string[]
}

export type ClassroomSubmission = {
  id: string
  learnerId: string
  learnerName: string
  response: string
  fileName?: string
  submittedAt: string
  status: "Submitted" | "In review" | "Returned"
  evaluation?: string
  feedback?: string
  score?: number
  released: boolean
}

export type ActivityTiming = {
  durationMinutes: number
  opensAt?: string
  closesAt?: string
  autoSubmitOnTimeUp: boolean
}

export type ActivityAttempt = {
  learnerId: string
  startedAt: string
}

export type ClassroomActivity = {
  id: string
  title: string
  type: ActivityType
  instructions: string
  dueDate: string
  scoringNote: string
  questions: ActivityQuestion[]
  responseType: "Text" | "File" | "Link" | "Quiz"
  status: "Published" | "Draft"
  submissions: ClassroomSubmission[]
  timing?: ActivityTiming
  showLeaderboard?: boolean
  attempts?: ActivityAttempt[]
}

export type ClassroomProgressRecord = {
  id: string
  learnerId: string
  learnerName: string
  activityTitle: string
  evaluation: string
  feedback: string
  released: boolean
}

export type Classroom = {
  ownerId?: string
  id: string
  name: string
  subject: string
  description: string
  instructorName: string
  ownerWorkspace: Exclude<WorkspaceRole, "students"> | null
  previewStatus?: "active" | "inactive"
  joinCode: string | null
  meetingId: string | null
  access: "owner" | "student"
  members: ClassroomMember[]
  memberRequests: MemberRequest[]
  enrolledLearnerIds: string[]
  posts: ClassroomPost[]
  chatMessages: ClassroomChatMessage[]
  materials: ClassroomMaterial[]
  sessions: ClassroomSession[]
  attendance: ClassroomAttendance[]
  activities: ClassroomActivity[]
  progress: ClassroomProgressRecord[]
  isMock: boolean
}

export type CreateClassroomInput = {
  name: string
  description: string
}

export type CreateActivityInput = {
  title: string
  type: ActivityType
  instructions: string
  dueDate: string
  scoringNote: string
  responseType: ClassroomActivity["responseType"]
  questions: ActivityQuestion[]
  timing?: ActivityTiming
  showLeaderboard?: boolean
}
```

### `classroom-ui.tsx`

Current file: `src/components/features/classrooms/classroom-ui.tsx`

```tsx
import { Construction } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { getInitials } from "./classroom-utils"

const avatarTones = [
  "bg-blue-100 text-blue-800",
  "bg-indigo-100 text-indigo-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-sky-100 text-sky-800",
]

export function PersonAvatar({ name, size = "default", className = "" }: { name: string; size?: "default" | "sm" | "lg"; className?: string }) {
  const tone = avatarTones[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarTones.length]
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={`${tone} text-xs font-semibold`}>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}

export function UnderDevelopment({ title }: { title: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="items-center gap-2 py-12 text-center">
        <Construction aria-hidden="true" className="size-8 text-slate-400" />
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="max-w-sm text-sm text-slate-600">This section is under development.</p>
      </CardContent>
    </Card>
  )
}
```

### `classroom-utils.ts`

Current file: `src/components/features/classrooms/classroom-utils.ts`

```ts
export function getInitials(name: string) {
  return name.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "?"
}

export function isYou(name: string) {
  return name.startsWith("You")
}
```

### `classrooms-view-accessibility.test.tsx`

Current file: `src/components/features/classrooms/classrooms-view-accessibility.test.tsx`

```tsx
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getClassrooms, joinClassroomByCode } from '@/services/api/classroom.service'
import { ClassroomsView } from './classrooms-view'
import { TestSession } from './classroom-test-fixtures'
vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getClassrooms).mockResolvedValue([]) })
describe('classroom join accessibility', () => {
  it('labels the dialog and restores focus after discard', async () => {
    const user = userEvent.setup()
    render(<TestSession><ClassroomsView /></TestSession>)
    const trigger = screen.getByRole('button', { name: 'Join a class' })
    await user.click(trigger)
    expect(await screen.findByRole('dialog', { name: 'Join a classroom' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })
  it('keeps invalid codes and focuses the field after an API rejection', async () => {
    vi.mocked(joinClassroomByCode).mockRejectedValue(new Error('Join code is invalid.'))
    const user = userEvent.setup()
    render(<TestSession><ClassroomsView /></TestSession>)
    await user.click(screen.getByRole('button', { name: 'Join a class' }))
    const input = screen.getByLabelText('Classroom invite code') as HTMLInputElement
    await user.type(input, 'invalid-code')
    await user.click(screen.getByRole('button', { name: 'Join class' }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Join code is invalid.')
    expect(input.value).toBe('invalid-code')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(input))
  })
})
```

### `classrooms-view.test.tsx`

Current file: `src/components/features/classrooms/classrooms-view.test.tsx`

```tsx
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createClassroom, getClassrooms, joinClassroomByCode } from '@/services/api/classroom.service'
import { ClassroomsView } from './classrooms-view'
import { TestSession } from './classroom-test-fixtures'
import { classroom, student, teacher } from './classroom-test-data'

vi.mock('@/services/api/classroom.service', () => ({ getClassrooms: vi.fn(), createClassroom: vi.fn(), joinClassroomByCode: vi.fn() }))
afterEach(cleanup)
beforeEach(() => { vi.resetAllMocks(); vi.mocked(getClassrooms).mockResolvedValue([]) })
describe('API classroom list', () => {
  it('has no sample classes when the API returns empty', async () => {
    render(<TestSession><ClassroomsView /></TestSession>)
    expect(await screen.findByText('No classes joined yet')).toBeTruthy()
    expect(screen.queryByText('Biology 101')).toBeNull()
    expect(screen.queryByText(/demo previews/i)).toBeNull()
  })
  it('loads only API classrooms', async () => {
    vi.mocked(getClassrooms).mockResolvedValue([classroom])
    render(<TestSession><ClassroomsView /></TestSession>)
    expect(await screen.findByText(classroom.name)).toBeTruthy()
  })
  it('keeps grid and list views backed by the same server records', async () => {
    vi.mocked(getClassrooms).mockResolvedValue([classroom])
    const user = userEvent.setup()
    render(<TestSession><ClassroomsView /></TestSession>)
    await screen.findByText(classroom.name)
    await user.click(screen.getByRole('button', { name: /list view/i }))
    expect(screen.getByRole('table', { name: 'Classes' })).toBeTruthy()
    expect(screen.getByText(classroom.name)).toBeTruthy()
  })
  it('shows an error instead of sample data on a failed load', async () => {
    vi.mocked(getClassrooms).mockRejectedValue(new Error('Service unavailable'))
    render(<TestSession><ClassroomsView /></TestSession>)
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('Service unavailable'))
    expect(screen.queryByText('No classes joined yet')).toBeNull()
    expect(screen.queryByText('Biology 101')).toBeNull()
  })
  it.each(['ESL', 'TUTOR'] as const)('lets %s create through the API', async role => {
    const account = { ...teacher, roles: [role] }
    vi.mocked(createClassroom).mockResolvedValue({ classroom, joinCode: 'a'.repeat(43) })
    const user = userEvent.setup()
    render(<TestSession user={account} path={role === 'ESL' ? '/esl/classrooms' : '/tutors/classrooms'}><ClassroomsView /></TestSession>)
    await screen.findByText('No classrooms yet')
    await user.click(screen.getByRole('button', { name: 'Create class' }))
    await user.type(screen.getByLabelText('Classroom name'), classroom.name)
    expect(screen.queryByLabelText('Subject or learning focus')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Create classroom' }))
    await waitFor(() => expect(createClassroom).toHaveBeenCalledWith({ name: classroom.name, description: '' }))
    expect(await screen.findByText(/was created/)).toBeTruthy()
  })
  it('does not claim creation succeeded if the API rejects it', async () => {
    vi.mocked(createClassroom).mockRejectedValue(new Error('Creation denied'))
    const user = userEvent.setup()
    render(<TestSession user={teacher} path="/educators/classrooms"><ClassroomsView /></TestSession>)
    await user.click(screen.getByRole('button', { name: 'Create class' }))
    await user.type(screen.getByLabelText('Classroom name'), 'Math')
    await user.click(screen.getByRole('button', { name: 'Create classroom' }))
    expect(await screen.findByText('Creation denied')).toBeTruthy()
    expect(screen.queryByText(/was created/)).toBeNull()
  })
  it('waits for server enrollment and prevents duplicate submissions', async () => {
    let resolve!: (value: typeof classroom) => void
    vi.mocked(joinClassroomByCode).mockReturnValue(new Promise(done => { resolve = done }))
    const user = userEvent.setup()
    render(<TestSession><ClassroomsView /></TestSession>)
    await user.click(screen.getByRole('button', { name: 'Join a class' }))
    await user.type(screen.getByLabelText('Classroom invite code'), 'a'.repeat(43))
    await user.click(screen.getByRole('button', { name: 'Join class' }))
    expect((screen.getByRole('button', { name: 'Joining…' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByText(/was added/)).toBeNull()
    expect(joinClassroomByCode).toHaveBeenCalledTimes(1)
    resolve(classroom)
    expect(await screen.findByText(/was added to your class list/)).toBeTruthy()
  })
  it('ignores the old account request when it finishes after account switching', async () => {
    let resolveOld!: (value: typeof classroom[]) => void
    vi.mocked(getClassrooms).mockReturnValueOnce(new Promise(done => { resolveOld = done }))
    const view = render(<TestSession user={student}><ClassroomsView /></TestSession>)
    const differentClass = { ...classroom, name: 'New account class' }
    vi.mocked(getClassrooms).mockResolvedValueOnce([differentClass])
    view.rerender(<TestSession user={{ ...student, id: 'different-id' }}><ClassroomsView /></TestSession>)
    await screen.findByText(differentClass.name)
    await act(async () => { resolveOld([classroom]) })
    expect(screen.queryByText(classroom.name)).toBeNull()
    expect(screen.getByText(differentClass.name)).toBeTruthy()
  })
  it('clears the previous account classes and ignores late responses', async () => {
    vi.mocked(getClassrooms).mockResolvedValueOnce([classroom])
    const nextClass = { ...classroom, id: 'other-class', name: 'Other account class' }
    const view = render(<TestSession user={student}><ClassroomsView /></TestSession>)
    await screen.findByText(classroom.name)
    let resolve!: (value: typeof classroom[]) => void
    vi.mocked(getClassrooms).mockReturnValueOnce(new Promise(done => { resolve = done }))
    view.rerender(<TestSession user={{ ...student, id: 'different-user' }}><ClassroomsView /></TestSession>)
    expect(screen.queryByText(classroom.name)).toBeNull()
    resolve([nextClass])
    expect(await screen.findByText(nextClass.name)).toBeTruthy()
    view.rerender(<TestSession user={null}><ClassroomsView /></TestSession>)
    expect(screen.queryByText(nextClass.name)).toBeNull()
  })
})
```

### `classrooms-view.tsx`

Current file: `src/components/features/classrooms/classrooms-view.tsx`

```tsx
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { Plus, Search, UserRoundPlus } from 'lucide-react'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/services/api/api-error'
import { ClassroomListHeader, ClassroomListRow, ClassroomCard } from './classroom-card'
import { FilterPills, GridListToggle, type ClassroomView } from './classroom-list-ui'
import { ClassroomCreateDialog, ClassroomJoinDialog } from './classroom-form-dialogs'
import { useClassroomPrototype } from './classroom-prototype-context'
import { ClassroomPreviewNotice } from './classroom-preview-notice'
import { getClassroomCategory } from './classroom-list-meta'

export function ClassroomsView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const student = role === 'students'
  const { classroomsLoading, classroomsError, getClassroomsForWorkspace, reloadClassrooms, createClassroom, joinClassroom, connectedModeEnabled } = useClassroomPrototype()
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [createdId, setCreatedId] = useState('')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ClassroomView>('grid')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('active')
  const pending = useRef(false)
  const codeRef = useRef<HTMLInputElement>(null)
  const joinTriggerRef = useRef<HTMLButtonElement>(null)
  const createTriggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (error && showJoin) codeRef.current?.focus() }, [error, showJoin])
  const classrooms = getClassroomsForWorkspace(role)
  const categories = [{ value: 'all', label: 'All Classes' }, { value: 'educators', label: 'School Classes' }, { value: 'tutors', label: 'Tutoring' }, { value: 'esl', label: 'ESL' }]
  const filtered = classrooms.filter(item => (category === 'all' || item.ownerWorkspace === category)
    && [item.name, item.description, item.instructorName, item.subject, getClassroomCategory(item)].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (sort === 'active' ? Number(a.previewStatus === 'inactive') - Number(b.previewStatus === 'inactive') : 0)
      || (sort === 'za' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)))
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || student) return
    pending.current = true; setCreating(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await createClassroom({ name: String(form.get('class-name') ?? ''), description: String(form.get('class-description') ?? '') }, role)
      setNotice(result.name + (connectedModeEnabled ? ' was created. Open it now to copy its one-time invite code.' : ' was created in this preview. Open it to copy its demo invite code.'))
      setCreatedId(result.id); setShowCreate(false)
    } catch (failure) { setError(getApiErrorMessage(failure, 'Classroom creation failed.')) }
    finally { pending.current = false; setCreating(false) }
  }
  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    pending.current = true; setJoining(true); setError('')
    try {
      const result = await joinClassroom(joinCode)
      if (result.status === 'joined') {
        setNotice(result.classroomName + ' was added to your class list.' + (connectedModeEnabled ? '' : ' Preview only; resets on refresh.'))
        setShowJoin(false); setJoinCode('')
      }
    } catch (failure) { setError(getApiErrorMessage(failure, 'Classroom enrollment failed.')) }
    finally { pending.current = false; setJoining(false) }
  }
  return <div className="mx-auto w-full max-w-7xl space-y-5">
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-2xl font-semibold">My Classes</h2>
        <p className="mt-2 text-sm text-muted-foreground">{student ? 'Your learning, all in one place. Pick up where your class left off.' : 'A home for your classes and the people learning with you.'}</p></div>
      {student ? <Button ref={joinTriggerRef} aria-haspopup="dialog" onClick={() => { setError(''); setShowJoin(true) }}><UserRoundPlus aria-hidden="true" />Join a class</Button>
        : <Button ref={createTriggerRef} aria-haspopup="dialog" onClick={() => { setError(''); setShowCreate(true) }}><Plus aria-hidden="true" />Create class</Button>}
    </section>
    <ClassroomPreviewNotice role={role} />
    {notice && <div role="status" className="rounded-xl border p-4"><p>{notice}</p>
      {createdId && <Link className="mt-2 inline-block underline" to={'/' + role + '/classrooms/' + createdId}>Open created classroom</Link>}</div>}
    {classroomsError && <section role="alert" className="rounded-xl border p-4">
      <h3 className="font-semibold">Your classes could not be loaded</h3><p>{classroomsError}</p>
      <Button variant="outline" className="mt-3" onClick={reloadClassrooms}>Try again</Button></section>}
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative min-w-0 flex-1 basis-64"><Search aria-hidden="true" className="absolute left-3 top-3 size-4 text-muted-foreground" /><span className="sr-only">Search classes</span>
        <Input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search classes or instructors" className="h-10 bg-card pl-10" /></label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">Sort
        <select value={sort} onChange={event => setSort(event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {!connectedModeEnabled && <option value="active">Active first</option>}<option value={connectedModeEnabled ? 'active' : 'az'}>Name A–Z</option><option value="za">Name Z–A</option>
        </select>
      </label><GridListToggle value={view} onValueChange={setView} />
    </div>
    {student && !connectedModeEnabled && <FilterPills label="Class category" options={categories.map(item => ({ ...item, count: classrooms.filter(classroom => item.value === 'all' || classroom.ownerWorkspace === item.value).length }))} value={category} onValueChange={setCategory} />}
    {student && connectedModeEnabled && <p className="text-xs text-muted-foreground">Teaching categories and active status are unavailable from the classroom service.</p>}
    {!classroomsLoading && !classroomsError && <p role="status" className="text-sm font-medium">{student ? "Classes you’ve joined" : 'Your classes'} <span className="text-muted-foreground">({filtered.length}{filtered.length !== classrooms.length ? ` of ${classrooms.length}` : ''})</span></p>}
    {classroomsLoading ? <p role="status">Loading classes…</p> : !classroomsError && filtered.length === 0
      ? <section className="rounded-xl border border-dashed p-8 text-center"><h3>{classrooms.length ? 'No classes match your search' : student ? 'No classes joined yet' : 'No classrooms yet'}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{classrooms.length ? 'Try another category or clear your search.' : student ? 'Ask your teacher for a classroom invite code.' : 'Create your first classroom to get started.'}</p>
        {classrooms.length > 0 && <Button variant="outline" className="mt-4" onClick={() => { setQuery(''); setCategory('all') }}>Clear filters</Button>}</section>
      : view === 'grid' ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(classroom => <ClassroomCard key={classroom.id} classroom={classroom} role={role} href={'/' + role + '/classrooms/' + classroom.id} />)}</div>
      : <div role="table" aria-label="Classes" className="overflow-hidden rounded-xl border"><ClassroomListHeader role={role} /><div role="rowgroup">{filtered.map(classroom => <ClassroomListRow key={classroom.id} classroom={classroom} role={role} href={'/' + role + '/classrooms/' + classroom.id} />)}</div></div>}
    {!connectedModeEnabled && student && <p className="text-xs text-muted-foreground">Try a new enrollment: use demo invite code <span className="select-all font-mono">OWL-CONVERSATION</span> to join the ESL conversation club.</p>}
    <ClassroomCreateDialog preview={!connectedModeEnabled} open={showCreate} onOpenChange={setShowCreate} onSubmit={handleCreate} pending={creating} error={error} finalFocus={() => createTriggerRef.current ?? false} />
    <ClassroomJoinDialog open={showJoin} onOpenChange={setShowJoin} onSubmit={handleJoin} code={joinCode} onCodeChange={setJoinCode}
      joining={joining} error={error} disclosure={connectedModeEnabled ? 'Your account is enrolled only after the classroom service confirms the invite code.' : 'This enrolls Alex Rivera in a demo classroom in this tab only. Try OWL-CONVERSATION. Changes reset on refresh.'} inputRef={codeRef} finalFocus={() => joinTriggerRef.current ?? false} />
  </div>
}
```

### `discussion-composer.tsx`

Current file: `src/components/features/classrooms/discussion-composer.tsx`

```tsx
import { useRef, useState, type FormEvent } from "react"
import { Link2, Paperclip, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { REACTION_CHOICES } from "./discussion-reaction-data"
import { PersonAvatar } from "./classroom-ui"

export function DiscussionComposer({
  id,
  label,
  placeholder = "Write a comment…",
  authorName,
  onSubmit,
}: {
  id: string
  label: string
  placeholder?: string
  authorName: string
  onSubmit: (body: string) => void
}) {
  const [draft, setDraft] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSubmit = draft.trim().length > 0

  const discard = () => {
    setDraft("")
    setEmojiOpen(false)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(draft.trim())
    discard()
  }

  const insertEmoji = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`)
    setEmojiOpen(false)
    textareaRef.current?.focus()
  }

  const iconButton =
    "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"

  return (
    <form onSubmit={submit} className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
      <PersonAvatar name={authorName} className="mt-1 hidden sm:flex" />
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">{label}</label>
        <Textarea
          ref={textareaRef}
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          maxLength={1000}
          placeholder={placeholder}
          className="min-h-16 resize-none bg-transparent px-2 shadow-none"
        />
        {emojiOpen && (
          <div role="group" aria-label="Insert emoji" className="mb-2 flex flex-wrap gap-1">
            {REACTION_CHOICES.map(({ emoji, label: emojiLabel }) => (
              <button
                key={emoji}
                type="button"
                aria-label={`Insert ${emojiLabel}`}
                onClick={() => insertEmoji(emoji)}
                className="inline-flex size-8 items-center justify-center rounded-md text-lg outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button type="button" disabled className={iconButton} aria-label="Attach a file (not available yet)" title="Attachments are not available yet">
              <Paperclip aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label="Add emoji"
              aria-expanded={emojiOpen}
              onClick={() => setEmojiOpen((current) => !current)}
            >
              <Smile aria-hidden="true" className="size-4" />
            </button>
            <button type="button" disabled className={iconButton} aria-label="Add a link (type or paste a full https:// URL instead)" title="Paste a full https:// URL into your comment">
              <Link2 aria-hidden="true" className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={discard} disabled={!draft}>Discard</Button>
            <Button type="submit" size="sm" disabled={!canSubmit}>Submit</Button>
          </div>
        </div>
      </div>
    </form>
  )
}
```

### `discussion-post.tsx`

Current file: `src/components/features/classrooms/discussion-post.tsx`

```tsx
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
```

### `discussion-reaction-data.ts`

Current file: `src/components/features/classrooms/discussion-reaction-data.ts`

```ts
export const REACTION_CHOICES = [
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "👏", label: "Clapping" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "🎉", label: "Celebrate" },
  { emoji: "💡", label: "Insightful" },
] as const

export type ReactionState = Record<string, { count: number; mine: boolean }>
```

### `discussion-reactions.tsx`

Current file: `src/components/features/classrooms/discussion-reactions.tsx`

```tsx
import { useState } from "react"
import { Plus } from "lucide-react"

import { REACTION_CHOICES, type ReactionState } from "./discussion-reaction-data"

const chipClass =
  "inline-flex h-7 items-center gap-1.5 rounded-full border border-transparent bg-muted px-2.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"

export function DiscussionReactions({
  postId,
  reactions,
  onToggle,
}: {
  postId: string
  reactions: ReactionState
  onToggle: (emoji: string) => void
}) {
  const [picking, setPicking] = useState(false)
  const active = REACTION_CHOICES.filter(({ emoji }) => (reactions[emoji]?.count ?? 0) > 0)
  const available = REACTION_CHOICES.filter(({ emoji }) => (reactions[emoji]?.count ?? 0) === 0)

  return (
    <div role="group" aria-label="Reactions (preview only)" className="flex flex-wrap items-center gap-2">
      {active.map(({ emoji, label }) => {
        const { count, mine } = reactions[emoji]
        return (
          <button
            key={emoji}
            type="button"
            aria-pressed={mine}
            aria-label={`${label}, ${count} ${count === 1 ? "reaction" : "reactions"}`}
            onClick={() => onToggle(emoji)}
            className={`${chipClass} ${mine ? "border-primary/40 bg-primary/10" : ""}`}
          >
            <span aria-hidden="true">{emoji}</span>
            <span aria-hidden="true">{count}</span>
          </button>
        )
      })}
      {available.length > 0 && (
        <button
          type="button"
          aria-expanded={picking}
          aria-controls={`reaction-picker-${postId}`}
          aria-label="Add reaction"
          onClick={() => setPicking((current) => !current)}
          className={`${chipClass} px-2`}
        >
          <Plus aria-hidden="true" className="size-3.5" />
        </button>
      )}
      {picking && (
        <div id={`reaction-picker-${postId}`} className="flex flex-wrap items-center gap-1">
          {available.map(({ emoji, label }) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Add ${label} reaction`}
              onClick={() => {
                onToggle(emoji)
                setPicking(false)
              }}
              className="inline-flex size-7 items-center justify-center rounded-full text-base outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true">{emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

### `discussion-text.tsx`

Current file: `src/components/features/classrooms/discussion-text.tsx`

```tsx
import type { ReactNode } from "react"

const urlPattern = /(https?:\/\/[^\s<>"']+)/g
const trailingPunctuation = /[.,;:!?)\]]+$/

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function renderLine(line: string): ReactNode[] {
  return line.split(urlPattern).map((part, index) => {
    if (index % 2 === 0) return part
    const trailing = part.match(trailingPunctuation)?.[0] ?? ""
    const text = trailing ? part.slice(0, -trailing.length) : part
    const href = safeHttpUrl(text)
    if (!href) return part
    return (
      <span key={index}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all rounded-sm underline underline-offset-2 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {text}
        </a>
        {trailing}
      </span>
    )
  })
}

export function DiscussionText({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)
  return (
    <div className={`space-y-2 break-words ${className}`}>
      {paragraphs.map((block, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {renderLine(block)}
        </p>
      ))}
    </div>
  )
}
```

### `quiz-answers.ts`

Current file: `src/components/features/classrooms/quiz-answers.ts`

```ts
export function isAnswered(answer: string | undefined) {
  return Boolean(answer?.trim())
}
```

### `quiz-countdown.tsx`

Current file: `src/components/features/classrooms/quiz-countdown.tsx`

```tsx
import { AlarmClock, Clock, Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActivityTiming } from "./classroom-types"
import {
  formatDateTime,
  formatDuration,
  formatRemaining,
  getTimerAnnouncement,
  getTimerUrgency,
  type QuizTimingState,
  type TimerUrgency,
} from "./quiz-timing"

const urgencyStyles: Record<TimerUrgency, string> = {
  normal: "border-border bg-card",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  critical: "border-rose-300 bg-rose-50 text-rose-950",
  over: "border-rose-400 bg-rose-100 text-rose-950",
}

const urgencyLabels: Record<TimerUrgency, string> = {
  normal: "",
  warning: "Running low",
  critical: "Almost out of time",
  over: "Time is up",
}

export function QuizCountdown({
  timing,
  state,
  onStart,
}: {
  timing: ActivityTiming
  state: QuizTimingState
  onStart: () => void
}) {
  const { phase, remainingMs } = state
  const urgency = phase === "running" || phase === "expired" ? getTimerUrgency(remainingMs) : "normal"
  const totalMs = timing.durationMinutes * 60_000
  const percent = phase === "running" ? Math.min(100, Math.max(0, (remainingMs / totalMs) * 100)) : phase === "expired" ? 0 : 100

  return (
    <section aria-label="Quiz timer" className={`rounded-2xl border p-4 sm:p-5 ${urgencyStyles[urgency]}`}>
      <p className="sr-only" role="status" aria-live="polite">{getTimerAnnouncement(urgency)}</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {phase === "closed" || phase === "not-open" ? <Lock className="size-5" /> : <AlarmClock className="size-5" />}
          </span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {phase === "running" || phase === "expired" ? "Time remaining" : "Time allowed"}
            </p>
            {phase === "running" || phase === "expired" ? (
              <p role="timer" aria-live="off" aria-label={`Time remaining ${formatRemaining(remainingMs)}`} className="text-3xl font-semibold tabular-nums tracking-tight">
                {formatRemaining(remainingMs)}
              </p>
            ) : (
              <p className="text-xl font-semibold">{formatDuration(timing.durationMinutes)}</p>
            )}
          </div>
        </div>
        {urgencyLabels[urgency] && (
          <span className="rounded-full bg-background/70 px-3 py-1 text-xs font-semibold">{urgencyLabels[urgency]}</span>
        )}
        {phase === "ready" && (
          <Button type="button" onClick={onStart}><Play aria-hidden="true" /> Start quiz</Button>
        )}
      </div>

      {(phase === "running" || phase === "expired") && (
        <div
          role="progressbar"
          aria-label="Time left"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/70"
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear motion-reduce:transition-none" style={{ width: `${percent}%` }} />
        </div>
      )}

      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        {phase === "ready" && <li className="flex items-center gap-1.5"><Clock aria-hidden="true" className="size-3.5" /> The timer starts when you press Start and cannot be paused.</li>}
        {phase === "not-open" && <li>Opens {formatDateTime(timing.opensAt)}.</li>}
        {phase === "closed" && <li>This quiz closed {formatDateTime(timing.closesAt)}.</li>}
        {timing.opensAt && phase !== "not-open" && <li>Opens {formatDateTime(timing.opensAt)}</li>}
        {timing.closesAt && phase !== "closed" && <li>Closes {formatDateTime(timing.closesAt)}</li>}
        <li>{timing.autoSubmitOnTimeUp ? "Your answers are submitted automatically when time is up." : "When time is up, answers lock and you submit what you have."}</li>
        <li>Preview only: the timer is enforced in this browser session, not by a server.</li>
      </ul>
    </section>
  )
}
```

### `quiz-leaderboard.tsx`

Current file: `src/components/features/classrooms/quiz-leaderboard.tsx`

```tsx
import { Medal, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { LeaderboardEntry } from "./quiz-timing"
import { PersonAvatar } from "./classroom-ui"

const podium = [
  { label: "1st place", row: "bg-gradient-to-r from-amber-100 via-amber-50 to-transparent", icon: "text-amber-500" },
  { label: "2nd place", row: "bg-gradient-to-r from-slate-200 via-slate-100 to-transparent", icon: "text-slate-400" },
  { label: "3rd place", row: "bg-gradient-to-r from-orange-100 via-orange-50 to-transparent", icon: "text-orange-500" },
]

function ordinal(rank: number) {
  return rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}th`
}

export function QuizLeaderboard({
  enabled,
  entries,
  currentLearnerId,
}: {
  enabled: boolean
  entries: LeaderboardEntry[]
  currentLearnerId: string
}) {
  if (!enabled) {
    return (
      <Card className="border-dashed">
        <CardContent className="items-center gap-2 py-10 text-center">
          <Trophy aria-hidden="true" className="size-8 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">Leaderboard not enabled</h3>
          <p className="max-w-sm text-sm text-muted-foreground">Your educator has not turned on the leaderboard for this quiz. Your own result is still private to you.</p>
        </CardContent>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="items-center gap-2 py-10 text-center">
          <Trophy aria-hidden="true" className="size-8 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">No ranked results yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">Rankings appear after your educator returns scored results.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ol aria-label="Quiz leaderboard" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {entries.map((entry) => {
        const mine = entry.learnerId === currentLearnerId
        const tier = entry.rank <= 3 ? podium[entry.rank - 1] : null
        return (
          <li key={entry.learnerId} className={`flex items-center gap-3 px-4 py-3 ${tier?.row ?? ""}`}>
            <span className="flex w-7 shrink-0 items-center justify-center text-sm font-semibold text-muted-foreground">
              {tier ? <Medal aria-hidden="true" className={`size-5 ${tier.icon}`} /> : entry.rank}
              <span className="sr-only">{tier?.label ?? `${ordinal(entry.rank)} place`}</span>
            </span>
            <PersonAvatar name={entry.displayName} />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
              {mine ? "You" : entry.displayName}
            </p>
            <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold tabular-nums">{entry.score} pts</span>
          </li>
        )
      })}
    </ol>
  )
}
```

### `quiz-questions.tsx`

Current file: `src/components/features/classrooms/quiz-questions.tsx`

```tsx
import { Textarea } from "@/components/ui/textarea"
import type { ActivityQuestion } from "./classroom-types"
import { isAnswered } from "./quiz-answers"

export function QuizQuestions({
  questions,
  answers,
  disabled = false,
  onAnswer,
}: {
  questions: ActivityQuestion[]
  answers: Record<string, string>
  disabled?: boolean
  onAnswer: (questionId: string, value: string) => void
}) {
  return (
    <>
      {questions.map((question, index) => (
        <fieldset id={`quiz-question-${question.id}`} key={question.id} disabled={disabled} className="grid scroll-mt-24 gap-3 rounded-xl border border-border bg-card p-4 disabled:opacity-70">
          <legend className="px-1 text-sm font-semibold text-foreground">Question {index + 1} · {question.type}</legend>
          <p className="text-sm leading-6 text-foreground/80">{question.prompt}</p>
          {question.type === "Multiple choice" ? (
            <select
              aria-label={`Answer question ${index + 1}`}
              value={answers[question.id] ?? ""}
              onChange={(event) => onAnswer(question.id, event.currentTarget.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Choose an answer</option>
              {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : question.type === "True or false" ? (
            <div className="flex flex-wrap gap-4">
              {["True", "False"].map((answer) => (
                <label key={answer} className="inline-flex items-center gap-2 text-sm text-foreground/80">
                  <input type="radio" name={`answer-${question.id}`} value={answer} checked={answers[question.id] === answer} onChange={() => onAnswer(question.id, answer)} />
                  {answer}
                </label>
              ))}
            </div>
          ) : question.type === "Multiple select" ? (
            <div className="grid gap-2">
              {question.options.map((option) => {
                const selected = (answers[question.id] ?? "").split("\n").includes(option)
                return (
                  <label key={option} className="inline-flex items-center gap-2 text-sm text-foreground/80">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        const current = (answers[question.id] ?? "").split("\n").filter(Boolean)
                        onAnswer(question.id, (event.currentTarget.checked
                          ? [...current, option]
                          : current.filter((item) => item !== option)
                        ).join("\n"))
                      }}
                    />
                    {option}
                  </label>
                )
              })}
            </div>
          ) : (
            <Textarea
              aria-label={`Answer question ${index + 1}`}
              value={answers[question.id] ?? ""}
              onChange={(event) => onAnswer(question.id, event.currentTarget.value)}
              maxLength={4000}
              placeholder="Write your response…"
            />
          )}
        </fieldset>
      ))}
    </>
  )
}

export function QuestionNavigator({ questions, answers }: { questions: ActivityQuestion[]; answers: Record<string, string> }) {
  if (questions.length < 2) return null
  const answeredCount = questions.filter((question) => isAnswered(answers[question.id])).length
  return (
    <nav aria-label="Question navigator" className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">{answeredCount} of {questions.length} answered</span>
      {questions.map((question, index) => {
        const done = isAnswered(answers[question.id])
        return (
          <button
            key={question.id}
            type="button"
            aria-label={`Question ${index + 1}, ${done ? "answered" : "not answered"}`}
            onClick={() => document.getElementById(`quiz-question-${question.id}`)?.scrollIntoView({ block: "center" })}
            className={`inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring ${done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}
          >
            {done ? <span aria-hidden="true">✓</span> : index + 1}
          </button>
        )
      })}
    </nav>
  )
}
```

### `quiz-result-card.tsx`

Current file: `src/components/features/classrooms/quiz-result-card.tsx`

```tsx
import { Award, Clock, Hash, ListChecks } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ClassroomActivity, ClassroomSubmission } from "./classroom-types"
import { PersonAvatar } from "./classroom-ui"
import { formatDuration, type LeaderboardEntry } from "./quiz-timing"

function Tile({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      <dd className="mt-2 text-lg font-semibold tabular-nums text-foreground">{value}</dd>
      <dt className="text-xs text-muted-foreground">{label}</dt>
    </div>
  )
}

export function QuizResultCard({
  activity,
  submission,
  myEntry,
  learnerName,
}: {
  activity: ClassroomActivity
  submission?: ClassroomSubmission
  myEntry?: LeaderboardEntry
  learnerName: string
}) {
  const released = Boolean(submission?.released)
  return (
    <Card>
      <CardContent className="gap-4 p-5">
        <div className="flex flex-col items-center text-center">
          <PersonAvatar name={learnerName} size="lg" />
          <p className="mt-2 text-sm font-semibold text-foreground">{learnerName}</p>
          <p className="text-xs text-muted-foreground">Your result</p>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <Tile icon={ListChecks} label="Status" value={submission ? (released ? "Returned" : "Submitted") : "Not started"} />
          <Tile icon={Award} label="Points" value={released && typeof submission?.score === "number" ? String(submission.score) : "—"} />
          <Tile icon={Hash} label="Ranking" value={myEntry ? String(myEntry.rank) : "—"} />
          <Tile icon={Clock} label="Time limit" value={activity.timing ? formatDuration(activity.timing.durationMinutes) : "None"} />
        </dl>
        {submission && !released && (
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Your educator has not returned results yet.</p>
        )}
        {released && (submission?.evaluation || submission?.feedback) && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950">
            {submission?.evaluation && <p className="font-semibold">{submission.evaluation}</p>}
            {submission?.feedback && <p className="mt-1 whitespace-pre-wrap">{submission.feedback}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### `quiz-timer-settings.tsx`

Current file: `src/components/features/classrooms/quiz-timer-settings.tsx`

```tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TimingFormResult } from "./quiz-timing"

export function QuizTimerSettings({
  required,
  isQuizOrTest,
  errors,
}: {
  required: boolean
  isQuizOrTest: boolean
  errors: TimingFormResult["errors"]
}) {
  const [optionalEnabled, setOptionalEnabled] = useState(false)
  const [duration, setDuration] = useState("30")
  const enabled = required || optionalEnabled
  const minutes = Number(duration)
  const summary = Number.isInteger(minutes) && minutes >= 1 && minutes <= 300
    ? `Students get ${minutes} ${minutes === 1 ? "minute" : "minutes"} once they start.`
    : ""

  return (
    <fieldset className="grid gap-4 rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">Timer and availability</legend>

      {!required && (
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="timer-enabled" checked={optionalEnabled} onChange={(event) => setOptionalEnabled(event.currentTarget.checked)} />
          Add a time limit
        </label>
      )}

      {enabled && (
        <>
          <input type="hidden" name="timer-active" value="1" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="timer-duration">Duration (minutes)</Label>
              <Input
                id="timer-duration"
                name="timer-duration"
                type="number"
                min={1}
                max={300}
                step={1}
                inputMode="numeric"
                required
                value={duration}
                onChange={(event) => setDuration(event.currentTarget.value)}
                aria-invalid={Boolean(errors.duration)}
                aria-describedby={errors.duration ? "timer-duration-error" : "timer-summary"}
              />
              {errors.duration && <p id="timer-duration-error" role="alert" className="text-xs text-rose-700">{errors.duration}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timer-opens">Opens <span className="font-normal text-slate-500">(optional)</span></Label>
              <Input id="timer-opens" name="timer-opens" type="datetime-local" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timer-closes">Closes <span className="font-normal text-slate-500">(optional)</span></Label>
              <Input
                id="timer-closes"
                name="timer-closes"
                type="datetime-local"
                aria-invalid={Boolean(errors.closesAt)}
                aria-describedby={errors.closesAt ? "timer-closes-error" : undefined}
              />
              {errors.closesAt && <p id="timer-closes-error" role="alert" className="text-xs text-rose-700">{errors.closesAt}</p>}
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="timer-auto-submit" defaultChecked />
            Auto-submit when time is up
          </label>
          {summary && <p id="timer-summary" className="text-xs text-slate-500">{summary} If a closing time is set, it ends the attempt early.</p>}
        </>
      )}

      {isQuizOrTest && (
        <label className="grid gap-1 text-sm text-slate-700">
          <span className="inline-flex items-center gap-2">
            <input type="checkbox" name="show-leaderboard" aria-describedby="leaderboard-help" />
            Show leaderboard to students
          </span>
          <span id="leaderboard-help" className="pl-6 text-xs text-slate-500">Off by default. Only returned results with points are ranked, and students see first names with an initial.</span>
        </label>
      )}
      <p className="text-xs text-slate-500">Preview: the timer runs in the student's browser session only. A real service must record the start time and enforce the deadline.</p>
    </fieldset>
  )
}
```

### `quiz-timing-badges.tsx`

Current file: `src/components/features/classrooms/quiz-timing-badges.tsx`

```tsx
import { AlarmClock, CalendarClock, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ClassroomActivity } from "./classroom-types"
import { formatDateTime, formatDuration } from "./quiz-timing"

export function QuizTimingBadges({ activity }: { activity: ClassroomActivity }) {
  const { timing } = activity
  if (!timing) return null
  return (
    <>
      <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
        <AlarmClock aria-hidden="true" className="size-3" /> {formatDuration(timing.durationMinutes)}
      </Badge>
      {timing.closesAt && (
        <Badge variant="outline" className="gap-1">
          <CalendarClock aria-hidden="true" className="size-3" /> Closes {formatDateTime(timing.closesAt)}
        </Badge>
      )}
      {activity.showLeaderboard && (
        <Badge variant="outline" className="gap-1">
          <Trophy aria-hidden="true" className="size-3" /> Leaderboard
        </Badge>
      )}
    </>
  )
}
```

### `quiz-timing.test.ts`

Current file: `src/components/features/classrooms/quiz-timing.test.ts`

```ts
import { describe, expect, it } from "vitest"
import type { ClassroomActivity } from "./classroom-types"
import {
  buildLeaderboard,
  formatRemaining,
  getQuizTimingState,
  getTimerAnnouncement,
  getTimerUrgency,
  parseTimingFields,
  shortLearnerName,
} from "./quiz-timing"

const timing = { durationMinutes: 30, autoSubmitOnTimeUp: true }
const start = Date.parse("2026-10-23T09:00:00")

describe("getQuizTimingState", () => {
  it("is ready before starting and counts down from the start time", () => {
    expect(getQuizTimingState(timing, undefined, start, false).phase).toBe("ready")
    const running = getQuizTimingState(timing, new Date(start).toISOString(), start + 10 * 60_000, false)
    expect(running.phase).toBe("running")
    expect(running.remainingMs).toBe(20 * 60_000)
  })

  it("expires when the duration has elapsed", () => {
    const state = getQuizTimingState(timing, new Date(start).toISOString(), start + 31 * 60_000, false)
    expect(state.phase).toBe("expired")
    expect(state.remainingMs).toBe(0)
  })

  it("caps the deadline at the closing time", () => {
    const closing = { ...timing, closesAt: "2026-10-23T09:10:00" }
    const state = getQuizTimingState(closing, new Date(start).toISOString(), start + 5 * 60_000, false)
    expect(state.remainingMs).toBe(5 * 60_000)
  })

  it("reports not-open and closed windows only before starting", () => {
    const window = { ...timing, opensAt: "2026-10-23T10:00:00", closesAt: "2026-10-23T11:00:00" }
    expect(getQuizTimingState(window, undefined, start, false).phase).toBe("not-open")
    expect(getQuizTimingState(window, undefined, Date.parse("2026-10-23T11:30:00"), false).phase).toBe("closed")
  })

  it("is submitted once a submission exists", () => {
    expect(getQuizTimingState(timing, undefined, start, true).phase).toBe("submitted")
  })
})

describe("timer display helpers", () => {
  it("formats mm:ss and h:mm:ss", () => {
    expect(formatRemaining(65_000)).toBe("01:05")
    expect(formatRemaining(3_661_000)).toBe("1:01:01")
    expect(formatRemaining(-5)).toBe("00:00")
  })

  it("announces only threshold states", () => {
    expect(getTimerAnnouncement(getTimerUrgency(10 * 60_000))).toBe("")
    expect(getTimerAnnouncement(getTimerUrgency(4 * 60_000))).toBe("5 minutes remaining")
    expect(getTimerAnnouncement(getTimerUrgency(30_000))).toBe("1 minute remaining")
    expect(getTimerAnnouncement(getTimerUrgency(0))).toBe("Time is up")
  })
})

describe("parseTimingFields", () => {
  it("rejects invalid durations and reversed windows", () => {
    expect(parseTimingFields({ duration: "0", opensAt: "", closesAt: "", autoSubmit: true }).errors.duration).toBeTruthy()
    expect(parseTimingFields({ duration: "301", opensAt: "", closesAt: "", autoSubmit: true }).errors.duration).toBeTruthy()
    expect(parseTimingFields({ duration: "20", opensAt: "2026-10-23T10:00", closesAt: "2026-10-23T09:00", autoSubmit: true }).errors.closesAt).toBeTruthy()
  })

  it("accepts valid timing", () => {
    const result = parseTimingFields({ duration: "45", opensAt: "", closesAt: "", autoSubmit: false })
    expect(result.timing).toEqual({ durationMinutes: 45, opensAt: undefined, closesAt: undefined, autoSubmitOnTimeUp: false })
  })
})

describe("buildLeaderboard", () => {
  const base: Omit<ClassroomActivity, "submissions"> = {
    id: "a", title: "t", type: "Quiz", instructions: "", dueDate: "", scoringNote: "",
    questions: [], responseType: "Quiz", status: "Published",
  }
  const submission = (id: string, name: string, score: number | undefined, released: boolean) => ({
    id, learnerId: id, learnerName: name, response: "", submittedAt: "", status: "Returned" as const, score, released,
  })

  it("is empty unless the educator enabled it", () => {
    const activity: ClassroomActivity = { ...base, submissions: [submission("1", "Ana Cruz", 5, true)] }
    expect(buildLeaderboard(activity)).toEqual([])
  })

  it("ranks released scored results with ties and first-name display", () => {
    const activity: ClassroomActivity = {
      ...base,
      showLeaderboard: true,
      submissions: [
        submission("1", "Ana Cruz", 8, true),
        submission("2", "Ben Lee", 9, true),
        submission("3", "Cy Diaz", 8, true),
        submission("4", "Dee Fox", 10, false),
        submission("5", "Eli Ray", undefined, true),
      ],
    }
    const board = buildLeaderboard(activity)
    expect(board.map((entry) => [entry.displayName, entry.rank])).toEqual([["Ben L.", 1], ["Ana C.", 2], ["Cy D.", 2]])
  })

  it("shortens names", () => {
    expect(shortLearnerName("You · demo learner")).toBe("You")
    expect(shortLearnerName("Jordan Rivera")).toBe("Jordan R.")
  })
})
```

### `quiz-timing.ts`

Current file: `src/components/features/classrooms/quiz-timing.ts`

```ts
import type { ActivityTiming, ClassroomActivity, ClassroomSubmission } from "./classroom-types"

export type QuizPhase = "not-open" | "closed" | "ready" | "running" | "expired" | "submitted"

export type QuizTimingState = {
  phase: QuizPhase
  remainingMs: number
  deadlineMs: number | null
}

function parseTime(value?: string) {
  if (!value) return null
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : time
}

export function getQuizTimingState(
  timing: ActivityTiming,
  startedAt: string | undefined,
  nowMs: number,
  submitted: boolean,
): QuizTimingState {
  const opensAt = parseTime(timing.opensAt)
  const closesAt = parseTime(timing.closesAt)
  const startedMs = parseTime(startedAt)

  if (submitted) return { phase: "submitted", remainingMs: 0, deadlineMs: null }

  if (startedMs === null) {
    if (opensAt !== null && nowMs < opensAt) return { phase: "not-open", remainingMs: 0, deadlineMs: null }
    if (closesAt !== null && nowMs >= closesAt) return { phase: "closed", remainingMs: 0, deadlineMs: null }
    return { phase: "ready", remainingMs: timing.durationMinutes * 60_000, deadlineMs: null }
  }

  const byDuration = startedMs + timing.durationMinutes * 60_000
  const deadlineMs = closesAt !== null ? Math.min(byDuration, closesAt) : byDuration
  const remainingMs = Math.max(0, deadlineMs - nowMs)
  return { phase: remainingMs > 0 ? "running" : "expired", remainingMs, deadlineMs }
}

export function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, "0")
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

export type TimerUrgency = "normal" | "warning" | "critical" | "over"

export function getTimerUrgency(remainingMs: number): TimerUrgency {
  if (remainingMs <= 0) return "over"
  if (remainingMs <= 60_000) return "critical"
  if (remainingMs <= 300_000) return "warning"
  return "normal"
}

export function getTimerAnnouncement(urgency: TimerUrgency) {
  if (urgency === "over") return "Time is up"
  if (urgency === "critical") return "1 minute remaining"
  if (urgency === "warning") return "5 minutes remaining"
  return ""
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export function formatDateTime(value?: string) {
  const time = parseTime(value)
  if (time === null) return ""
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(time)
}

export type TimingFormResult = {
  timing?: ActivityTiming
  errors: Partial<Record<"duration" | "opensAt" | "closesAt", string>>
}

export function parseTimingFields(values: {
  duration: string
  opensAt: string
  closesAt: string
  autoSubmit: boolean
}): TimingFormResult {
  const errors: TimingFormResult["errors"] = {}
  const duration = Number(values.duration)
  if (!values.duration.trim() || !Number.isInteger(duration) || duration < 1 || duration > 300) {
    errors.duration = "Enter a whole number of minutes from 1 to 300."
  }
  const opens = parseTime(values.opensAt || undefined)
  const closes = parseTime(values.closesAt || undefined)
  if (opens !== null && closes !== null && closes <= opens) {
    errors.closesAt = "Closing time must be after the opening time."
  }
  if (Object.keys(errors).length) return { errors }
  return {
    errors,
    timing: {
      durationMinutes: duration,
      opensAt: values.opensAt || undefined,
      closesAt: values.closesAt || undefined,
      autoSubmitOnTimeUp: values.autoSubmit,
    },
  }
}

export type LeaderboardEntry = {
  learnerId: string
  displayName: string
  score: number
  rank: number
}

export function shortLearnerName(name: string) {
  const parts = name.replace(/·.*$/, "").trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return parts[0] ?? "Learner"
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export function buildLeaderboard(activity: ClassroomActivity): LeaderboardEntry[] {
  if (!activity.showLeaderboard) return []
  const scored = activity.submissions
    .filter((submission: ClassroomSubmission) => submission.released && typeof submission.score === "number")
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  let previous: number | null = null
  let rank = 0
  return scored.map((submission, index) => {
    if (submission.score !== previous) rank = index + 1
    previous = submission.score ?? null
    return {
      learnerId: submission.learnerId,
      displayName: shortLearnerName(submission.learnerName),
      score: submission.score ?? 0,
      rank,
    }
  })
}

export function isTimedActivity(activity: ClassroomActivity) {
  return Boolean(activity.timing)
}

export function isQuizLike(activity: ClassroomActivity) {
  return activity.type === "Quiz" || activity.type === "Test"
}
```

### `quiz-workspace.tsx`

Current file: `src/components/features/classrooms/quiz-workspace.tsx`

```tsx
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { Maximize2, Minimize2, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, ClassroomActivity } from "./classroom-types"
import { QuizCountdown } from "./quiz-countdown"
import { QuizLeaderboard } from "./quiz-leaderboard"
import { isAnswered } from "./quiz-answers"
import { QuestionNavigator, QuizQuestions } from "./quiz-questions"
import { QuizResultCard } from "./quiz-result-card"
import { buildLeaderboard, formatDuration, getQuizTimingState, type QuizPhase } from "./quiz-timing"
import { useNow } from "./use-now"

const LEARNER_LABEL = "You"

const phaseMessages: Partial<Record<QuizPhase, string>> = {
  ready: "Press Start quiz when you are ready. The questions appear once the timer begins.",
  "not-open": "This quiz is not open yet.",
  closed: "This quiz is closed and can no longer be started.",
  submitted: "You have submitted this quiz. Retakes are not available.",
}

export function QuizWorkspace({ classroom, activity }: { classroom: Classroom; activity: ClassroomActivity }) {
  const { submitActivity, startActivityAttempt, currentLearnerId } = useClassroomPrototype()
  const timing = activity.timing
  const submission = activity.submissions.find((item) => item.learnerId === currentLearnerId)
  const attempt = activity.attempts?.find((item) => item.learnerId === currentLearnerId)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [status, setStatus] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [tab, setTab] = useState("quiz")
  const [autoSubmitted, setAutoSubmitted] = useState(false)
  const answersRef = useRef<Record<string, string>>({})
  const autoSubmittedRef = useRef(false)

  const timedAndOpen = Boolean(timing) && !(timing && submission)
  const now = useNow(timedAndOpen)
  const timingState = timing ? getQuizTimingState(timing, attempt?.startedAt, now, Boolean(submission)) : null
  const phase: QuizPhase = timingState?.phase ?? "running"
  const questionsVisible = phase === "running" || phase === "expired"
  const locked = phase === "expired"
  const leaderboard = useMemo(() => buildLeaderboard(activity), [activity])
  const myEntry = leaderboard.find((entry) => entry.learnerId === currentLearnerId)
  const unanswered = activity.questions.filter((question) => !isAnswered(answers[question.id])).length
  const autoSubmitOnTimeUp = Boolean(timing?.autoSubmitOnTimeUp)

  const sendSubmission = (message: string) => {
    submitActivity(classroom.id, activity.id, JSON.stringify(answers))
    setConfirming(false)
    setStatus(message)
  }

  useEffect(() => {
    if (phase !== "expired" || !autoSubmitOnTimeUp || autoSubmittedRef.current) return
    autoSubmittedRef.current = true
    submitActivity(classroom.id, activity.id, JSON.stringify(answersRef.current))
    setAutoSubmitted(true)
  }, [phase, autoSubmitOnTimeUp, submitActivity, classroom.id, activity.id])

  useEffect(() => {
    if (phase !== "running") return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [phase])

  const setAnswer = (questionId: string, value: string) => {
    answersRef.current = { ...answersRef.current, [questionId]: value }
    setAnswers(answersRef.current)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!Object.values(answers).some(isAnswered) && phase !== "expired") {
      setStatus("Answer at least one question before submitting.")
      return
    }
    if (!confirming && unanswered > 0 && phase === "running") {
      setConfirming(true)
      return
    }
    sendSubmission("Quiz submitted in this preview session only. It was not uploaded or saved.")
  }

  return (
    <div className="space-y-5">
      {!focusMode && (
        <section
          aria-labelledby="quiz-hero-title"
          className="relative isolate overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-primary/10 via-background to-background px-5 py-8 text-center sm:py-10"
        >
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 flex size-40 -translate-x-1/2 items-center justify-center rounded-full bg-primary/10 text-primary/40">
            <Trophy className="size-20" />
          </span>
          <h2 id="quiz-hero-title" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{activity.title}</h2>
          <p className="mx-auto mt-2 max-w-xl whitespace-pre-wrap text-sm text-muted-foreground">{activity.instructions}</p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground">
            {timing ? `Time allowed: ${formatDuration(timing.durationMinutes)} · ` : ""}
            {activity.questions.length} {activity.questions.length === 1 ? "question" : "questions"} · {classroom.name}
            {activity.dueDate ? ` · Due ${activity.dueDate}` : ""}
          </p>
        </section>
      )}

      <Tabs value={tab} onValueChange={(value) => setTab(String(value))} className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="quiz" className="px-4">{activity.type}</TabsTrigger>
            <TabsTrigger value="leaderboard" className="px-4">Leaderboard</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo workspace</Badge>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-pressed={focusMode}
              aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
              onClick={() => setFocusMode((current) => !current)}
            >
              {focusMode ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
            </Button>
          </div>
        </div>

        <TabsContent value="quiz" className="pt-4">
          <div className={focusMode ? "grid gap-5" : "grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]"}>
            <div className="min-w-0 space-y-4">
              {timing && timingState && (
                <div className={phase === "running" ? "sticky top-2 z-10" : ""}>
                  <QuizCountdown timing={timing} state={timingState} onStart={() => startActivityAttempt(classroom.id, activity.id)} />
                </div>
              )}
              {!timing && (
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">No time limit was set for this {activity.type.toLowerCase()}.</p>
              )}

              {phaseMessages[phase] && (
                <p className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">{phaseMessages[phase]}</p>
              )}

              {questionsVisible && activity.questions.length > 0 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <QuestionNavigator questions={activity.questions} answers={answers} />
                  <QuizQuestions questions={activity.questions} answers={answers} disabled={locked} onAnswer={setAnswer} />
                  {locked && !submission && (
                    <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">Time is up. Your answers are locked. Submit what you have.</p>
                  )}
                  {confirming && (
                    <div role="alertdialog" aria-label="Confirm submission" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                      <p>You have {unanswered} unanswered {unanswered === 1 ? "question" : "questions"}. Submit anyway?</p>
                      <div className="mt-3 flex gap-2">
                        <Button type="button" size="sm" onClick={() => sendSubmission("Quiz submitted in this preview session only. It was not uploaded or saved.")}>Submit now</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setConfirming(false)}>Keep working</Button>
                      </div>
                    </div>
                  )}
                  {status && <p role="status" className="text-sm text-amber-800">{status}</p>}
                  {!confirming && <Button type="submit">{submission ? "Update demo response" : "Submit quiz"}</Button>}
                </form>
              )}

              {!questionsVisible && status && <p role="status" className="text-sm text-amber-800">{status}</p>}
              {phase === "submitted" && !status && autoSubmitted && (
                <p role="status" className="text-sm text-amber-800">Time ran out and your answers were submitted automatically in this preview.</p>
              )}
            </div>
            {!focusMode && (
              <aside aria-label="Your result" className="min-w-0">
                <QuizResultCard activity={activity} submission={submission} myEntry={myEntry} learnerName={LEARNER_LABEL} />
              </aside>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="pt-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <QuizLeaderboard enabled={Boolean(activity.showLeaderboard)} entries={leaderboard} currentLearnerId={currentLearnerId ?? ""} />
            <aside aria-label="Your result" className="min-w-0">
              <QuizResultCard activity={activity} submission={submission} myEntry={myEntry} learnerName={LEARNER_LABEL} />
            </aside>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### `use-now.ts`

Current file: `src/components/features/classrooms/use-now.ts`

```ts
import { useEffect, useState } from "react"

export function useNow(active: boolean, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    const tick = () => setNow(Date.now())
    const timer = window.setInterval(tick, intervalMs)
    document.addEventListener("visibilitychange", tick)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [active, intervalMs])

  return now
}
```

<!-- END GENERATED CURRENT SOURCE -->
