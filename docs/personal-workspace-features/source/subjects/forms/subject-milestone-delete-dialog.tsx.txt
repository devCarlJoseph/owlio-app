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
import type { SubjectMilestone } from "./subject-records"

type SubjectMilestoneDeleteDialogProps = {
  open: boolean
  milestone: SubjectMilestone | null
  onOpenChange: (open: boolean) => void
  onConfirm: (milestone: SubjectMilestone) => void
}

export function SubjectMilestoneDeleteDialog({
  open,
  milestone,
  onOpenChange,
  onConfirm,
}: SubjectMilestoneDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Remove this milestone?
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {milestone
              ? `“${milestone.title}” will be removed from this subject.`
              : "This milestone will be removed."}{" "}
            You can bring it back with “Undo removed milestone”.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep milestone
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (!milestone) return
              onConfirm(milestone)
            }}
          >
            <Trash aria-hidden="true" />
            Remove milestone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
