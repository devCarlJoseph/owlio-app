# Personal tasks

Target: `src/components/features/personal-workspace/tasks/`. Proposed destinations:

| Folder | Current files |
| --- | --- |
| `forms/` | `task-composer-dialog.tsx`, `task-delete-dialog.tsx` |
| `ui/` | `task-board.tsx`, `task-detail-dialog.tsx`, `task-list.tsx`, `task-subject-groups.tsx` |
| `model/` | `task-records.ts` |
| `view/` | `tasks-view.tsx`, `tasks-view.test.tsx` |

The detail dialog delegates status/edit actions to the view; keep its keyboard focus return and error/retry behavior when extracting components. Personal task completion is not a grade or an assigned classroom submission.

[Personal workspace plans](../README.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/personal-workspace/tasks/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `task-board.tsx`

Current file: `src/components/features/personal-workspace/tasks/task-board.tsx`

```tsx
import { BookOpen, CalendarDays, Check, Circle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatTaskDueDate, getTaskPriority, isTaskOverdue, taskStatusOptions, type TaskRecord, type TaskStatus } from "./task-records"

type TaskBoardProps = {
  tasks: TaskRecord[]
  preview: boolean
  onOpen: (task: TaskRecord) => void
  onCreate: (status: TaskStatus) => void
  onStatusChange: (task: TaskRecord, status: TaskStatus) => void
  canCreate: boolean
}

const columnAccents: Record<TaskStatus, string> = {
  todo: "bg-amber-400",
  "in-progress": "bg-blue-500",
  done: "bg-emerald-500",
}

export function TaskBoard({ tasks, preview, onOpen, onCreate, onStatusChange, canCreate }: TaskBoardProps) {
  return <div className="grid items-start gap-4 lg:grid-cols-3">
    {taskStatusOptions.map(status => {
      const items = tasks.filter(task => task.status === status.value)
      return <section key={status.value} aria-label={`${status.label} ${preview ? "examples" : "tasks"}`} className="min-w-0 rounded-xl border border-border/60 bg-muted/40 p-2.5">
        <div className="mb-3 flex items-center gap-2 px-1 py-1">
          <span aria-hidden="true" className={`size-2 rounded-full ${columnAccents[status.value]}`} />
          <h3 className="text-sm font-medium">{status.label}</h3>
          <span className="flex size-5 items-center justify-center rounded-md bg-background text-[11px] text-muted-foreground">{items.length}</span>
          <Button variant="ghost" size="icon-sm" aria-label={`Add ${status.label.toLowerCase()} task`} disabled={!canCreate} className="ml-auto" onClick={() => onCreate(status.value)}><Plus aria-hidden="true" className="size-3.5" /></Button>
        </div>
        <ul className="space-y-2.5">
          {items.map(task => <li key={task.id} className="rounded-xl border border-border bg-card p-3.5 shadow-xs transition-colors hover:border-foreground/25">
            <button type="button" data-task-open={task.id} onClick={() => onOpen(task)} aria-label={`Open task ${task.title}`} className="block w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4">
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getTaskPriority(task.priority).badge}`}>{getTaskPriority(task.priority).label} priority</span>
                {preview && <span className="text-[10px] text-muted-foreground">Example</span>}
              </div>
              <h4 className={`break-words text-sm font-medium leading-5 ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</h4>
              <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-muted-foreground">{task.notes || "Add a few notes to plan your next step."}</p>
              <span className="mt-4 inline-flex max-w-full items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-[10px] text-muted-foreground"><BookOpen aria-hidden="true" className="size-3 shrink-0" /><span className="truncate">{task.subject || "Independent study"}</span></span>
            </button>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
              <span className={`flex min-w-0 items-center gap-1 text-[10px] ${isTaskOverdue(task) ? "text-destructive" : "text-muted-foreground"}`}><CalendarDays aria-hidden="true" className="size-3 shrink-0" /><span className="truncate">{isTaskOverdue(task) ? "Overdue · " : ""}{formatTaskDueDate(task)}</span></span>
              {!preview && <button type="button" aria-label={`${task.status === "done" ? "Reopen" : "Complete"} task ${task.title}`} onClick={() => onStatusChange(task, task.status === "done" ? "todo" : "done")} className={`flex size-6 shrink-0 items-center justify-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-ring ${task.status === "done" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border text-muted-foreground hover:bg-muted"}`}>{task.status === "done" ? <Check aria-hidden="true" className="size-3.5" /> : <Circle aria-hidden="true" className="size-3" />}</button>}
            </div>
          </li>)}
        </ul>
        {items.length === 0 && <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">No {status.label.toLowerCase()} tasks in this view.</p>}
        <Button variant="ghost" size="sm" disabled={!canCreate} className="mt-2 w-full justify-start text-xs text-muted-foreground" onClick={() => onCreate(status.value)}><Plus aria-hidden="true" className="size-3.5" />Add task</Button>
      </section>
    })}
  </div>
}
```

### `task-composer-dialog.tsx`

Current file: `src/components/features/personal-workspace/tasks/task-composer-dialog.tsx`

```tsx
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  taskPriorityOptions,
  taskStatusOptions,
  type TaskDraft,
  type TaskPriority,
  type TaskRecord,
  type TaskStatus,
} from "./task-records"
import { loadSubjects } from "../subjects/subject-records"

type TaskComposerDialogProps = {
  open: boolean
  task: TaskRecord | null
  initialSubject?: string
  initialStatus?: TaskStatus
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: TaskDraft) => void
}

export function TaskComposerDialog({
  open,
  task,
  initialSubject,
  initialStatus,
  onOpenChange,
  onSubmit,
}: TaskComposerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <TaskComposerForm
          key={task?.id ?? `new-task-${initialStatus ?? "todo"}`}
          task={task}
          initialSubject={initialSubject}
          initialStatus={initialStatus}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

type TaskComposerFormProps = {
  task: TaskRecord | null
  initialSubject?: string
  initialStatus?: TaskStatus
  onCancel: () => void
  onSubmit: (draft: TaskDraft) => void
}

function TaskComposerForm({ task, initialSubject, initialStatus, onCancel, onSubmit }: TaskComposerFormProps) {
  const [draft, setDraft] = useState<TaskDraft>({
    title: task?.title ?? "",
    subject: task?.subject ?? initialSubject ?? "",
    dueDate: task?.dueDate ?? "",
    priority: task?.priority ?? "medium",
    status: task?.status ?? initialStatus ?? "todo",
    notes: task?.notes ?? "",
  })
  const [titleError, setTitleError] = useState<string | null>(null)
  const subjectNames = useMemo(
    () => loadSubjects().map((subject) => subject.name).filter((name) => name.length > 0),
    []
  )

  function handleSubmit() {
    const nextTitleError =
      draft.title.trim().length < 3 ? "Add a short title of at least 3 characters." : null

    setTitleError(nextTitleError)
    if (nextTitleError) return

    onSubmit({
      title: draft.title.trim(),
      subject: draft.subject.trim(),
      dueDate: draft.dueDate,
      priority: draft.priority,
      status: draft.status,
      notes: draft.notes.trim(),
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {task ? "Edit task" : "New task"}
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          {task
            ? "Update your personal task. Educator-assigned work stays in the classroom."
            : "Plan personal study work. Educator-assigned work stays in the classroom."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={titleError !== null}>
          <FieldLabel htmlFor="task-title" className="text-slate-700">
            Title
          </FieldLabel>
          <Input
            id="task-title"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            aria-invalid={titleError !== null}
            aria-describedby={titleError ? "task-title-error" : undefined}
            placeholder="Finish wave problem set"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="task-title-error">{titleError}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="task-subject" className="text-slate-700">
            Subject
          </FieldLabel>
          <Input
            id="task-subject"
            list="student-subjects"
            value={draft.subject}
            onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
            placeholder="Choose one of your subjects"
            aria-describedby="task-subject-hint"
            className="border-slate-200 bg-slate-50"
          />
          <datalist id="student-subjects">
            {subjectNames.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>
          <FieldDescription id="task-subject-hint" className="text-slate-500">
            Pick a subject you are tracking, or type another one.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="task-due-date" className="text-slate-700">
            Due date
          </FieldLabel>
          <Input
            id="task-due-date"
            type="date"
            value={draft.dueDate}
            onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
            className="border-slate-200 bg-slate-50"
          />
        </Field>

        <Field>
          <FieldLabel className="text-slate-700">Priority</FieldLabel>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Task priority">
            {taskPriorityOptions.map((option) => {
              const isActive = draft.priority === option.value

              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-pressed={isActive}
                  onClick={() => setDraft((current) => ({ ...current, priority: option.value as TaskPriority }))}
                  className={
                    isActive
                      ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }
                >
                  {option.label}
                </Button>
              )
            })}
          </div>
        </Field>

        <Field>
          <FieldLabel className="text-slate-700">Status</FieldLabel>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Task status">
            {taskStatusOptions.map((option) => {
              const isActive = draft.status === option.value

              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-pressed={isActive}
                  onClick={() => setDraft((current) => ({ ...current, status: option.value as TaskStatus }))}
                  className={
                    isActive
                      ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }
                >
                  {option.label}
                </Button>
              )
            })}
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="task-notes" className="text-slate-700">
            Personal notes
          </FieldLabel>
          <Textarea
            id="task-notes"
            rows={4}
            value={draft.notes}
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Questions 4 to 9 first, then review the diagram."
            className="border-slate-200 bg-slate-50"
          />
          <FieldDescription className="text-slate-500">
            Personal notes stay with your task in this browser. They aren’t sent to educators or synced to an account.
          </FieldDescription>
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSubmit}>
          Save task
        </Button>
      </DialogFooter>
    </>
  )
}
```

### `task-delete-dialog.tsx`

Current file: `src/components/features/personal-workspace/tasks/task-delete-dialog.tsx`

```tsx
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { TaskRecord } from "./task-records"

type TaskDeleteDialogProps = {
  open: boolean
  task: TaskRecord | null
  onOpenChange: (open: boolean) => void
  onConfirm: (task: TaskRecord) => void
}

export function TaskDeleteDialog({ open, task, onOpenChange, onConfirm }: TaskDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">Delete this task?</DialogTitle>
          <DialogDescription className="text-slate-600">
            {task
              ? `“${task.title}” will be removed from this browser.`
              : "This task will be removed."}{" "}
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep task
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (!task) return
              onConfirm(task)
            }}
          >
            <Trash aria-hidden="true" />
            Delete task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### `task-detail-dialog.tsx`

Current file: `src/components/features/personal-workspace/tasks/task-detail-dialog.tsx`

```tsx
import { useEffect, useMemo, useRef } from "react"
import { Link } from "react-router"
import { ArrowUpRight, BookOpen, CalendarDays, Check, Flag, FileText, Pencil, Presentation, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { listWork, workHref } from "@/components/features/materials/workspace/work-records"
import { formatTaskDueDate, getTaskPriority, getTaskStatus, isTaskOverdue, taskStatusOptions, type TaskRecord, type TaskStatus } from "./task-records"

type TaskDetailDialogProps = {
  open: boolean
  task: TaskRecord | null
  preview: boolean
  saveFailed: boolean
  onRetrySave: () => void
  onOpenChange: (open: boolean) => void
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onStatusChange: (task: TaskRecord, status: TaskStatus) => void
  onCreate?: () => void
}

export function TaskDetailDialog({ open, task, preview, saveFailed, onRetrySave, onOpenChange, onEdit, onDelete, onStatusChange, onCreate }: TaskDetailDialogProps) {
  const taskId = useRef(task?.id)
  useEffect(() => { if (task) taskId.current = task.id }, [task])
  const files = useMemo(() => {
    if (!open || !task || preview) return { items: [], error: false }
    const collection = listWork()
    return { ...collection, items: collection.items.filter(item => item.taskId === task.id) }
  }, [open, task, preview])
  const created = task ? new Date(task.createdAt) : null
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} overlayClassName="bg-black/25 supports-backdrop-filter:backdrop-blur-none" finalFocus={() => {
      if (document.querySelector('[data-slot="dialog-content"][data-open]')) return false
      return Array.from(document.querySelectorAll<HTMLButtonElement>("button[data-task-open]")).find(button => button.dataset.taskOpen === taskId.current) ?? document.getElementById("create-personal-task")
    }} className="inset-y-0 right-0 left-auto flex h-dvh w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-l border-border p-0 sm:max-w-[460px] data-open:zoom-in-100 data-closed:zoom-out-100 motion-reduce:animate-none">
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-4 py-3">
        <DialogClose render={<Button variant="ghost" size="icon-sm" aria-label="Close task details" />}><X aria-hidden="true" /></DialogClose>
        <span className="ml-1 text-xs text-muted-foreground">{preview ? "Example task" : "Personal task"}</span>
        {task && !preview && <div className="ml-auto flex gap-1"><Button variant="ghost" size="icon-sm" aria-label="Edit task" onClick={() => onEdit(task)}><Pencil aria-hidden="true" /></Button><Button variant="ghost" size="icon-sm" aria-label="Delete task" onClick={() => onDelete(task)}><Trash2 aria-hidden="true" /></Button></div>}
      </div>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
        <div><DialogTitle className="break-words text-xl font-semibold leading-7">{task?.title ?? "Task unavailable"}</DialogTitle><DialogDescription className="mt-2 text-xs leading-5">{preview ? "Layout example only. Create your own task to start tracking your study work." : task ? "Personal study work. Browser local; separate from official classwork." : "This task is no longer in your personal list."}</DialogDescription></div>
        {saveFailed && !preview && <div role="alert" className="rounded-xl border border-destructive/30 p-3 text-xs leading-5"><p>Latest changes aren’t saved. Keep this page open and retry.</p><Button variant="outline" size="sm" className="mt-2" onClick={onRetrySave}>Retry save</Button></div>}
        {task && <>
          <dl className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-x-3 gap-y-4 text-xs">
            <dt className="flex items-center gap-2 text-muted-foreground"><Flag aria-hidden="true" className="size-3.5" />Priority</dt><dd><span className={`rounded px-2 py-1 ${getTaskPriority(task.priority).badge}`}>{getTaskPriority(task.priority).label}</span></dd>
            <dt className="flex items-center gap-2 text-muted-foreground"><Check aria-hidden="true" className="size-3.5" /><label htmlFor="detail-task-status">Status</label></dt><dd>{preview ? <span className={`rounded border px-2 py-1 ${getTaskStatus(task.status).badge}`}>{getTaskStatus(task.status).label}</span> : <select id="detail-task-status" value={task.status} onChange={event => onStatusChange(task, event.target.value as TaskStatus)} className="h-8 w-full rounded-lg border border-input bg-background px-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">{taskStatusOptions.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}</select>}</dd>
            <dt className="flex items-center gap-2 text-muted-foreground"><BookOpen aria-hidden="true" className="size-3.5" />Subject</dt><dd className="break-words">{task.subject || "Independent study"}</dd>
            <dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays aria-hidden="true" className="size-3.5" />Created</dt><dd>{created && Number.isFinite(created.getTime()) ? created.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Date unavailable"}</dd>
            <dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays aria-hidden="true" className="size-3.5" />Due date</dt><dd className={isTaskOverdue(task) ? "text-destructive" : ""}>{isTaskOverdue(task) ? "Overdue · " : ""}{formatTaskDueDate(task)}</dd>
          </dl>
          <section aria-labelledby="personal-task-notes" className="space-y-2 border-t border-border pt-5"><h3 id="personal-task-notes" className="text-xs font-medium">Personal notes</h3><p className="whitespace-pre-wrap break-words rounded-xl bg-muted/45 p-3.5 text-sm leading-6">{task.notes || "No notes yet. Edit this task to add your next steps."}</p></section>
          {!preview && <section aria-labelledby="task-study-files" className="space-y-3 border-t border-border pt-5">
            <div className="flex items-center justify-between gap-2"><h3 id="task-study-files" className="text-xs font-medium">Study files <span className="ml-1 text-muted-foreground">{files.items.length}</span></h3><Link to="/students/materials/personal" className="inline-flex items-center gap-1 rounded text-[11px] text-muted-foreground underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">Study Library<ArrowUpRight aria-hidden="true" className="size-3" /></Link></div>
            {files.error && <p role="alert" className="text-xs text-destructive">Some local study files couldn’t be read. Open Study Library to retry.</p>}
            {files.items.length > 0 ? <ul className="space-y-2">{files.items.map(file => { const Icon = file.kind === "document" ? FileText : Presentation; return <li key={file.id}><Link to={workHref(file.id)} className="flex items-center gap-3 rounded-xl border border-border p-3 outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"><Icon aria-hidden="true" className={`size-5 shrink-0 ${file.kind === "document" ? "text-blue-600" : "text-orange-600"}`} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{file.title || "Untitled"}</span><span className="mt-1 block text-[10px] text-muted-foreground">{file.kind === "document" ? "Document" : "Presentation"} · Browser local</span></span><ArrowUpRight aria-hidden="true" className="size-3.5 text-muted-foreground" /></Link></li> })}</ul> : <p className="rounded-xl border border-dashed border-border p-4 text-xs leading-5 text-muted-foreground">No linked study files. Choose this personal task from a document or presentation in Study Library to connect it here.</p>}
          </section>}
        </>}
      </div>
      {task && <div className="shrink-0 border-t border-border p-4">{preview ? onCreate && <Button className="w-full" onClick={onCreate}>Create a personal task</Button> : <Button className="w-full" variant={task.status === "done" ? "outline" : "default"} onClick={() => onStatusChange(task, task.status === "done" ? "todo" : "done")}><Check aria-hidden="true" />{task.status === "done" ? "Reopen task" : "Mark as done"}</Button>}</div>}
    </DialogContent>
  </Dialog>
}
```

### `task-list.tsx`

Current file: `src/components/features/personal-workspace/tasks/task-list.tsx`

```tsx
import { CalendarDays, ChevronRight } from "lucide-react"
import { getTaskPriority, getTaskStatus, formatTaskDueDate, isTaskOverdue, type TaskRecord } from "./task-records"

export function TaskList({ tasks, onOpen }: { tasks: TaskRecord[]; onOpen: (task: TaskRecord) => void }) {
  return <ul aria-label="Task list" className="divide-y divide-border overflow-hidden rounded-xl border border-border">
    {tasks.map(task => <li key={task.id}>
      <button type="button" data-task-open={task.id} aria-label={`Open task ${task.title}`} onClick={() => onOpen(task)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 bg-card p-4 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
        <span className="min-w-36 flex-1"><span className={`block break-words text-sm font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}>{task.title}</span><span className="mt-1 block text-xs text-muted-foreground">{task.subject || "Independent study"}</span></span>
        <span className={`rounded-md px-2 py-1 text-[10px] ${getTaskPriority(task.priority).badge}`}>{getTaskPriority(task.priority).label} priority</span>
        <span className={`rounded-md border px-2 py-1 text-[10px] ${getTaskStatus(task.status).badge}`}>{getTaskStatus(task.status).label}</span>
        <span className={`flex items-center gap-1 text-[11px] ${isTaskOverdue(task) ? "text-destructive" : "text-muted-foreground"}`}><CalendarDays aria-hidden="true" className="size-3" />{isTaskOverdue(task) ? "Overdue · " : ""}{formatTaskDueDate(task)}</span>
        <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
      </button>
    </li>)}
  </ul>
}
```

### `task-records.ts`

Current file: `src/components/features/personal-workspace/tasks/task-records.ts`

```ts
import type { LucideIcon } from "lucide-react"
import { Circle, CircleCheck, Clock } from "lucide-react"

export type TaskPriority = "low" | "medium" | "high"

export type TaskStatus = "todo" | "in-progress" | "done"

export type TaskRecord = {
  id: string
  title: string
  subject: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  notes: string
  createdAt: string
}

export type TaskDraft = {
  title: string
  subject: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  notes: string
}

export type TaskOption<T extends string> = {
  value: T
  label: string
  icon?: LucideIcon
  badge: string
}

export const tasksStorageKey = "owlio.student-tasks.v1"

export const tasksGuidance =
  "Personal tasks are yours alone. Educator-assigned work lives in the classroom page, not on this page."

export const tasksStorageNotice =
  "Sample tasks are for layout preview only. Your tasks are kept in this browser and are never sent to a server."

export const taskPriorityOptions: TaskOption<TaskPriority>[] = [
  { value: "low", label: "Low", badge: "bg-slate-100 text-slate-600" },
  { value: "medium", label: "Medium", badge: "bg-blue-50 text-blue-700" },
  { value: "high", label: "High", badge: "bg-destructive/10 text-destructive" },
]

export const taskStatusOptions: TaskOption<TaskStatus>[] = [
  { value: "todo", label: "To do", icon: Circle, badge: "border-slate-200 bg-slate-50 text-slate-600" },
  { value: "in-progress", label: "In progress", icon: Clock, badge: "bg-blue-50 text-blue-700" },
  { value: "done", label: "Done", icon: CircleCheck, badge: "bg-blue-700 text-white" },
]

export const taskEmptyDueDateLabel = "No due date"

const dueDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function getTaskPriority(value: TaskPriority): TaskOption<TaskPriority> {
  return taskPriorityOptions.find((option) => option.value === value) ?? taskPriorityOptions[1]
}

export function getTaskStatus(value: TaskStatus): TaskOption<TaskStatus> {
  return taskStatusOptions.find((option) => option.value === value) ?? taskStatusOptions[0]
}

export function isTaskOverdue(task: TaskRecord): boolean {
  if (task.status === "done" || task.dueDate.length === 0) return false
  const due = new Date(`${task.dueDate}T23:59:59`)
  return !Number.isNaN(due.getTime()) && due.getTime() < Date.now()
}

export function formatTaskDueDate(task: TaskRecord): string {
  if (task.dueDate.length === 0) return taskEmptyDueDateLabel

  const due = new Date(`${task.dueDate}T00:00:00`)
  if (Number.isNaN(due.getTime())) return taskEmptyDueDateLabel

  return `Due ${dueDateFormatter.format(due)}`
}

export const sampleTasks: TaskRecord[] = [
  {
    id: "sample-task-wave-problem-set",
    title: "Finish wave problem set",
    subject: "Physics I",
    dueDate: "2026-10-16",
    priority: "high",
    status: "in-progress",
    notes: "Questions 4 to 9 first, then review the interference diagram.",
    createdAt: "2026-10-10T09:00:00.000Z",
  },
  {
    id: "sample-task-chem-review",
    title: "Review bonding flashcards",
    subject: "Chemistry I",
    dueDate: "2026-10-15",
    priority: "medium",
    status: "todo",
    notes: "Focus on electron affinity trends.",
    createdAt: "2026-10-11T14:20:00.000Z",
  },
  {
    id: "sample-task-calculus-timed-paper",
    title: "Timed past paper",
    subject: "Mathematics",
    dueDate: "2026-10-18",
    priority: "high",
    status: "todo",
    notes: "Forty-five minutes, no notes allowed.",
    createdAt: "2026-10-12T18:05:00.000Z",
  },
  {
    id: "sample-task-essay-draft",
    title: "Draft counter-argument paragraph",
    subject: "English",
    dueDate: "2026-10-14",
    priority: "medium",
    status: "done",
    notes: "Drafted from the notes tagged #task.",
    createdAt: "2026-10-08T12:00:00.000Z",
  },
  {
    id: "sample-task-read-chapter",
    title: "Read chapter 6 summary",
    subject: "History",
    dueDate: "",
    priority: "low",
    status: "todo",
    notes: "",
    createdAt: "2026-10-09T08:45:00.000Z",
  },
]

function isTaskRecord(value: unknown): value is TaskRecord {
  if (typeof value !== "object" || value === null) return false
  const task = value as Record<string, unknown>

  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.subject === "string" &&
    typeof task.dueDate === "string" &&
    (task.priority === "low" || task.priority === "medium" || task.priority === "high") &&
    (task.status === "todo" || task.status === "in-progress" || task.status === "done") &&
    typeof task.notes === "string" &&
    typeof task.createdAt === "string"
  )
}

export function createTaskId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function sortTasks(tasks: TaskRecord[]): TaskRecord[] {
  const statusOrder: Record<TaskStatus, number> = { "in-progress": 0, todo: 1, done: 2 }

  return [...tasks].sort((first, second) => {
    if (first.status === "done" !== (second.status === "done")) {
      return first.status === "done" ? 1 : -1
    }

    const byStatus = statusOrder[first.status] - statusOrder[second.status]

    if (byStatus !== 0) return byStatus
    if (first.dueDate !== second.dueDate) {
      if (first.dueDate.length === 0) return 1
      if (second.dueDate.length === 0) return -1
      return first.dueDate.localeCompare(second.dueDate)
    }

    return second.createdAt.localeCompare(first.createdAt)
  })
}

export function loadTasks(): TaskRecord[] {
  if (typeof window === "undefined") return sampleTasks

  try {
    const stored = window.localStorage.getItem(tasksStorageKey)
    if (!stored) return sampleTasks

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return sampleTasks

    return parsed.filter(isTaskRecord)
  } catch {
    return sampleTasks
  }
}

export function isExampleTask(task: TaskRecord): boolean {
  const sample = sampleTasks.find(item => item.id === task.id)
  return sample !== undefined && (Object.keys(sample) as (keyof TaskRecord)[]).every(key => sample[key] === task[key])
}

export function loadPersonalTasks(): { tasks: TaskRecord[]; error: boolean } {
  try {
    const stored = window.localStorage.getItem(tasksStorageKey)
    if (!stored) return { tasks: [], error: false }
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed) || !parsed.every(isTaskRecord)) return { tasks: [], error: true }
    return { tasks: parsed.filter(task => !isExampleTask(task)), error: false }
  } catch { return { tasks: [], error: true } }
}

export function saveTasks(tasks: TaskRecord[]): boolean {
  if (typeof window === "undefined") return false

  try {
    window.localStorage.setItem(tasksStorageKey, JSON.stringify(tasks))
    return true
  } catch {
    return false
  }
}
```

### `task-subject-groups.tsx`

Current file: `src/components/features/personal-workspace/tasks/task-subject-groups.tsx`

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatTaskDueDate, getTaskStatus, type TaskRecord } from "./task-records"

type TaskSubjectGroup = {
  subject: string
  tasks: TaskRecord[]
}

function groupTasksBySubject(tasks: TaskRecord[]): TaskSubjectGroup[] {
  const groups = new Map<string, TaskRecord[]>()

  for (const task of tasks) {
    const subject = task.subject.trim().length > 0 ? task.subject.trim() : "No subject"
    const existing = groups.get(subject)
    if (existing) existing.push(task)
    else groups.set(subject, [task])
  }

  return [...groups.entries()]
    .map(([subject, groupedTasks]) => ({ subject, tasks: groupedTasks }))
    .sort((first, second) => {
      if (first.subject === "No subject") return 1
      if (second.subject === "No subject") return -1
      return first.subject.localeCompare(second.subject)
    })
}

type TaskSubjectGroupsProps = {
  tasks: TaskRecord[]
  onOpen: (task: TaskRecord) => void
}

export function TaskSubjectGroups({ tasks, onOpen }: TaskSubjectGroupsProps) {
  const groups = groupTasksBySubject(tasks)

  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              <h3 className="text-base font-semibold text-slate-900">By subject</h3>
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Your tasks grouped by the subject you chose when creating them.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="gap-4">
        {groups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-sm leading-6 text-slate-600">
            No tasks yet. Create a task with a subject and it will appear in that subject group here.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.subject} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900">{group.subject}</h4>
                <span className="text-xs text-slate-500">
                  {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>
              <ul className="space-y-2">
                {group.tasks.map((task) => {
                  const status = getTaskStatus(task.status)

                  return (
                    <li key={task.id}>
                      <button
                        data-task-open={task.id}
                        type="button"
                        onClick={() => onOpen(task)}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-sm font-medium ${
                              task.status === "done" ? "text-slate-500 line-through" : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">{formatTaskDueDate(task)}</span>
                        </span>
                        <span
                          className={`shrink-0 rounded-4xl border px-2 py-0.5 text-xs font-medium ${status.badge}`}
                        >
                          {status.label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
```

### `tasks-view.test.tsx`

Current file: `src/components/features/personal-workspace/tasks/tasks-view.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TasksView } from "./tasks-view"
import { loadPersonalTasks, sampleTasks, tasksStorageKey, type TaskRecord } from "./task-records"
import { createWork, saveWork, workHref } from "@/components/features/materials/workspace/work-records"

const first: TaskRecord = { id: "my-physics-task", title: "Outline my physics report", subject: "Physics", notes: "Compare two experiments", status: "todo", priority: "high", dueDate: "2030-11-10", createdAt: "2026-10-30T09:00:00.000Z" }
const second: TaskRecord = { ...first, id: "my-biology-task", title: "Review cell structure", subject: "Biology", status: "in-progress", notes: "Draw a cell diagram" }
function show(tasks?: TaskRecord[]) {
  if (tasks) localStorage.setItem(tasksStorageKey, JSON.stringify(tasks))
  return render(<MemoryRouter><TasksView /></MemoryRouter>)
}
function stored(): TaskRecord[] { return JSON.parse(localStorage.getItem(tasksStorageKey) ?? "[]") }

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe("reference-aligned personal tasks", () => {
  it("keeps the example board read-only and does not persist samples on page load", async () => {
    const user = userEvent.setup()
    const writes = vi.spyOn(Storage.prototype, "setItem")
    show()
    expect(screen.getByRole("status").textContent).toBe("Preview only")
    await user.click(screen.getByRole("button", { name: `Open task ${sampleTasks[0].title}` }))
    const detail = within(screen.getByRole("dialog"))
    expect(detail.getByText("Example task")).toBeTruthy()
    expect(detail.queryByRole("button", { name: "Edit task" })).toBeNull()
    expect(detail.queryByRole("combobox", { name: "Status" })).toBeNull()
    expect(writes).not.toHaveBeenCalled()
  })

  it("creates directly in a board column and saves only the student’s task", async () => {
    const user = userEvent.setup()
    show()
    await user.click(screen.getByRole("button", { name: "Add in progress task" }))
    const form = within(screen.getByRole("dialog"))
    expect(form.getByRole("button", { name: "In progress" }).getAttribute("aria-pressed")).toBe("true")
    await user.click(form.getByRole("button", { name: "Save task" }))
    expect(form.getByText(/at least 3 characters/)).toBeTruthy()
    await user.type(form.getByRole("textbox", { name: "Title" }), "Prepare a history outline")
    fireEvent.change(form.getByLabelText("Due date"), { target: { value: "2030-11-10" } })
    await user.click(form.getByRole("button", { name: "Save task" }))
    expect(stored()).toHaveLength(1)
    expect(stored()[0]).toMatchObject({ title: "Prepare a history outline", status: "in-progress", dueDate: "2030-11-10" })
    expect(within(screen.getByRole("region", { name: "In progress tasks" })).getByRole("button", { name: /Open task Prepare/ })).toBeTruthy()
  })

  it("moves tasks between columns through the detail panel and restores focus on close", async () => {
    const user = userEvent.setup()
    show([first, second])
    const trigger = screen.getByRole("button", { name: `Open task ${first.title}` })
    await user.click(trigger)
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "done")
    expect(stored()[0].status).toBe("done")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(within(screen.getByRole("region", { name: "Done tasks" })).getByRole("button", { name: `Open task ${first.title}` })).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: `Open task ${first.title}` }))
  })

  it("supports quick completion and reopening without touching other records", async () => {
    const user = userEvent.setup()
    show([first, second])
    await user.click(screen.getByRole("button", { name: `Complete task ${first.title}` }))
    expect(stored()[0].status).toBe("done")
    expect(stored()[1]).toEqual(second)
    await user.click(screen.getByRole("button", { name: `Reopen task ${first.title}` }))
    expect(stored()[0].status).toBe("todo")
  })

  it("applies search and subject/status filters across board, list, and subject views", async () => {
    const user = userEvent.setup()
    show([first, second])
    await user.selectOptions(screen.getByRole("combobox", { name: "Filter tasks by subject" }), "Biology")
    await user.click(screen.getByRole("button", { name: "List" }))
    expect(screen.getByRole("button", { name: `Open task ${second.title}` })).toBeTruthy()
    expect(screen.queryByRole("button", { name: `Open task ${first.title}` })).toBeNull()
    await user.type(screen.getByRole("searchbox", { name: "Search tasks" }), "nothing matches")
    expect(screen.getByRole("heading", { name: "No tasks match this view" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Reset filters" }))
    await user.click(screen.getByRole("button", { name: "By subject" }))
    expect(screen.getByRole("heading", { name: "Physics" })).toBeTruthy()
    expect(screen.getAllByRole("link", { name: "Assigned classwork" })[0].getAttribute("href")).toBe("/students/classwork")
  })

  it("edits and deletes through the existing dialogs", async () => {
    const user = userEvent.setup()
    show([first])
    await user.click(screen.getByRole("button", { name: `Open task ${first.title}` }))
    await user.click(screen.getByRole("button", { name: "Edit task" }))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Title" })))
    await user.clear(screen.getByRole("textbox", { name: "Title" }))
    await user.type(screen.getByRole("textbox", { name: "Title" }), "Updated physics outline")
    await user.click(screen.getByRole("button", { name: "Save task" }))
    expect(stored()[0].id).toBe(first.id)
    expect(stored()[0].title).toBe("Updated physics outline")
    await user.click(screen.getByRole("button", { name: "Open task Updated physics outline" }))
    await user.click(screen.getByRole("button", { name: "Delete task" }))
    expect(stored()).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "Delete task" }))
    expect(stored()).toHaveLength(0)
    expect(screen.getByRole("heading", { name: "Make room for your next goal" })).toBeTruthy()
  })

  it("shows only study files linked to the selected personal task", async () => {
    const user = userEvent.setup()
    const linked = { ...createWork("document", "Physics study draft"), taskId: first.id }
    const other = { ...createWork("presentation", "Unrelated presentation"), taskId: second.id }
    saveWork(linked, null); saveWork(other, null)
    show([first, second])
    await user.click(screen.getByRole("button", { name: `Open task ${first.title}` }))
    expect(screen.getByRole("link", { name: /Physics study draft/ }).getAttribute("href")).toBe(workHref(linked.id))
    expect(screen.queryByRole("link", { name: /Unrelated presentation/ })).toBeNull()
    expect(screen.queryByRole("button", { name: /upload|invite|comments/i })).toBeNull()
  })

  it("preserves edited legacy samples while separating untouched examples", () => {
    const edited = { ...sampleTasks[0], notes: "My own changed plan" }
    localStorage.setItem(tasksStorageKey, JSON.stringify([edited, sampleTasks[1]]))
    expect(loadPersonalTasks().tasks).toEqual([edited])
    show()
    expect(screen.getByText("My own changed plan")).toBeTruthy()
    expect(stored()).toHaveLength(2)
  })

  it("protects unreadable saved data and can retry after storage is repaired", async () => {
    const user = userEvent.setup()
    localStorage.setItem(tasksStorageKey, "unreadable")
    show()
    expect(screen.getByRole("button", { name: "New task" }).hasAttribute("disabled")).toBe(true)
    expect(localStorage.getItem(tasksStorageKey)).toBe("unreadable")
    localStorage.setItem(tasksStorageKey, JSON.stringify([first]))
    await user.click(screen.getByRole("button", { name: "Retry loading tasks" }))
    expect(screen.getByRole("button", { name: `Open task ${first.title}` })).toBeTruthy()
  })

  it("keeps failed changes on the page and reports a successful retry accurately", async () => {
    const user = userEvent.setup()
    show([first])
    const writes = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    await user.click(screen.getByRole("button", { name: `Complete task ${first.title}` }))
    expect(screen.getByRole("status").textContent).toBe("Latest changes aren’t saved")
    expect(stored()[0].status).toBe("todo")
    writes.mockRestore()
    await user.click(screen.getByRole("button", { name: "Retry save" }))
    expect(stored()[0].status).toBe("done")
    expect(screen.getByRole("status").textContent).not.toContain("aren’t saved")
  })

  it("shows a failed status save inside the detail panel and retries without closing it", async () => {
    const user = userEvent.setup()
    show([first])
    await user.click(screen.getByRole("button", { name: `Open task ${first.title}` }))
    const writes = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "done")
    const detail = within(screen.getByRole("dialog"))
    expect(detail.getByRole("alert").textContent).toContain("aren’t saved")
    writes.mockRestore()
    await user.click(detail.getByRole("button", { name: "Retry save" }))
    expect(stored()[0].status).toBe("done")
    expect(detail.queryByRole("alert")).toBeNull()
  })
})
```

### `tasks-view.tsx`

Current file: `src/components/features/personal-workspace/tasks/tasks-view.tsx`

```tsx
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { ArrowUpRight, CheckCheck, Columns3, Folder, Info, List, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskBoard } from "./task-board"
import { TaskComposerDialog } from "./task-composer-dialog"
import { TaskDeleteDialog } from "./task-delete-dialog"
import { TaskDetailDialog } from "./task-detail-dialog"
import { TaskList } from "./task-list"
import { TaskSubjectGroups } from "./task-subject-groups"
import { createTaskId, loadPersonalTasks, sampleTasks, saveTasks, sortTasks, taskStatusOptions, type TaskDraft, type TaskRecord, type TaskStatus } from "./task-records"

const selectClass = "h-9 min-w-0 rounded-lg border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function TasksView() {
  const [collection, setCollection] = useState(loadPersonalTasks)
  const [preview, setPreview] = useState(() => collection.tasks.length === 0 && !collection.error)
  const [saveFailed, setSaveFailed] = useState(false)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [view, setView] = useState<"board" | "list" | "subject">("board")
  const [composerOpen, setComposerOpen] = useState(false)
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("todo")
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaskRecord | null>(null)
  const tasks = preview ? sampleTasks : collection.tasks
  const subjects = [...new Set(tasks.map(task => task.subject).filter(Boolean))].sort()
  const editingTask = collection.tasks.find(task => task.id === editingTaskId) ?? null
  const detailTask = tasks.find(task => task.id === detailTaskId) ?? null
  const completed = tasks.filter(task => task.status === "done").length
  const isFiltered = statusFilter !== "all" || subjectFilter !== "all" || query.trim().length > 0
  const visibleTasks = useMemo(() => {
    const search = query.trim().toLowerCase()
    return sortTasks(tasks.filter(task => (statusFilter === "all" || task.status === statusFilter) &&
      (subjectFilter === "all" || task.subject === subjectFilter) &&
      `${task.title} ${task.subject} ${task.notes}`.toLowerCase().includes(search)))
  }, [tasks, query, statusFilter, subjectFilter])

  useEffect(() => {
    if (!saveFailed) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    const checkNavigation = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a[href]") && !window.confirm("Your latest task changes aren’t saved. Leave this page and lose those changes?")) { event.preventDefault(); event.stopPropagation() }
    }
    window.addEventListener("beforeunload", warn)
    document.addEventListener("click", checkNavigation, true)
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", checkNavigation, true) }
  }, [saveFailed])

  function updateTasks(next: TaskRecord[]) {
    setCollection({ tasks: next, error: false })
    setSaveFailed(!saveTasks(next))
  }
  function clearFilters() { setQuery(""); setStatusFilter("all"); setSubjectFilter("all") }
  function create(status: TaskStatus = "todo") {
    setInitialStatus(status); setEditingTaskId(null); setDetailTaskId(null); setComposerOpen(true)
  }
  function submit(draft: TaskDraft) {
    const next = editingTaskId
      ? collection.tasks.map(task => task.id === editingTaskId ? { ...task, ...draft } : task)
      : [...collection.tasks, { id: createTaskId(), ...draft, createdAt: new Date().toISOString() }]
    updateTasks(next)
    setPreview(false); clearFilters(); setComposerOpen(false); setEditingTaskId(null)
  }
  function changeStatus(task: TaskRecord, status: TaskStatus) {
    if (preview || collection.error) return
    updateTasks(collection.tasks.map(item => item.id === task.id ? { ...item, status } : item))
  }
  function switchPreview() { setPreview(!preview); clearFilters(); setDetailTaskId(null) }

  return <div className="mx-auto w-full max-w-7xl rounded-2xl border border-border bg-card p-4 sm:p-6">
    <header className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">Your personal workspace</p><h2 className="mt-1.5 text-2xl font-semibold tracking-tight">My tasks</h2><p className="mt-1.5 text-sm text-muted-foreground">A little structure for whatever you’re learning next.</p></div>
        <Button id="create-personal-task" onClick={() => create()} disabled={collection.error}><Plus aria-hidden="true" /> New task</Button>
      </div>
      <nav aria-label="Task ownership" className="flex flex-wrap items-center gap-1 border-b border-border">
        <span aria-current="page" className="border-b-2 border-primary px-3 py-3 text-sm font-medium">Personal tasks</span>
        <Link to="/students/classwork" className="inline-flex items-center gap-1.5 rounded-t-lg px-3 py-3 text-sm text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">Assigned classwork <ArrowUpRight aria-hidden="true" className="size-3.5" /></Link>
      </nav>
    </header>

    <div className="my-4 flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label="Task view" className="flex flex-wrap items-center gap-1">
        {([{ value: "board", label: "Board", icon: Columns3 }, { value: "list", label: "List", icon: List }, { value: "subject", label: "By subject", icon: Folder }] as const).map(item => <Button key={item.value} variant="ghost" size="sm" aria-pressed={view === item.value} onClick={() => setView(item.value)} className={view === item.value ? "bg-muted text-foreground" : "text-muted-foreground"}><item.icon aria-hidden="true" className="size-3.5" />{item.label}</Button>)}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><CheckCheck aria-hidden="true" className="size-3.5" /><span>{completed} of {tasks.length} {preview ? "examples" : "tasks"} completed</span><span aria-hidden="true" className="mx-1 h-3 border-l border-border" /><button type="button" onClick={switchPreview} className="rounded underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">{preview ? "Show my tasks" : "View example board"}</button></div>
    </div>

    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-44 flex-1 sm:max-w-xs"><Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label="Search tasks" placeholder="Search tasks…" value={query} onChange={event => setQuery(event.target.value)} className="h-9 bg-background pl-9 text-xs md:text-xs" /></div>
      <select aria-label="Filter tasks by status" className={selectClass} value={statusFilter} onChange={event => setStatusFilter(event.target.value as TaskStatus | "all")}><option value="all">All statuses</option>{taskStatusOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
      <select aria-label="Filter tasks by subject" className={`${selectClass} max-w-44`} value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)}><option value="all">All subjects</option>{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select>
      {isFiltered && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>}
    </div>

    <div className="mb-4 flex flex-wrap items-start justify-between gap-x-5 gap-y-2 text-[11px] leading-5 text-muted-foreground">
      <p className="flex max-w-2xl items-start gap-1.5"><Info aria-hidden="true" className="mt-1 size-3 shrink-0" />{preview ? "Example board · Sample tasks for exploring the layout. Examples aren’t added to your personal tasks." : "Personal tasks stay in this browser. Clearing browser data removes them; they aren’t synced to an account or sent to educators."}</p>
      <p role="status" className={saveFailed ? "font-medium text-destructive" : ""}>{collection.error ? "Local storage unavailable" : saveFailed ? "Latest changes aren’t saved" : preview ? "Preview only" : `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"} shown · Browser local`}</p>
    </div>
    {collection.error && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 p-4 text-sm"><p>Your saved tasks couldn’t be read. Retry before editing so the saved data isn’t replaced.</p><Button className="mt-3" variant="outline" size="sm" onClick={() => { const next = loadPersonalTasks(); setCollection(next); setPreview(false) }}>Retry loading tasks</Button></div>}
    {saveFailed && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 p-4 text-sm"><p>Your latest changes are still on this page. Keep it open and retry saving after checking browser storage.</p><Button className="mt-3" variant="outline" size="sm" onClick={() => setSaveFailed(!saveTasks(collection.tasks))}>Retry save</Button></div>}

    {visibleTasks.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-14 text-center"><CheckCheck aria-hidden="true" className="mx-auto mb-3 size-7 text-muted-foreground" /><h3 className="text-base font-medium">{isFiltered ? "No tasks match this view" : "Make room for your next goal"}</h3><p className="mt-2 text-sm text-muted-foreground">{isFiltered ? "Try another search, status, or subject." : "Create a personal task to start planning your study work."}</p><Button className="mt-4" variant="outline" disabled={!isFiltered && collection.error} onClick={() => isFiltered ? clearFilters() : create()}>{isFiltered ? "Reset filters" : "Create a task"}</Button></div>
      : view === "board" ? <TaskBoard tasks={visibleTasks} preview={preview} onOpen={task => setDetailTaskId(task.id)} onCreate={create} onStatusChange={changeStatus} canCreate={!collection.error} />
      : view === "list" ? <TaskList tasks={visibleTasks} onOpen={task => setDetailTaskId(task.id)} />
      : <TaskSubjectGroups tasks={visibleTasks} onOpen={task => setDetailTaskId(task.id)} />}
    <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Educator-assigned assessments and submissions live in <Link to="/students/classwork" className="rounded font-medium text-foreground underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">Assigned classwork</Link>.</p>

    <TaskDetailDialog open={detailTaskId !== null} task={detailTask} preview={preview} saveFailed={saveFailed} onRetrySave={() => setSaveFailed(!saveTasks(collection.tasks))} onOpenChange={open => { if (!open) setDetailTaskId(null) }} onEdit={task => { setDetailTaskId(null); setEditingTaskId(task.id); setComposerOpen(true) }} onDelete={task => { setDetailTaskId(null); setDeleteTarget(task) }} onStatusChange={changeStatus} onCreate={!collection.error ? () => create() : undefined} />
    <TaskComposerDialog open={composerOpen} task={editingTask} initialStatus={initialStatus} onOpenChange={open => { setComposerOpen(open); if (!open) setEditingTaskId(null) }} onSubmit={submit} />
    <TaskDeleteDialog open={deleteTarget !== null} task={deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }} onConfirm={task => { updateTasks(collection.tasks.filter(item => item.id !== task.id)); setDeleteTarget(null) }} />
  </div>
}
```

<!-- END GENERATED CURRENT SOURCE -->
