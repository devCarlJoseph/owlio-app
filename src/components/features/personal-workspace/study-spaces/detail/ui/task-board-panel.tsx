import { useState, type FormEvent } from "react"
import { ArrowDown, ArrowUp, ClipboardList, Plus, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TaskPerson = { id: string; name: string }
import { roomTasksNotice, canTickTask, type RoomTask, type RoomTaskAssignee } from "../utils/room-tasks"

type TaskBoardPanelProps = {
  tasks: RoomTask[]
  people: TaskPerson[]
  shared?: boolean
  busy?: boolean
  loading?: boolean
  loadError?: string
  isLeader: boolean
  onAdd: (draft: { title: string; notes: string; due: string | null; assignee: RoomTaskAssignee }) => void | boolean | Promise<boolean>
  onToggle: (taskId: string) => void
  onRemove: (taskId: string) => void
  onMove: (taskId: string, direction: -1 | 1) => void
  onClose: () => void
}

function assigneeLabel(assignee: RoomTaskAssignee, people: TaskPerson[]): string {
  if (assignee === "everyone") return "Everyone"
  if (assignee === "me") return "You"
  const person = people.find((entry) => entry.id === assignee)
  return person?.name ?? "Former member"
}

export function TaskBoardPanel({ tasks, people, isLeader, shared, busy, loading, loadError, onAdd, onToggle, onRemove, onMove, onClose }: TaskBoardPanelProps) {
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [dueReset, setDueReset] = useState(0)
  const [assignee, setAssignee] = useState<RoomTaskAssignee>("everyone")
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (title.trim().length < 2) {
      setError("Add a task title of at least 2 characters.")
      return
    }
    const selected = new FormData(event.currentTarget).get("due")
    const due = typeof selected === "string" && selected ? new Date(selected) : null
    if (due && (!Number.isFinite(due.getTime()) || due.getTime() <= Date.now())) {
      setError("Choose a due date in the future.")
      return
    }
    setError(null)
    const accepted = await onAdd({ title, notes, assignee, due: due ? (shared ? due.toISOString() : String(selected).slice(0, 10)) : null })
    if (accepted === false) return
    setTitle("")
    setNotes("")
    setDueReset((current) => current + 1)
    setError(null)
  }

  return (
    <div
      role="dialog"
      aria-label="Group task board"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose()
      }}
      className="absolute inset-y-3 right-3 z-20 flex w-96 max-w-[94%] flex-col overflow-y-auto rounded-xl border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card shadow-lg"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 surface-dark:border-border px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800 surface-dark:text-foreground">
          <ClipboardList className="size-4 text-emerald-800 surface-dark:text-emerald-300" aria-hidden="true" />
          Group task board
          <Badge variant="secondary" className="bg-slate-100 surface-dark:bg-muted text-slate-600 surface-dark:text-muted-foreground">
            {isLeader ? "You are the leader" : "Group mate"}
          </Badge>
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close task board">
          <X aria-hidden="true" />
        </Button>
      </div>

      <p className="border-b border-slate-100 surface-dark:border-border bg-slate-50 surface-dark:bg-background px-3 py-2 text-xs leading-5 text-slate-600 surface-dark:text-muted-foreground">{shared ? "Tasks are shared with assignees. Each member tracks their own completion." : roomTasksNotice}</p>
      {loadError && <p role="alert" className="px-3 pt-2 text-xs text-destructive">{loadError}</p>}

      <ul aria-label="Group tasks" className="flex-1 space-y-2 p-3">
        {tasks.length === 0 && !loadError ? (
          <li className="rounded-lg border border-dashed border-slate-200 surface-dark:border-border p-4 text-center text-xs text-slate-500 surface-dark:text-muted-foreground">
            {loading ? "Loading tasks…" : isLeader ? "No tasks yet. Add the first task for your group below." : "No tasks assigned to you."}
          </li>
        ) : null}
        {tasks.map((task, index) => {
          const tickable = canTickTask(task)
          return (
            <li key={task.id} className="rounded-lg border border-slate-200 surface-dark:border-border p-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={task.done}
                  disabled={!tickable || busy}
                  onChange={() => onToggle(task.id)}
                  className="mt-1 size-4 accent-emerald-700"
                />
                <label htmlFor={`task-${task.id}`} className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${task.done ? "text-slate-400 surface-dark:text-muted-foreground line-through" : "text-slate-800 surface-dark:text-foreground"}`}>
                    {task.title}
                  </span>
                  {task.notes ? <span className="block text-xs text-slate-500 surface-dark:text-muted-foreground">{task.notes}</span> : null}
                  <span className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500 surface-dark:text-muted-foreground">
                    <Badge variant="outline" className="border-slate-200 surface-dark:border-border text-slate-600 surface-dark:text-muted-foreground">
                      {assigneeLabel(task.assignee, people)}
                    </Badge>
                    {task.due ? <span>Due {shared ? new Date(task.due).toLocaleDateString() : task.due}</span> : null}
                    {task.sample ? <span>Sample task</span> : null}
                    {!tickable ? <span>Only they can tick this</span> : null}
                  </span>
                </label>
                {isLeader ? (
                  <span className="flex shrink-0 flex-col">
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${task.title} up`} disabled={busy || index === 0} onClick={() => onMove(task.id, -1)}>
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${task.title} down`} disabled={busy || index === tasks.length - 1} onClick={() => onMove(task.id, 1)}>
                      <ArrowDown aria-hidden="true" />
                    </Button>
                  </span>
                ) : null}
                {isLeader ? (
                  <Button type="button" variant="ghost" size="icon-xs" aria-label={`Delete ${task.title}`} disabled={busy} onClick={() => onRemove(task.id)}>
                    <Trash2 aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {isLeader ? (
        <form
          className="space-y-2 border-t border-slate-100 surface-dark:border-border p-3"
          onSubmit={(event) => { void submit(event) }}
        >
          <label htmlFor="task-title" className="sr-only">
            Task title
          </label>
          <Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task for your group" maxLength={100} aria-invalid={error !== null} />
          <label htmlFor="task-notes" className="sr-only">
            Task notes
          </label>
          <Input id="task-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes (optional)" maxLength={200} />
          <Select value={assignee} onValueChange={(value) => { if (value) setAssignee(value) }}
            items={[{ value: "everyone", label: "Everyone" }, { value: "me", label: "Me" }, ...people.map((person) => ({ value: person.id, label: person.name }))]}>
            <SelectTrigger aria-label="Assign to" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="me">Me</SelectItem>
              {people.map((person) => <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <DateTimePicker key={dueReset} name="due" label="Due date" placeholder="Due date (optional)"
            dateOnly minToday defaultTime="23:59" />
          {error ? (
            <p role="alert" className="text-xs text-red-700 surface-dark:text-red-300">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="sm" disabled={busy} className="w-full">
            <Plus aria-hidden="true" />
            Add task
          </Button>
        </form>
      ) : (
        <p className="border-t border-slate-100 surface-dark:border-border px-3 py-2 text-xs text-slate-500 surface-dark:text-muted-foreground">
          Only the space leader can add or remove tasks. You can tick the tasks that are yours.
        </p>
      )}
    </div>
  )
}
