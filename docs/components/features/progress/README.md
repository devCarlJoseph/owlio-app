# Progress component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(progress): add organized progress source copies`

Target: `src/components/features/progress/`; `src/components/progress/` is currently only a placeholder and should not receive copies of these screens.

| Proposed destination | Current files |
| --- | --- |
| `ui/` | `classroom-results-section.tsx`, `personal-progress-section.tsx` |
| `view/` | `student-progress-view.tsx`, `student-progress-view.test.tsx` |

Keep browser-local personal progress distinct from official classroom results. No data source or grade should be manufactured by moving a component. Add `contents/` or `context/` only for actual feature-owned content or shared state.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

### `src/pages/dashboard/progress/index.tsx`

**Future-only adapter:** `src/components/features/progress/role-progress-view.tsx` does not exist yet. Move the shared progress placeholder into a feature view first; do not mislabel personal work as official grades.

```tsx
import { RoleProgressView } from "@/components/features/progress/role-progress-view"

export default function ProgressPage() {
  return <RoleProgressView />
}
```

### `src/pages/dashboard/students/progress/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { StudentProgressView } from "@/components/features/progress/student-progress-view"

export default function StudentProgressPage() {
  return <StudentProgressView />
}
```

<!-- END GENERATED PAGE ADAPTERS -->

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/progress/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `classroom-results-section.tsx`

Current file: `src/components/features/progress/classroom-results-section.tsx`

```tsx
import { ArrowUpRight, CalendarCheck, GraduationCap, LockKeyhole, MessageSquareText, NotebookPen } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty"

const recordTypes = [
  { icon: NotebookPen, title: "Released results", description: "School grades and tutoring evaluations, identified by their class and activity." },
  { icon: MessageSquareText, title: "Published feedback", description: "Feedback your educator has deliberately shared with you." },
  { icon: CalendarCheck, title: "Permitted attendance", description: "Attendance records you’re allowed to view, recorded by your educator." },
]

export function ClassroomResultsSection() {
  return (
    <section aria-labelledby="classroom-results-title" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="classroom-results-title" className="text-lg font-semibold">Results shared with you</h2>
        <Badge variant="outline" className="rounded-full py-1 font-normal text-muted-foreground">Unavailable</Badge>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="rounded-2xl border border-border shadow-none ring-0">
          <Empty className="min-h-88 px-5 py-12 sm:py-16">
            <EmptyHeader>
              <EmptyMedia className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-foreground"><GraduationCap aria-hidden="true" className="size-7" /></EmptyMedia>
              <h3 className="text-xl font-semibold tracking-tight">Classroom results aren’t connected yet</h3>
              <EmptyDescription>Grades, evaluations, feedback, and attendance can’t be loaded here yet. This doesn’t tell you whether results have been released in your classes.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button render={<Link to="/students/classrooms" />} variant="outline" className="mt-2 min-h-11 px-5">Open My Classes <ArrowUpRight aria-hidden="true" /></Button></EmptyContent>
          </Empty>
        </Card>
        <aside aria-label="About classroom results" className="space-y-5">
          <Card className="rounded-2xl border border-border shadow-none ring-0">
            <CardHeader><h3 className="font-semibold">A separate place for class records</h3></CardHeader>
            <CardContent className="gap-5">{recordTypes.map(item => <div key={item.title} className="flex items-start gap-3"><item.icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" /><div><h4 className="text-sm font-medium">{item.title}</h4><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p></div></div>)}</CardContent>
          </Card>
          <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground"><LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Only your permitted, released records belong here. Private teaching notes stay private.</p>
        </aside>
      </div>
    </section>
  )
}
```

### `personal-progress-section.tsx`

Current file: `src/components/features/progress/personal-progress-section.tsx`

```tsx
import { useEffect, useState } from "react"
import { Link } from "react-router"
import { ArrowRight, CheckCheck, ChevronRight, Circle, CircleCheck, CircleHelp, Clock, HardDrive, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { formatTaskDueDate, getTaskStatus, loadPersonalTasks, sortTasks, tasksStorageKey, taskStatusOptions, type TaskRecord, type TaskStatus } from "@/components/features/personal-workspace/tasks/task-records"

const statusIcons = { todo: Circle, "in-progress": Clock, done: CircleCheck }

function TaskEvidence({ task }: { task: TaskRecord }) {
  const Icon = statusIcons[task.status]
  return (
    <li className="min-w-0">
      <Dialog>
        <DialogTrigger render={<Button variant="ghost" />} aria-label={`View task ${task.title}`} className="h-auto min-h-20 w-full justify-start gap-3 rounded-none px-5 py-4 text-left whitespace-normal sm:px-6">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${task.status === "done" ? "bg-brand-soft text-brand-soft-foreground" : "bg-muted text-muted-foreground"}`}><Icon aria-hidden="true" className="size-4" /></span>
          <span className="min-w-0 flex-1"><span className="block font-medium wrap-anywhere">{task.title}</span><span className="mt-1 block text-xs font-normal text-muted-foreground wrap-anywhere">{task.subject || "No subject"} <span aria-hidden="true">·</span> {getTaskStatus(task.status).label}</span></span>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </DialogTrigger>
        <DialogContent className="max-h-[85dvh] overflow-y-auto motion-reduce:animate-none" overlayClassName="motion-reduce:animate-none">
          <DialogHeader>
            <p className="text-xs font-medium text-brand">Personal task · This browser</p>
            <DialogTitle className="pr-6 text-lg leading-7 wrap-anywhere">{task.title}</DialogTitle>
            <DialogDescription>Current saved task details. Changes to this task belong in My tasks.</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Status</dt><dd>{getTaskStatus(task.status).label}</dd>
            <dt className="text-muted-foreground">Subject</dt><dd className="wrap-anywhere">{task.subject || "No subject"}</dd>
            <dt className="text-muted-foreground">Due date</dt><dd>{formatTaskDueDate(task)}</dd>
          </dl>
          {task.notes && <div><h3 className="mb-2 text-sm font-medium">Your notes</h3><p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground wrap-anywhere">{task.notes}</p></div>}
          <Button render={<Link to="/students/tasks" />} variant="outline">Manage in My tasks <ArrowRight aria-hidden="true" /></Button>
        </DialogContent>
      </Dialog>
    </li>
  )
}

export function PersonalProgressSection() {
  const [collection, setCollection] = useState(loadPersonalTasks)
  const [status, setStatus] = useState<TaskStatus | "all">("all")

  useEffect(() => {
    const refresh = () => setCollection(loadPersonalTasks())
    const onStorage = (event: StorageEvent) => {
      if (event.key === tasksStorageKey || event.key === null) refresh()
    }
    window.addEventListener("focus", refresh)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("focus", refresh)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const tasks = collection.tasks
  const completed = tasks.filter(task => task.status === "done").length
  const visible = sortTasks(tasks.filter(task => status === "all" || task.status === status))

  return (
    <section aria-labelledby="personal-progress-title" className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="personal-progress-title" className="text-lg font-semibold">Your personal progress</h2>
        <Badge variant="outline" className="gap-1.5 rounded-full py-1 font-normal text-muted-foreground"><HardDrive aria-hidden="true" className="size-3" />This browser only</Badge>
      </div>

      {collection.error ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30">
          <CircleHelp aria-hidden="true" />
          <AlertTitle>We couldn’t read your saved tasks</AlertTitle>
          <AlertDescription><p>Your progress is unavailable for now. Your saved data hasn’t been changed.</p><Button variant="outline" onClick={() => setCollection(loadPersonalTasks())} className="mt-3 text-foreground"><RefreshCw aria-hidden="true" />Retry loading tasks</Button></AlertDescription>
        </Alert>
      ) : tasks.length === 0 ? (
        <Card className="rounded-2xl border border-border shadow-none ring-0">
          <Empty className="min-h-80 px-5 py-12 sm:py-16">
            <EmptyHeader>
              <EmptyMedia className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-foreground"><CheckCheck aria-hidden="true" className="size-7" /></EmptyMedia>
              <h3 className="text-xl font-semibold tracking-tight">Small steps, visible progress</h3>
              <EmptyDescription>Save your first personal task to start building a picture of your learning. No class needed.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button render={<Link to="/students/tasks" />} className="mt-2 min-h-11 bg-brand px-5 text-brand-foreground hover:bg-brand/90">Go to personal tasks <ArrowRight aria-hidden="true" /></Button></EmptyContent>
          </Empty>
        </Card>
      ) : (
        <>
          <Card className="gap-5 rounded-2xl border border-border shadow-none ring-0">
            <CardHeader className="gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">Personal task completion</h3>
              <p className="flex flex-wrap items-baseline gap-x-2"><span className="text-4xl font-semibold tracking-tight tabular-nums">{completed}<span className="ml-2 text-2xl font-normal text-muted-foreground">/ {tasks.length}</span></span><span className="text-sm text-muted-foreground">tasks completed</span></p>
            </CardHeader>
            <CardContent className="gap-4">
              <Progress aria-label="Personal task completion" value={completed / tasks.length * 100} className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-brand [&_[data-slot=progress-indicator]]:motion-reduce:transition-none" />
              <dl className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                {taskStatusOptions.map(option => {
                  const Icon = statusIcons[option.value]
                  return <div key={option.value}><dt className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><Icon aria-hidden="true" className="size-3.5" />{option.label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{tasks.filter(task => task.status === option.value).length}</dd></div>
                })}
              </dl>
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-2xl border border-border py-0 shadow-none ring-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
              <h3 className="font-semibold">Your saved tasks</h3>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">Show
                <select value={status} onChange={event => setStatus(event.target.value as TaskStatus | "all")} className="min-h-10 max-w-40 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="all">All statuses</option>
                  {taskStatusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <p role="status" className="px-5 pt-4 text-xs text-muted-foreground sm:px-6">{visible.length} of {tasks.length} personal tasks shown</p>
            {visible.length ? <ul className="divide-y divide-border py-2">{visible.map(task => <TaskEvidence key={task.id} task={task} />)}</ul> : (
              <Empty className="px-5 py-10"><h4 className="font-medium">No tasks with this status</h4><p className="text-sm text-muted-foreground">Choose another status to see your saved work.</p><Button variant="outline" onClick={() => setStatus("all")}>Show all tasks</Button></Empty>
            )}
          </Card>
        </>
      )}

      <p className="px-1 text-xs leading-5 text-muted-foreground">Based on personal tasks saved in this browser. Examples are excluded. This is a current snapshot, not a history of when you studied. Your tasks aren’t synced to an account.</p>
    </section>
  )
}
```

### `student-progress-view.test.tsx`

Current file: `src/components/features/progress/student-progress-view.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, useLocation } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { sampleTasks, tasksStorageKey, type TaskRecord } from "@/components/features/personal-workspace/tasks/task-records"
import { StudentProgressView } from "./student-progress-view"

const personal: TaskRecord = { id: "personal-review", title: "Review my vocabulary", subject: "English", notes: "Focus on verbs", status: "done", priority: "medium", dueDate: "", createdAt: "2026-10-30T09:00:00.000Z" }

function Location() {
  return <output aria-label="Current URL">{useLocation().pathname}</output>
}

function show(tasks?: TaskRecord[]) {
  if (tasks) localStorage.setItem(tasksStorageKey, JSON.stringify(tasks))
  return render(<MemoryRouter initialEntries={["/students/progress"]}><StudentProgressView /><Location /></MemoryRouter>)
}

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe("student Progress & Grades", () => {
  it("keeps a first visit empty and never writes example data", () => {
    const writes = vi.spyOn(Storage.prototype, "setItem")
    show()
    expect(screen.getByRole("heading", { name: "Small steps, visible progress" })).toBeTruthy()
    expect(screen.queryByRole("progressbar")).toBeNull()
    expect(screen.getByRole("link", { name: /Go to personal tasks/ }).getAttribute("href")).toBe("/students/tasks")
    expect(screen.getByRole("link", { name: /Open My Learning/ }).getAttribute("href")).toBe("/students/subjects")
    expect(writes).not.toHaveBeenCalled()
  })

  it("counts only saved personal tasks, retaining edited legacy examples", () => {
    show([...sampleTasks, personal, { ...sampleTasks[0], title: "My revised task", status: "todo" }])
    expect(screen.getByRole("progressbar", { name: "Personal task completion" }).getAttribute("aria-valuenow")).toBe("50")
    expect(screen.getByText("2 of 2 personal tasks shown")).toBeTruthy()
    expect(screen.queryByRole("button", { name: `View task ${sampleTasks[0].title}` })).toBeNull()
    expect(screen.getByRole("button", { name: "View task My revised task" })).toBeTruthy()
  })

  it("opens read-only source details and restores focus without mutating tasks", async () => {
    const user = userEvent.setup()
    show([personal])
    const saved = localStorage.getItem(tasksStorageKey)
    const writes = vi.spyOn(Storage.prototype, "setItem")
    const trigger = screen.getByRole("button", { name: `View task ${personal.title}` })
    await user.click(trigger)
    const dialog = within(screen.getByRole("dialog"))
    expect(dialog.getByText(personal.notes)).toBeTruthy()
    expect(dialog.getByText("Done")).toBeTruthy()
    expect(dialog.queryByRole("textbox")).toBeNull()
    expect(dialog.getByRole("link", { name: /Manage in My tasks/ }).getAttribute("href")).toBe("/students/tasks")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(document.activeElement).toBe(trigger)
    expect(localStorage.getItem(tasksStorageKey)).toBe(saved)
    expect(writes).not.toHaveBeenCalled()
  })

  it("filters the list without changing completion totals and resets an empty filter", async () => {
    const user = userEvent.setup()
    show([personal])
    await user.selectOptions(screen.getByRole("combobox", { name: "Show" }), "todo")
    expect(screen.getByRole("heading", { name: "No tasks with this status" })).toBeTruthy()
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100")
    await user.click(screen.getByRole("button", { name: "Show all tasks" }))
    expect(screen.getByRole("button", { name: `View task ${personal.title}` })).toBeTruthy()
  })

  it("does not treat unreadable data as empty or overwrite it, and supports retry", async () => {
    const user = userEvent.setup()
    localStorage.setItem(tasksStorageKey, "broken-json")
    const writes = vi.spyOn(Storage.prototype, "setItem")
    show()
    expect(screen.getByRole("alert").textContent).toContain("couldn’t read your saved tasks")
    expect(screen.queryByRole("progressbar")).toBeNull()
    expect(screen.queryByRole("heading", { name: "Small steps, visible progress" })).toBeNull()
    expect(localStorage.getItem(tasksStorageKey)).toBe("broken-json")
    expect(writes).not.toHaveBeenCalled()
    localStorage.setItem(tasksStorageKey, JSON.stringify([personal]))
    await user.click(screen.getByRole("button", { name: /Retry loading tasks/ }))
    expect(screen.queryByRole("alert")).toBeNull()
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100")
  })

  it("refreshes the snapshot on another tab’s saved-task changes or cleared storage", () => {
    show([personal])
    localStorage.setItem(tasksStorageKey, JSON.stringify([{ ...personal, status: "todo" }]))
    fireEvent(window, new StorageEvent("storage", { key: tasksStorageKey }))
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0")
    localStorage.clear()
    fireEvent(window, new StorageEvent("storage", { key: null }))
    expect(screen.getByRole("heading", { name: "Small steps, visible progress" })).toBeTruthy()
  })

  it("switches scopes by keyboard on the same URL and shows unavailable official records", async () => {
    const user = userEvent.setup()
    show([personal])
    screen.getByRole("tab", { name: "Personal learning" }).focus()
    await user.keyboard("{ArrowRight}{Enter}")
    await waitFor(() => expect(screen.getByRole("tab", { name: "Classroom results" }).getAttribute("aria-selected")).toBe("true"))
    expect(screen.getByRole("heading", { name: "Classroom results aren’t connected yet" })).toBeTruthy()
    expect(screen.queryByRole("progressbar")).toBeNull()
    expect(screen.getByRole("link", { name: /Open My Classes/ }).getAttribute("href")).toBe("/students/classrooms")
    expect(screen.getByLabelText("Current URL").textContent).toBe("/students/progress")
    await user.click(screen.getByRole("tab", { name: "Personal learning" }))
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100")
  })
})
```

### `student-progress-view.tsx`

Current file: `src/components/features/progress/student-progress-view.tsx`

```tsx
import { ArrowUpRight, BookOpen, ChartNoAxesCombined, ClipboardList, GraduationCap } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClassroomResultsSection } from "./classroom-results-section"
import { PersonalProgressSection } from "./personal-progress-section"

export function StudentProgressView() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 text-foreground">
      <header className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          <ChartNoAxesCombined aria-hidden="true" className="size-4 text-brand" /> Your learning journey
        </p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Progress &amp; Grades</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          See where your own learning stands, with a separate space for results shared by your educators.
        </p>
      </header>

      <Tabs defaultValue="personal" className="gap-6">
        <div className="border-b border-border pb-3">
          <TabsList aria-label="Progress record source" className="h-auto! w-full p-1 sm:w-auto">
            <TabsTrigger value="personal" className="min-h-11 min-w-0 gap-2 px-2 text-xs motion-reduce:transition-none sm:px-5 sm:text-sm"><BookOpen aria-hidden="true" className="hidden sm:block" />Personal learning</TabsTrigger>
            <TabsTrigger value="classroom" className="min-h-11 min-w-0 gap-2 px-2 text-xs motion-reduce:transition-none sm:px-5 sm:text-sm"><GraduationCap aria-hidden="true" className="hidden sm:block" />Classroom results</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="personal">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <PersonalProgressSection />
            <aside aria-label="About personal progress" className="space-y-5">
              <Card className="rounded-2xl border border-border shadow-none ring-0">
                <CardHeader className="gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground"><BookOpen aria-hidden="true" className="size-5" /></span>
                  <h2 className="text-base font-semibold">Learning on your terms</h2>
                  <p className="text-sm leading-6 text-muted-foreground">Your personal tasks count here, whether you study independently or belong to a class.</p>
                </CardHeader>
                <CardContent className="gap-2">
                  <Button render={<Link to="/students/subjects" />} variant="outline" className="min-h-11 justify-between">Open My Learning <ArrowUpRight aria-hidden="true" /></Button>
                  <Button render={<Link to="/students/tasks" />} variant="ghost" className="min-h-11 justify-between"><span className="flex items-center gap-2"><ClipboardList aria-hidden="true" />Manage personal tasks</span><ArrowUpRight aria-hidden="true" /></Button>
                </CardContent>
              </Card>
              <div className="rounded-2xl bg-muted/50 p-5 text-sm leading-6">
                <h2 className="font-medium">A snapshot, not a grade</h2>
                <p className="mt-2 text-muted-foreground">Task completion reflects your current personal list. It doesn’t measure mastery or change classroom grades and attendance.</p>
              </div>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="classroom"><ClassroomResultsSection /></TabsContent>
      </Tabs>
    </div>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
