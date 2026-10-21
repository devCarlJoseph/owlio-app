import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { SubjectMilestone } from "./subject-records"

type SubjectMilestoneDialogProps = {
  open: boolean
  milestone: SubjectMilestone | null
  onOpenChange: (open: boolean) => void
  onSubmit: (title: string) => void
}

export function SubjectMilestoneDialog({
  open,
  milestone,
  onOpenChange,
  onSubmit,
}: SubjectMilestoneDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <SubjectMilestoneForm
          key={milestone?.id ?? "new-milestone"}
          milestone={milestone}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

type SubjectMilestoneFormProps = {
  milestone: SubjectMilestone | null
  onCancel: () => void
  onSubmit: (title: string) => void
}

function SubjectMilestoneForm({
  milestone,
  onCancel,
  onSubmit,
}: SubjectMilestoneFormProps) {
  const [title, setTitle] = useState(milestone?.title ?? "")
  const [titleError, setTitleError] = useState<string | null>(null)

  function handleSubmit() {
    const trimmedTitle = title.trim()
    const nextTitleError = trimmedTitle.length < 2 ? "Give the milestone a name." : null

    setTitleError(nextTitleError)
    if (nextTitleError) return

    onSubmit(trimmedTitle)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {milestone ? "Edit milestone" : "Add milestone"}
        </DialogTitle>
      </DialogHeader>

      <Field data-invalid={titleError !== null}>
        <FieldLabel htmlFor="milestone-title" className="text-slate-700">
          Milestone
        </FieldLabel>
        <Input
          id="milestone-title"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          aria-invalid={titleError !== null}
          aria-describedby={titleError ? "milestone-title-error" : undefined}
          placeholder="e.g. Newton's laws of motion"
          autoComplete="off"
          className="border-slate-200 bg-slate-50"
        />
        <FieldError id="milestone-title-error">{titleError}</FieldError>
      </Field>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-blue-700 text-white hover:bg-blue-800"
          onClick={handleSubmit}
        >
          {milestone ? "Save milestone" : "Add milestone"}
        </Button>
      </DialogFooter>
    </>
  )
}
