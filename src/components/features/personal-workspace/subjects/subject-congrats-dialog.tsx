import { PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SubjectCongratsDialogProps = {
  open: boolean
  subjectName: string
  onOpenChange: (open: boolean) => void
}

export function SubjectCongratsDialog({
  open,
  subjectName,
  onOpenChange,
}: SubjectCongratsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <PartyPopper aria-hidden="true" className="size-6" />
          </span>
          <DialogTitle className="mt-2 text-lg font-semibold text-slate-900">
            Congrats, you completed {subjectName}
          </DialogTitle>
          <p className="text-sm leading-6 text-slate-600">
            Every milestone in this subject is done. Add a new milestone whenever you are ready to
            keep going.
          </p>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            className="bg-blue-700 text-white hover:bg-blue-800"
            onClick={() => onOpenChange(false)}
          >
            Keep learning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
