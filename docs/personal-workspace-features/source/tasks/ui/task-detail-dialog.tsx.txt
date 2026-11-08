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
