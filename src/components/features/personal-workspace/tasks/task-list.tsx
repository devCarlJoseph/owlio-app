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
