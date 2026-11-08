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
import type { SubjectRecord } from "./subject-records"

type SubjectDeleteDialogProps = {
  open: boolean
  subject: SubjectRecord | null
  onOpenChange: (open: boolean) => void
  onConfirm: (subject: SubjectRecord) => void
}

export function SubjectDeleteDialog({
  open,
  subject,
  onOpenChange,
  onConfirm,
}: SubjectDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Delete this subject?
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {subject
              ? `“${subject.name}” will be removed from this browser.`
              : "This subject will be removed."}{" "}
            Your notes and tasks are not deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep subject
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (!subject) return
              onConfirm(subject)
            }}
          >
            <Trash aria-hidden="true" />
            Delete subject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
