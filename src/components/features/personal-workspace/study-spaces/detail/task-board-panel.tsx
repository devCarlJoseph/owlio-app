import { useState } from "react"
import { ArrowDown, ArrowUp, ClipboardList, Plus, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SamplePerson } from "../space-roster"
import { roomTasksNotice, canTickTask, type RoomTask, type RoomTaskAssignee } from "./room-tasks"

type TaskBoardPanelProps = {
  tasks: RoomTask[]
  people: SamplePerson[]
  isLeader: boolean
  onAdd: (draft: { title: string; notes: string; due: string; assignee: RoomTaskAssignee }) => void
  onToggle: (taskId: string) => void
  onRemove: (taskId: string) => void
  onMove: (taskId: string, direction: -1 | 1) => void
  onClose: () => void
}

function assigneeLabel(assignee: RoomTaskAssignee, people: SamplePerson[]): string {
  if (assignee === "everyone") return "Everyone"
  if (assignee === "me") return "You"
  const person = people.find((entry) => entry.id === assignee)
  return person ? `${person.name} (sample)` : "Someone"
}

export function TaskBoardPanel({ tasks, people, isLeader, onAdd, onToggle, onRemove, onMove, onClose }: TaskBoardPanelProps) {
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [due, setDue] = useState("")
  const [assignee, setAssignee] = useState<RoomTaskAssignee>("everyone")
  const [error, setError] = useState<string | null>(null)

  function submit() {
    if (title.trim().length < 2) {
      setError("Add a task title of at least 2 characters.")
      return
    }
    onAdd({ title, notes, due, assignee })
    setTitle("")
    setNotes("")
    setDue("")
    setError(null)
  }

  return (
    <div
      role="dialog"
      aria-label="Group task board"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose()
      }}
      className="absolute inset-y-3 right-3 z-20 flex w-96 max-w-[94%] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <ClipboardList className="size-4 text-emerald-800" aria-hidden="true" />
          Group task board
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            {isLeader ? "You are the leader" : "Group mate"}
          </Badge>
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close task board">
          <X aria-hidden="true" />
        </Button>
      </div>

      <p className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">{roomTasksNotice}</p>

      <ul aria-label="Group tasks" className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {tasks.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
            {isLeader ? "No tasks yet. Add the first task for your group below." : "The leader has not set any tasks."}
          </li>
        ) : null}
        {tasks.map((task, index) => {
          const tickable = canTickTask(task)
          return (
            <li key={task.id} className="rounded-lg border border-slate-200 p-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={task.done}
                  disabled={!tickable}
                  onChange={() => onToggle(task.id)}
                  className="mt-1 size-4 accent-emerald-700"
                />
                <label htmlFor={`task-${task.id}`} className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${task.done ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {task.title}
                  </span>
                  {task.notes ? <span className="block text-xs text-slate-500">{task.notes}</span> : null}
                  <span className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      {assigneeLabel(task.assignee, people)}
                    </Badge>
                    {task.due ? <span>Due {task.due}</span> : null}
                    {task.sample ? <span>Sample task</span> : null}
                    {!tickable ? <span>Only they can tick this</span> : null}
                  </span>
                </label>
                {isLeader ? (
                  <span className="flex shrink-0 flex-col">
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${task.title} up`} disabled={index === 0} onClick={() => onMove(task.id, -1)}>
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`Move ${task.title} down`} disabled={index === tasks.length - 1} onClick={() => onMove(task.id, 1)}>
                      <ArrowDown aria-hidden="true" />
                    </Button>
                  </span>
                ) : null}
                {isLeader ? (
                  <Button type="button" variant="ghost" size="icon-xs" aria-label={`Delete ${task.title}`} onClick={() => onRemove(task.id)}>
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
          className="space-y-2 border-t border-slate-100 p-3"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <label htmlFor="task-title" className="sr-only">
            Task title
          </label>
          <Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task for your group" maxLength={100} aria-invalid={error !== null} />
          <label htmlFor="task-notes" className="sr-only">
            Task notes
          </label>
          <Input id="task-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes (optional)" maxLength={200} />
          <div className="flex gap-2">
            <label htmlFor="task-assignee" className="sr-only">
              Assign to
            </label>
            <select
              id="task-assignee"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="everyone">Everyone</option>
              <option value="me">Me</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} (sample)
                </option>
              ))}
            </select>
            <label htmlFor="task-due" className="sr-only">
              Due date
            </label>
            <input
              id="task-due"
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm"
            />
          </div>
          {error ? (
            <p role="alert" className="text-xs text-red-700">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="sm" className="w-full">
            <Plus aria-hidden="true" />
            Add task
          </Button>
        </form>
      ) : (
        <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
          Only the space leader can add or remove tasks. You can tick the tasks that are yours.
        </p>
      )}
    </div>
  )
}
