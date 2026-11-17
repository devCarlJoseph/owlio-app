import {
  BookOpenCheck,
  CircleCheck,
  CircleQuestionMark,
  Clock,
  FileText,
  type LucideIcon,
} from "lucide-react"

export type ClassworkStatus = "assigned" | "in-progress" | "submitted" | "released"

export type ClassworkType = "quiz" | "assignment" | "reading"

export type ClassworkRecord = {
  id: string
  title: string
  type: ClassworkType
  classroom: string
  educator: string
  dueDate: string
  points: number
  status: ClassworkStatus
  note: string
}

export type ClassworkStatusMeta = {
  label: string
  badge: string
}

export const classworkGuidance =
  "Classwork is assigned by your educator and stays inside the classroom. Your personal tasks remain separate from it."

export const classworkStorageNotice =
  "Sample classwork is for layout preview only. Assignments, submissions, and results are not connected to a service."

export const classworkStatusMeta: Record<ClassworkStatus, ClassworkStatusMeta> = {
  assigned: { label: "Assigned", badge: "border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background text-slate-600 surface-dark:text-muted-foreground" },
  "in-progress": { label: "In progress", badge: "bg-blue-50 surface-dark:bg-surface-blue-soft text-blue-700 surface-dark:text-blue-300" },
  submitted: { label: "Submitted", badge: "bg-blue-700 text-white" },
  released: { label: "Released", badge: "bg-slate-100 surface-dark:bg-muted text-slate-700 surface-dark:text-foreground" },
}

export const classworkTypeMeta: Record<ClassworkType, { label: string; icon: LucideIcon }> = {
  quiz: { label: "Quiz", icon: CircleQuestionMark },
  assignment: { label: "Assignment", icon: FileText },
  reading: { label: "Reading", icon: BookOpenCheck },
}

export const classworkFilterOptions = [
  { value: "all" as const, label: "All" },
  { value: "assigned" as const, label: "Assigned" },
  { value: "in-progress" as const, label: "In progress" },
  { value: "submitted" as const, label: "Submitted" },
  { value: "released" as const, label: "Released" },
]

export const classworkSummaryTiles = [
  { label: "Activities", icon: FileText },
  { label: "Waiting on you", icon: Clock },
  { label: "Submitted", icon: CircleCheck },
  { label: "Released results", icon: BookOpenCheck },
] as const

export const classworkTasksLink = {
  label: "Plan with personal tasks",
  description: "Your own study plans stay separate from assigned classwork.",
  href: "/students/tasks",
}

export const classworkClassroomsLink = {
  label: "Open classrooms",
  description: "Lessons and materials your educator published.",
  href: "/students/classrooms",
}

const dueDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function formatClassworkDueDate(value: string): string {
  if (value.length === 0) return "No due date"

  const due = new Date(`${value}T00:00:00`)
  if (Number.isNaN(due.getTime())) return "No due date"

  return `Due ${dueDateFormatter.format(due)}`
}

export function isClassworkOverdue(item: ClassworkRecord): boolean {
  if (item.status === "submitted" || item.status === "released" || item.dueDate.length === 0) {
    return false
  }

  const due = new Date(`${item.dueDate}T23:59:59`)
  return !Number.isNaN(due.getTime()) && due.getTime() < Date.now()
}

export function sortClasswork(items: ClassworkRecord[]): ClassworkRecord[] {
  const statusOrder: Record<ClassworkStatus, number> = {
    "in-progress": 0,
    assigned: 1,
    submitted: 2,
    released: 3,
  }

  return [...items].sort(
    (first, second) =>
      statusOrder[first.status] - statusOrder[second.status] || first.dueDate.localeCompare(second.dueDate)
  )
}

export const sampleClasswork: ClassworkRecord[] = []