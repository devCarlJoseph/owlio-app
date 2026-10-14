import { useState } from "react"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export type SpaceDraft = {
  name: string
  about: string
}

type CreateSpaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: SpaceDraft) => void
}

export function CreateSpaceDialog({ open, onOpenChange, onSubmit }: CreateSpaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <CreateSpaceForm
          key={open ? "create-space-open" : "create-space-closed"}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function CreateSpaceForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (draft: SpaceDraft) => void }) {
  const [draft, setDraft] = useState<SpaceDraft>({ name: "", about: "" })
  const [nameError, setNameError] = useState<string | null>(null)

  function handleSubmit() {
    const nextNameError = draft.name.trim().length < 3 ? "Add a space name of at least 3 characters." : null

    setNameError(nextNameError)
    if (nextNameError) return

    onSubmit({ name: draft.name.trim(), about: draft.about.trim() })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">Create a study space</DialogTitle>
        <DialogDescription className="text-slate-600">
          A study space is for peer collaboration. It is not an official classroom and cannot hold grades or
          attendance.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={nameError !== null}>
          <FieldLabel htmlFor="space-name" className="text-slate-700">
            Space name
          </FieldLabel>
          <Input
            id="space-name"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "space-name-error" : undefined}
            placeholder="Physics Group"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="space-name-error">{nameError}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="space-about" className="text-slate-700">
            What is it about?
          </FieldLabel>
          <Textarea
            id="space-about"
            rows={3}
            value={draft.about}
            onChange={(event) => setDraft((current) => ({ ...current, about: event.target.value }))}
            placeholder="Weekly problem sets and past paper review."
            className="border-slate-200 bg-slate-50"
          />
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSubmit}>
          <Users aria-hidden="true" />
          Create space
        </Button>
      </DialogFooter>
    </>
  )
}

