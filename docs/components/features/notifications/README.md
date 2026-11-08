# Notifications component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(notifications): add organized notification source copies`

Target: `src/components/features/notifications/`. Proposed destinations; notification examples are not delivered account events. [Folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `notifications-content.ts`, `notifications-examples.ts` |
| `ui/` | `notification-filters.tsx`, `notification-item.tsx`, `notification-list.tsx`, `notifications-inbox.tsx`, `notifications-panel.tsx`, `notifications-state.tsx`, `notifications-trigger.tsx` |
| `view/` | `notifications-view.tsx`, `notifications.test.tsx` |
| Root contract | `notifications.types.ts` |

The header trigger is consumed by the dashboard layout and the role view by page adapters and tutor workspace; update those imports in the same future migration slice. Keep the filter local to each inbox; adding an app-wide context would share unrelated dialog/page state. Preserve unavailable versus sample notification wording and keyboard focus on close.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

### `src/pages/dashboard/notifications/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { RoleNotificationsView } from "@/components/features/notifications/notifications-view"

export default function NotificationsPage() {
  return <RoleNotificationsView />
}
```

<!-- END GENERATED PAGE ADAPTERS -->

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/notifications/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `notification-filters.tsx`

Current file: `src/components/features/notifications/notification-filters.tsx`

```tsx
import { TabsList, TabsTrigger } from "@/components/ui/tabs"

export function NotificationFilters() {
  return (
    <TabsList activateOnFocus aria-label="Filter notifications" className="h-9 gap-0.5 rounded-lg bg-transparent p-0">
      <TabsTrigger value="all" className="min-w-11 rounded-lg px-2.5 text-xs data-active:bg-muted data-active:shadow-none">All</TabsTrigger>
      <TabsTrigger value="unread" className="min-w-16 rounded-lg px-2.5 text-xs data-active:bg-muted data-active:shadow-none">Unread</TabsTrigger>
    </TabsList>
  )
}
```

### `notification-item.tsx`

Current file: `src/components/features/notifications/notification-item.tsx`

```tsx
import { Link } from "react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { notificationAppearance } from "./notifications-content"
import type { NotificationItemViewModel } from "./notifications.types"

export function NotificationItem({ item, onNavigate }: { item: NotificationItemViewModel; onNavigate?: () => void }) {
  const { icon: Icon, avatar, badge } = notificationAppearance[item.category]
  const body = (
    <>
      <span className="relative mt-0.5 shrink-0" aria-hidden="true">
        <Avatar className="size-11"><AvatarFallback className={`text-xs font-semibold ${avatar}`}>{item.initials}</AvatarFallback></Avatar>
        <span className={`absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full ring-2 ring-card ${badge}`}><Icon className="size-3" /></span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-[13px] font-semibold leading-5 text-foreground">{item.actor}</span>
          {item.example ? <span className="text-[11px] text-muted-foreground">Example</span> : item.timestamp && <time dateTime={item.timestamp.dateTime} title={item.timestamp.fullLabel} className="text-[11px] text-muted-foreground">{item.timestamp.relativeLabel}</time>}
        </span>
        <span className="mt-1 block text-[13px] leading-5 text-foreground">{item.action} <strong className="font-semibold">{item.context}</strong></span>
        <span className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.preview}</span>
        {item.destination && <span className="sr-only">{item.destination.label}</span>}
      </span>
      <span className="mt-2 flex size-3 shrink-0 items-center justify-center">
        {item.unread ? <><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" /><span className="sr-only">Unread</span></> : <span className="sr-only">Read</span>}
      </span>
    </>
  )
  const classes = "flex w-full items-start gap-3 px-5 py-5 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:bg-brand-soft/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand motion-reduce:transition-none"

  return <li>{item.destination ? <Link to={item.destination.href} onClick={onNavigate} className={classes}>{body}</Link> : <div className={classes}>{body}</div>}</li>
}
```

### `notification-list.tsx`

Current file: `src/components/features/notifications/notification-list.tsx`

```tsx
import { NotificationItem } from "./notification-item"
import { NotificationsState } from "./notifications-state"
import type { NotificationFilter, NotificationsListState } from "./notifications.types"

export function NotificationList({ state, filter, onNavigate }: { state: NotificationsListState; filter: NotificationFilter; onNavigate?: () => void }) {
  if (state.status !== "ready") return <NotificationsState status={state.status} onRetry={state.status === "error" ? state.onRetry : undefined} />
  const items = filter === "unread" ? state.items.filter((item) => item.unread) : state.items
  if (items.length === 0) return <NotificationsState status="empty" filter={filter} />

  return (
    <ul aria-label="Notifications" className="divide-y divide-border/70">
      {items.map((item) => <NotificationItem key={item.id} item={item} onNavigate={onNavigate} />)}
    </ul>
  )
}
```

### `notifications-content.ts`

Current file: `src/components/features/notifications/notifications-content.ts`

```ts
import { BookOpen, CalendarDays, GraduationCap, MessageCircleMore, Users } from "lucide-react"
import type { NotificationAppearance, NotificationCategory, NotificationsContent, NotificationsRole } from "./notifications.types"

export const notificationsContent: Record<NotificationsRole, NotificationsContent> = {
  students: {
    workspace: "Student workspace",
    description: "A place for your class updates, learning deadlines, released feedback, and peer study updates.",
    categories: ["Classroom updates", "Classwork & deadlines", "Released feedback", "Study spaces"],
  },
  educators: {
    workspace: "Educator workspace",
    description: "Keep classroom updates, submission reviews, assessment deadlines, and teaching conversations in view.",
    categories: ["Your classrooms", "Submission reviews", "Teaching schedule", "Class discussions"],
  },
  tutors: {
    workspace: "Tutor workspace",
    description: "Keep up with individual and group sessions, learner activities, and published feedback in your tutoring context.",
    categories: ["Tutoring sessions", "Activities & evaluations", "Published feedback", "Contextual discussions"],
  },
  esl: {
    workspace: "ESL teaching workspace",
    description: "A place for lesson updates, language activities, schedule changes, and learner conversations.",
    categories: ["Individual & group lessons", "Language activities", "Lesson schedule", "Published feedback"],
  },
}

export const notificationAppearance: Record<NotificationCategory, NotificationAppearance> = {
  classroom: { icon: GraduationCap, avatar: "bg-brand-soft text-brand-soft-foreground", badge: "bg-brand text-brand-foreground" },
  activity: { icon: BookOpen, avatar: "bg-amber-50 text-amber-800", badge: "bg-amber-600 text-white" },
  schedule: { icon: CalendarDays, avatar: "bg-sky-50 text-sky-800", badge: "bg-sky-600 text-white" },
  feedback: { icon: MessageCircleMore, avatar: "bg-rose-50 text-rose-800", badge: "bg-rose-500 text-white" },
  community: { icon: Users, avatar: "bg-teal-50 text-teal-800", badge: "bg-teal-600 text-white" },
}
```

### `notifications-examples.ts`

Current file: `src/components/features/notifications/notifications-examples.ts`

```ts
import type { NotificationItemViewModel, NotificationsRole } from "./notifications.types"

type Example = Omit<NotificationItemViewModel, "id" | "example" | "timestamp">

const examples: Record<NotificationsRole, Example[]> = {
  students: [
    { actor: "Your educator", initials: "ED", action: "Shared classwork in", context: "Your classroom", preview: "An example of how a new learning activity could appear in your notifications.", category: "activity", unread: true, destination: { href: "/students/classwork", label: "Open classwork workspace" } },
    { actor: "Classroom update", initials: "CL", action: "Shared an update for", context: "An educator-led class", preview: "Class announcements stay attached to the classroom they belong to.", category: "classroom", unread: true, destination: { href: "/students/classrooms", label: "Open classrooms workspace" } },
    { actor: "Learning schedule", initials: "SC", action: "A deadline update for", context: "Assigned classwork", preview: "Personal plans remain separate from educator-assigned deadlines.", category: "schedule", unread: true, destination: { href: "/students/schedule", label: "Open schedule workspace" } },
    { actor: "Your educator", initials: "ED", action: "Published feedback for", context: "A learning activity", preview: "Only feedback deliberately released to you belongs in this view.", category: "feedback", unread: false, destination: { href: "/students/classwork", label: "Open classwork workspace" } },
    { actor: "Study community", initials: "SP", action: "Shared a peer update in", context: "A study space", preview: "Student-created peer learning stays distinct from official classroom records.", category: "community", unread: false, destination: { href: "/students/study-spaces", label: "Open study spaces workspace" } },
  ],
  educators: [
    { actor: "Classwork update", initials: "CW", action: "A submission update for", context: "Your classroom activity", preview: "An example of a review notification from a class you are authorized to manage.", category: "activity", unread: true, destination: { href: "/educators/classwork", label: "Open classwork workspace" } },
    { actor: "Classroom update", initials: "CL", action: "Shared an update in", context: "Your teaching classroom", preview: "Classroom updates link back to their own teaching context.", category: "classroom", unread: true, destination: { href: "/educators/classrooms", label: "Open classrooms workspace" } },
    { actor: "Teaching schedule", initials: "SC", action: "A schedule update for", context: "A class session", preview: "Teaching appointments and assessment deadlines retain their source context.", category: "schedule", unread: true, destination: { href: "/educators/schedule", label: "Open schedule workspace" } },
    { actor: "Class discussion", initials: "CD", action: "A discussion update in", context: "Your classroom", preview: "A contextual discussion update can bring you back to the conversation.", category: "community", unread: false, destination: { href: "/educators/communication", label: "Open communication workspace" } },
    { actor: "Assessment update", initials: "AS", action: "A review update for", context: "Classwork & assessments", preview: "Review activity stays separate from final grades and publication decisions.", category: "activity", unread: false, destination: { href: "/educators/classwork", label: "Open classwork workspace" } },
  ],
  tutors: [
    { actor: "Session update", initials: "SE", action: "A schedule update for", context: "Individual tutoring", preview: "An example of a session notification without exposing learner details.", category: "schedule", unread: true, destination: { href: "/tutors/sessions", label: "Open sessions workspace" } },
    { actor: "Activity update", initials: "AC", action: "A learner activity update in", context: "Activities & evaluations", preview: "Tutoring evaluations stay distinct from institutional grades.", category: "activity", unread: true, destination: { href: "/tutors/classwork", label: "Open activities workspace" } },
    { actor: "Group session", initials: "GR", action: "Shared an update for", context: "Group tutoring", preview: "Group sessions keep their own learner and learning context.", category: "community", unread: true, destination: { href: "/tutors/sessions", label: "Open sessions workspace" } },
    { actor: "Published feedback", initials: "FB", action: "A feedback update for", context: "A tutoring activity", preview: "Published learner feedback is separate from private tutor notes.", category: "feedback", unread: false, destination: { href: "/tutors/classwork", label: "Open activities workspace" } },
    { actor: "Learning discussion", initials: "LD", action: "A discussion update in", context: "Your tutoring context", preview: "Discussions stay connected to the learning work they concern.", category: "community", unread: false, destination: { href: "/tutors/communication", label: "Open discussions workspace" } },
  ],
  esl: [
    { actor: "Lesson update", initials: "LE", action: "A schedule update for", context: "An individual lesson", preview: "An example of a dated language lesson update, separate from reusable Lesson Plans.", category: "schedule", unread: true, destination: { href: "/esl/schedule", label: "Open lesson schedule workspace" } },
    { actor: "Language activity", initials: "LA", action: "An activity update in", context: "Language practice", preview: "Language activities keep their lesson and learner context.", category: "activity", unread: true, destination: { href: "/esl/classwork", label: "Open activities workspace" } },
    { actor: "Group lesson", initials: "GR", action: "Shared an update for", context: "Group language learning", preview: "Individual and group lesson updates remain clearly identified.", category: "community", unread: true, destination: { href: "/esl/schedule", label: "Open lesson schedule workspace" } },
    { actor: "Published feedback", initials: "FB", action: "A feedback update for", context: "A language activity", preview: "Published feedback stays separate from private teaching notes and inferred proficiency.", category: "feedback", unread: false, destination: { href: "/esl/classwork", label: "Open activities workspace" } },
    { actor: "Lesson discussion", initials: "LD", action: "A discussion update in", context: "Your lesson context", preview: "Lesson conversations link to their authorized learning context.", category: "community", unread: false, destination: { href: "/esl/communication", label: "Open communication workspace" } },
  ],
}

export function getNotificationExamples(role: NotificationsRole): NotificationItemViewModel[] {
  return examples[role].map((item, index) => ({ ...item, id: `${role}-example-${index}`, example: true }))
}
```

### `notifications-inbox.tsx`

Current file: `src/components/features/notifications/notifications-inbox.tsx`

```tsx
import { useState, type ReactNode } from "react"
import { FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { NotificationFilters } from "./notification-filters"
import { NotificationList } from "./notification-list"
import { notificationsContent } from "./notifications-content"
import { getNotificationExamples } from "./notifications-examples"
import type { NotificationFilter, NotificationsListState, NotificationsRole } from "./notifications.types"

export function NotificationsInbox({ role, title, headerAction, className = "", onNavigate }: {
  role: NotificationsRole
  title?: ReactNode
  headerAction?: ReactNode
  className?: string
  onNavigate?: () => void
}) {
  const [filter, setFilter] = useState<NotificationFilter>("all")
  const [showExamples, setShowExamples] = useState(false)
  const content = notificationsContent[role]
  const state: NotificationsListState = showExamples ? { status: "ready", items: getNotificationExamples(role) } : { status: "unavailable" }

  return (
    <Tabs value={filter} onValueChange={(value) => { if (value === "all" || value === "unread") setFilter(value) }} className={`flex min-h-0 flex-1 flex-col gap-0 ${className}`}>
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-3 border-b border-border/70 px-5 py-4">
        <div className="min-w-0 flex-1">{title ?? <h3 className="text-base font-semibold tracking-tight">Notifications</h3>}</div>
        <div className="order-3 w-full sm:order-none sm:w-auto"><NotificationFilters /></div>
        {headerAction}
      </div>
      <div className="shrink-0 border-b border-border/60 bg-muted/20 px-5 py-3">
        <p className="text-[11px] font-medium text-muted-foreground">{content.workspace}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{content.description}</p>
      </div>
      {showExamples && <p className="shrink-0 border-b border-amber-100 bg-amber-50 px-5 py-2.5 text-[11px] leading-5 text-amber-950" role="status">Example notifications · Fictional content. No items are saved or marked as read.</p>}
      {(["all", "unread"] as const).map((value) => (
        <TabsContent key={value} value={value} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ScrollArea className="min-h-0 flex-1" role="region" aria-label="Notification feed">
            <NotificationList state={state} filter={value} onNavigate={onNavigate} />
            {!showExamples && <div className="flex flex-wrap justify-center gap-2 px-5 pb-7" aria-label="Workspace notification contexts">{content.categories.map((category) => <span key={category} className="rounded-full border border-border/70 px-2.5 py-1 text-[10px] text-muted-foreground">{category}</span>)}</div>}
          </ScrollArea>
        </TabsContent>
      ))}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-muted/15 px-5 py-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"><FlaskConical className="size-3" aria-hidden="true" />{showExamples ? "Example mode" : "Preview the layout"}</span>
        <Button variant="outline" size="sm" aria-pressed={showExamples} onClick={() => setShowExamples((current) => !current)} className="h-9 rounded-lg bg-card px-3 text-xs">{showExamples ? "Hide examples" : "Show examples"}</Button>
      </div>
    </Tabs>
  )
}
```

### `notifications-panel.tsx`

Current file: `src/components/features/notifications/notifications-panel.tsx`

```tsx
import { ArrowRight, X } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { NotificationsInbox } from "./notifications-inbox"
import type { NotificationsRole } from "./notifications.types"

export function NotificationsPanel({ role, onNavigate }: { role: NotificationsRole; onNavigate: () => void }) {
  return (
    <DialogContent showCloseButton={false} className="bottom-4 left-4 right-4 top-4 flex w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-3xl border border-border bg-card p-0 shadow-2xl ring-0 motion-reduce:animate-none sm:bottom-auto sm:left-auto sm:right-6 sm:top-[4.5rem] sm:h-[min(42rem,calc(100dvh-6rem))] sm:w-[26.25rem] sm:max-w-[calc(100%-3rem)]">
      <DialogDescription className="sr-only">Workspace notifications. Notification delivery and read status are not connected. Examples are available for layout review.</DialogDescription>
      <NotificationsInbox role={role} onNavigate={onNavigate} title={<DialogTitle className="text-base font-semibold tracking-tight">Notifications</DialogTitle>} headerAction={<DialogClose render={<Button variant="ghost" size="icon-sm" className="rounded-lg" />} aria-label="Close notifications"><X className="size-4" aria-hidden="true" /></DialogClose>} />
      <Link to={`/${role}/notifications`} onClick={onNavigate} className="flex min-h-14 shrink-0 items-center justify-center gap-2 border-t border-border/70 bg-card px-5 py-3 text-xs font-semibold text-brand outline-none hover:bg-brand-soft/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand">
        View all notifications<ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </DialogContent>
  )
}
```

### `notifications-state.tsx`

Current file: `src/components/features/notifications/notifications-state.tsx`

```tsx
import { BellOff, CheckCheck, CircleAlert, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { NotificationFilter } from "./notifications.types"

export function NotificationsState({ status, filter = "all", onRetry }: {
  status: "unavailable" | "loading" | "error" | "empty"
  filter?: NotificationFilter
  onRetry?: () => void
}) {
  const unreadEmpty = status === "empty" && filter === "unread"
  const Icon = status === "loading" ? LoaderCircle : status === "error" ? CircleAlert : status === "empty" ? CheckCheck : BellOff
  const title = status === "loading" ? "Loading notifications" : status === "error" ? "Notifications could not be loaded" : status === "unavailable" ? "Notification inbox is unavailable" : unreadEmpty ? "No unread notifications" : "No notifications yet"
  const description = status === "loading" ? "Checking for workspace updates." : status === "error" ? "Please try again when the notification service is available." : status === "unavailable" ? "Notification records and read status are not connected. No live account activity is shown." : unreadEmpty ? "There are no unread items in this list." : "Updates will appear here when they are available."

  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-7 py-10 text-center" role={status === "error" ? "alert" : "status"}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Icon className={`size-6 ${status === "loading" ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" /></span>
      <h3 className="mt-5 text-sm font-semibold leading-6">{title}</h3>
      <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">{description}</p>
      {status === "error" && onRetry && <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">Try again</Button>}
    </div>
  )
}
```

### `notifications-trigger.tsx`

Current file: `src/components/features/notifications/notifications-trigger.tsx`

```tsx
import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { NotificationsPanel } from "./notifications-panel"
import type { NotificationsRole } from "./notifications.types"

export function NotificationsTrigger({ role }: { role: NotificationsRole }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="relative size-10 rounded-full text-slate-600 hover:bg-slate-100" />} aria-label="Notifications" title="Notifications">
        <Bell aria-hidden="true" />
      </DialogTrigger>
      <NotificationsPanel role={role} onNavigate={() => setOpen(false)} />
    </Dialog>
  )
}
```

### `notifications-view.tsx`

Current file: `src/components/features/notifications/notifications-view.tsx`

```tsx
import { useLocation } from "react-router"
import { Bell } from "lucide-react"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { notificationsContent } from "./notifications-content"
import { NotificationsInbox } from "./notifications-inbox"
import type { NotificationsRole } from "./notifications.types"

export function NotificationsView({ role }: { role: NotificationsRole }) {
  const content = notificationsContent[role]

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <header className="flex items-start gap-3 px-1">
        <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Bell className="size-5" aria-hidden="true" /></span>
        <div>
          <p className="text-xs text-muted-foreground">{content.workspace}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Notifications</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Your workspace updates, with the learning context that matters.</p>
        </div>
      </header>
      <section aria-label="Notification inbox" className="flex h-[42rem] max-h-[80dvh] min-h-96 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
        <NotificationsInbox key={role} role={role} title={<h3 className="text-base font-semibold tracking-tight">Your updates</h3>} />
      </section>
    </div>
  )
}

export function RoleNotificationsView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname)
  return role ? <NotificationsView role={role} /> : null
}
```

### `notifications.test.tsx`

Current file: `src/components/features/notifications/notifications.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, useLocation } from "react-router"
import { NotificationsTrigger } from "./notifications-trigger"
import { NotificationsView, RoleNotificationsView } from "./notifications-view"
import { NotificationList } from "./notification-list"
import { getNotificationExamples } from "./notifications-examples"
import type { NotificationsRole } from "./notifications.types"

afterEach(cleanup)

const roles: NotificationsRole[] = ["students", "educators", "tutors", "esl"]

function LocationProbe() {
  const { pathname } = useLocation()
  return <output aria-label="Current path">{pathname}</output>
}

function renderTrigger(role: NotificationsRole = "students") {
  return render(<MemoryRouter initialEntries={[`/${role}`]}><NotificationsTrigger role={role} /><LocationProbe /></MemoryRouter>)
}

describe("shared notifications panel", () => {
  it.each(roles)("opens an unavailable %s inbox without navigating or fabricating activity", async (role) => {
    const user = userEvent.setup()
    renderTrigger(role)
    const trigger = screen.getByRole("button", { name: "Notifications" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    await user.click(trigger)

    const dialog = await screen.findByRole("dialog", { name: "Notifications" })
    expect(within(dialog).getByRole("heading", { name: "Notification inbox is unavailable" })).toBeTruthy()
    expect(within(dialog).getByText(/Notification records and read status are not connected/)).toBeTruthy()
    expect(within(dialog).queryByRole("list", { name: "Notifications" })).toBeNull()
    expect(within(dialog).getByRole("link", { name: "View all notifications" }).getAttribute("href")).toBe(`/${role}/notifications`)
    expect(screen.getByLabelText("Current path").textContent).toBe(`/${role}`)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(within(dialog).queryByRole("button", { name: /accept|decline|mark.*read|delete|dismiss/i })).toBeNull()
    await user.click(within(dialog).getByRole("tab", { name: "Unread" }))
    expect(within(dialog).getByRole("heading", { name: "Notification inbox is unavailable" })).toBeTruthy()
    expect(within(dialog).queryByText("No unread notifications")).toBeNull()
  })

  it("closes with Escape and restores focus to the bell", async () => {
    const user = userEvent.setup()
    renderTrigger()
    const trigger = screen.getByRole("button", { name: "Notifications" })
    trigger.focus()
    await user.keyboard("{Enter}")
    const dialog = await screen.findByRole("dialog")
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    for (let index = 0; index < 5; index += 1) {
      await user.tab()
      await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    }
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    expect(screen.getByLabelText("Current path").textContent).toBe("/students")
  })

  it("closes with its labeled close button", async () => {
    const user = userEvent.setup()
    renderTrigger()
    await user.click(screen.getByRole("button", { name: "Notifications" }))
    await user.click(await screen.findByRole("button", { name: "Close notifications" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it.each(roles)("opens the full %s inbox from its footer", async (role) => {
    const user = userEvent.setup()
    renderTrigger(role)
    await user.click(screen.getByRole("button", { name: "Notifications" }))
    await user.click(await screen.findByRole("link", { name: "View all notifications" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByLabelText("Current path").textContent).toBe(`/${role}/notifications`)
  })

  it("filters examples with keyboard tabs and does not mutate read status", async () => {
    const user = userEvent.setup()
    renderTrigger()
    await user.click(screen.getByRole("button", { name: "Notifications" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Show examples" }))
    expect(within(dialog).getByText(/Fictional content/)).toBeTruthy()
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(5)
    within(dialog).getByRole("tab", { name: "All" }).focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(within(dialog).getByRole("tab", { name: "Unread" }).getAttribute("aria-selected")).toBe("true"))
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(3)
    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(within(dialog).getAllByRole("listitem")).toHaveLength(5))
    await user.click(within(dialog).getByRole("button", { name: "Hide examples" }))
    expect(within(dialog).queryByRole("list", { name: "Notifications" })).toBeNull()
  })

  it("closes when opening an example's workspace without claiming an event was read", async () => {
    const user = userEvent.setup()
    renderTrigger("esl")
    await user.click(screen.getByRole("button", { name: "Notifications" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Show examples" }))
    const link = within(dialog).getAllByRole("link", { name: /Open lesson schedule workspace/ })[0]
    await user.click(link)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByLabelText("Current path").textContent).toBe("/esl/schedule")
    expect(getNotificationExamples("esl").filter((item) => item.unread)).toHaveLength(3)
  })
})

describe("role notification pages", () => {
  it.each(roles)("reuses the inbox for the %s route and keeps examples role-scoped", async (role) => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={[`/${role}/notifications`]}><RoleNotificationsView /></MemoryRouter>)
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeTruthy()
    expect(screen.getByRole("region", { name: "Notification inbox" })).toBeTruthy()
    expect(screen.getByRole("region", { name: "Notification feed" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Show examples" }))
    expect(screen.getAllByRole("listitem")).toHaveLength(5)
    expect(screen.getAllByRole("link").every((link) => link.getAttribute("href")?.startsWith(`/${role}/`))).toBe(true)
    expect(screen.queryByRole("button", { name: /accept|decline|mark.*read/i })).toBeNull()
  })

  it("does not carry example mode across workspaces", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MemoryRouter><NotificationsView role="students" /></MemoryRouter>)
    await user.click(screen.getByRole("button", { name: "Show examples" }))
    rerender(<MemoryRouter><NotificationsView role="tutors" /></MemoryRouter>)
    expect(screen.queryByRole("list", { name: "Notifications" })).toBeNull()
    expect(screen.getByRole("heading", { name: "Notification inbox is unavailable" })).toBeTruthy()
  })
})

describe("notification list states", () => {
  it("distinguishes an empty inbox from an unread filter with no matches", () => {
    const items = getNotificationExamples("students").map((item) => ({ ...item, unread: false }))
    const { rerender } = render(<MemoryRouter><NotificationList state={{ status: "ready", items: [] }} filter="all" /></MemoryRouter>)
    expect(screen.getByRole("heading", { name: "No notifications yet" })).toBeTruthy()
    rerender(<MemoryRouter><NotificationList state={{ status: "ready", items }} filter="unread" /></MemoryRouter>)
    expect(screen.getByRole("heading", { name: "No unread notifications" })).toBeTruthy()
  })

  it("renders recoverable errors without raw payloads", () => {
    const retry = vi.fn()
    render(<NotificationList state={{ status: "error", onRetry: retry }} filter="all" />)
    expect(screen.getByRole("alert")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it("renders a supplied timestamp and safe preview text", () => {
    const item = { ...getNotificationExamples("students")[0], example: false, timestamp: { dateTime: "2026-10-30T01:00:00Z", relativeLabel: "1 hour ago", fullLabel: "October 30, 2026" }, preview: "<script>example</script>" }
    render(<MemoryRouter><NotificationList state={{ status: "ready", items: [item] }} filter="all" /></MemoryRouter>)
    expect(screen.getByText("1 hour ago").getAttribute("datetime")).toBe(item.timestamp.dateTime)
    expect(screen.getByText(item.preview)).toBeTruthy()
    expect(document.querySelector("script")).toBeNull()
  })
})
```

### `notifications.types.ts`

Current file: `src/components/features/notifications/notifications.types.ts`

```ts
import type { LucideIcon } from "lucide-react"

export type NotificationsRole = "students" | "educators" | "tutors" | "esl"
export type NotificationFilter = "all" | "unread"
export type NotificationCategory = "classroom" | "activity" | "schedule" | "feedback" | "community"

export type NotificationItemViewModel = {
  id: string
  actor: string
  initials: string
  action: string
  context: string
  preview: string
  category: NotificationCategory
  unread: boolean
  example: boolean
  timestamp?: { dateTime: string; relativeLabel: string; fullLabel: string }
  destination?: { href: string; label: string }
}

export type NotificationsContent = {
  workspace: string
  description: string
  categories: string[]
}

export type NotificationAppearance = {
  icon: LucideIcon
  avatar: string
  badge: string
}

export type NotificationsListState =
  | { status: "unavailable" }
  | { status: "loading" }
  | { status: "error"; onRetry?: () => void }
  | { status: "ready"; items: NotificationItemViewModel[] }
```

<!-- END GENERATED CURRENT SOURCE -->
