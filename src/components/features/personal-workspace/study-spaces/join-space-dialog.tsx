import { useState } from "react"
import { LogIn } from "lucide-react"
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
import { studySpacesJoinHint } from "./study-spaces-records"

export type JoinSpaceDraft = {
  name: string
  inviteCode: string
}

type JoinSpaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: JoinSpaceDraft) => void
}

export function JoinSpaceDialog({ open, onOpenChange, onSubmit }: JoinSpaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <JoinSpaceForm
          key={open ? "join-space-open" : "join-space-closed"}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function JoinSpaceForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: (draft: JoinSpaceDraft) => void
}) {
  const [draft, setDraft] = useState<JoinSpaceDraft>({ name: "", inviteCode: "" })
  const [nameError, setNameError] = useState<string | null>(null)

  function handleSubmit() {
    const nextNameError = draft.name.trim().length < 3 ? "Add a space name of at least 3 characters." : null

    setNameError(nextNameError)
    if (nextNameError) return

    onSubmit({ name: draft.name.trim(), inviteCode: draft.inviteCode.trim() })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">Join a study space</DialogTitle>
        <DialogDescription className="text-slate-600">
          A study space is for peer collaboration. It is not an official classroom and cannot hold grades or
          attendance.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={nameError !== null}>
          <FieldLabel htmlFor="join-space-name" className="text-slate-700">
            Space name
          </FieldLabel>
          <Input
            id="join-space-name"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "join-space-name-error" : undefined}
            placeholder="History Circle"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="join-space-name-error">{nameError}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="join-space-code" className="text-slate-700">
            Invite code or link
          </FieldLabel>
          <Input
            id="join-space-code"
            value={draft.inviteCode}
            onChange={(event) => setDraft((current) => ({ ...current, inviteCode: event.target.value }))}
            aria-describedby="join-space-code-hint"
            placeholder="PHY-4821"
            className="border-slate-200 bg-slate-50"
          />
          <p id="join-space-code-hint" className="text-xs leading-5 text-slate-500">
            {studySpacesJoinHint}
          </p>
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSubmit}>
          <LogIn aria-hidden="true" />
          Join space
        </Button>
      </DialogFooter>
    </>
  )
}