import { Pencil, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  formatTaskDueDate,
  getTaskPriority,
  getTaskStatus,
  isTaskOverdue,
  type TaskRecord,
} from "./task-records"

type TaskDetailDialogProps = {
  open: boolean
  task: TaskRecord | null
  onOpenChange: (open: boolean) => void
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
}

export function TaskDetailDialog({ open, task, onOpenChange, onEdit, onDelete }: TaskDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {task ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">{task.title}</DialogTitle>
              <DialogDescription className="text-slate-600">
                {isTaskOverdue(task) ? "Overdue · " : ""}
                {formatTaskDueDate(task)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {task.subject.length > 0 ? (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                    {task.subject}
                  </Badge>
                ) : null}
                <Badge variant="secondary" className={getTaskPriority(task.priority).badge}>
                  {getTaskPriority(task.priority).label} priority
                </Badge>
                <Badge variant="outline" className={getTaskStatus(task.status).badge}>
                  {getTaskStatus(task.status).label}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Personal notes</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {task.notes.length > 0
                    ? task.notes
                    : "No personal notes were added to this task."}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => onEdit(task)}>
                <Pencil aria-hidden="true" />
                Edit task
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onDelete(task)}
                className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
              >
                <Trash aria-hidden="true" />
                Delete task
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">Task unavailable</DialogTitle>
              <DialogDescription className="text-slate-600">
                This task is no longer in your list.
              </DialogDescription>
            </DialogHeader>
            <Badge variant="outline" className="w-fit border-slate-200 bg-slate-50 text-slate-600">
              Removed
            </Badge>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}