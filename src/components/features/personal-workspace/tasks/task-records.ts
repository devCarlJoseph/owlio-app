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
    typeof task.priority === "string" &&
    typeof task.status === "string" &&
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

export function saveTasks(tasks: TaskRecord[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(tasksStorageKey, JSON.stringify(tasks))
  } catch {
    return
  }
}