import { CircleCheck } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
      <DialogContent className="gap-7 px-6 py-10 text-center sm:max-w-lg sm:px-10">
        <DialogHeader className="items-center">
          <span className="mb-3 inline-flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CircleCheck aria-hidden="true" className="size-10" />
          </span>
          <DialogTitle className="mt-2 text-lg font-semibold text-slate-900">
            Congrats, you completed {subjectName}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">Every milestone in your personal study plan is done. Your progress is kept in this browser, separate from classroom results.</DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button nativeButton={false} role="link" render={<Link to="/students/subjects" />} className="bg-brand text-brand-foreground hover:bg-brand/90">Back to My Learning</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Keep learning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
