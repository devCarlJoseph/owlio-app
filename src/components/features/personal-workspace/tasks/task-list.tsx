import { CalendarDays, Circle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatTaskDueDate,
  getTaskPriority,
  getTaskStatus,
  isTaskOverdue,
  type TaskRecord,
} from "./task-records"

function TaskListItem({
  task,
  onOpen,
}: {
  task: TaskRecord
  onOpen: (task: TaskRecord) => void
}) {
  const priority = getTaskPriority(task.priority)
  const status = getTaskStatus(task.status)
  const StatusIcon = status.icon ?? Circle
  const isDone = task.status === "done"
  const isOverdue = isTaskOverdue(task)

  return (
    <Card size="sm" className="relative h-full border border-slate-200 bg-white shadow-sm ring-0">
      <CardContent className="h-full gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4
              className={`truncate text-base font-semibold ${isDone ? "text-slate-500 line-through" : "text-slate-900"}`}
            >
              {task.title}
            </h4>
            <p className={`mt-0.5 text-xs ${isOverdue ? "font-medium text-destructive" : "text-slate-500"}`}>
              {isOverdue ? "Overdue · " : ""}
              {formatTaskDueDate(task)}
            </p>
          </div>
          <Badge variant="outline" className={`shrink-0 ${status.badge}`}>
            <StatusIcon aria-hidden="true" />
            {status.label}
          </Badge>
        </div>

        {task.notes.length > 0 ? (
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">{task.notes}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2">
          {task.subject.length > 0 ? (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
              <CalendarDays aria-hidden="true" />
              {task.subject}
            </Badge>
          ) : null}
          <Badge variant="secondary" className={priority.badge}>
            {priority.label} priority
          </Badge>
        </div>

        <button
          type="button"
          onClick={() => onOpen(task)}
          className="absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span className="sr-only">Open task {task.title}</span>
        </button>
      </CardContent>
    </Card>
  )
}

type TaskListProps = {
  tasks: TaskRecord[]
  isFiltered: boolean
  onCreate: () => void
  onOpen: (task: TaskRecord) => void
  onClearFilters: () => void
}

export function TaskList({ tasks, isFiltered, onCreate, onOpen, onClearFilters }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
        <p className="text-sm font-semibold text-slate-900">
          {isFiltered ? "No tasks match this view." : "No tasks yet."}
        </p>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {isFiltered
            ? "Try another status or clear the filters to see every task."
            : "Add your first personal task to plan your own study work."}
        </p>
        <button
          type="button"
          onClick={isFiltered ? onClearFilters : onCreate}
          className="mt-4 inline-flex h-8 items-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 outline-none transition-colors hover:bg-blue-100 hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {isFiltered ? "Clear filters" : "Create a task"}
        </button>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskListItem task={task} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  )
}