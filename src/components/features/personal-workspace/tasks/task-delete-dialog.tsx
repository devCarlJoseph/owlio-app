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