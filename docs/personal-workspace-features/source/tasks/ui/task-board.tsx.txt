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
