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
  previewName?: string | null
}

export function JoinSpaceDialog({ open, onOpenChange, onSubmit, previewName }: JoinSpaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <JoinSpaceForm
          key={open ? "join-space-open" : "join-space-closed"}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
          previewName={previewName ?? null}
        />
      </DialogContent>
    </Dialog>
  )
}

function JoinSpaceForm({
  onCancel,
  onSubmit,
  previewName,
}: {
  onCancel: () => void
  onSubmit: (draft: JoinSpaceDraft) => void
  previewName: string | null
}) {
  const isPreview = previewName !== null
  const [draft, setDraft] = useState<JoinSpaceDraft>({ name: previewName ?? "", inviteCode: "" })
  const [nameError, setNameError] = useState<string | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)

  function handleSubmit() {
    const nextNameError = draft.name.trim().length < 3 ? "Add a space name of at least 3 characters." : null
    const nextCodeError =
      isPreview && draft.inviteCode.trim().length === 0
        ? "Enter a space code to unlock this preview space."
        : null

    setNameError(nextNameError)
    setCodeError(nextCodeError)
    if (nextNameError || nextCodeError) return

    onSubmit({ name: draft.name.trim(), inviteCode: draft.inviteCode.trim() })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {isPreview ? "Enter this space's code" : "Join a study space"}
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          {isPreview
            ? `"${previewName}" is a sample preview space. Unlocking it only adds it to this browser. `
            : ""}
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
            readOnly={isPreview}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "join-space-name-error" : undefined}
            placeholder="History Circle"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="join-space-name-error">{nameError}</FieldError>
        </Field>

        <Field data-invalid={codeError !== null}>
          <FieldLabel htmlFor="join-space-code" className="text-slate-700">
            Invite code or link
          </FieldLabel>
          <Input
            id="join-space-code"
            value={draft.inviteCode}
            onChange={(event) => setDraft((current) => ({ ...current, inviteCode: event.target.value }))}
            aria-invalid={codeError !== null}
            aria-describedby={codeError ? "join-space-code-hint join-space-code-error" : "join-space-code-hint"}
            placeholder="PHY-4821"
            className="border-slate-200 bg-slate-50"
          />
          <p id="join-space-code-hint" className="text-xs leading-5 text-slate-500">
            {studySpacesJoinHint}
          </p>
          <FieldError id="join-space-code-error">{codeError}</FieldError>
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSubmit}>
          <LogIn aria-hidden="true" />
          {isPreview ? "Unlock space" : "Join space"}
        </Button>
      </DialogFooter>
    </>
  )
}
