import { useState } from "react"
import { Copy, LogIn } from "lucide-react"
import { getApiErrorMessage } from "@/services/api/api-error"
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
import { studySpacesJoinHint } from "../utils/study-spaces-records"
import { isStudySpaceCode, isStudySpaceInvitationToken } from "../utils/study-space-code"

export type JoinSpaceDraft = {
  name: string
  inviteCode: string
}

type JoinSpaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: JoinSpaceDraft) => void | Promise<void>
  previewName?: string | null
  accountId?: string
}

export function JoinSpaceDialog({ open, onOpenChange, onSubmit, previewName, accountId }: JoinSpaceDialogProps) {
  const [busy, setBusy] = useState(false)
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next) }}>
      <DialogContent className="sm:max-w-lg">
        {accountId ? <JoinByCodeForm key={String(open)} accountId={accountId} busy={busy} setBusy={setBusy} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} /> : <JoinSpaceForm
          key={open ? "join-space-open" : "join-space-closed"}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
          previewName={previewName ?? null}
        />}
      </DialogContent>
    </Dialog>
  )
}

function JoinByCodeForm({ accountId, busy, setBusy, onSubmit, onCancel }: {
  accountId: string
  busy: boolean
  setBusy: (busy: boolean) => void
  onSubmit: JoinSpaceDialogProps["onSubmit"]
  onCancel: () => void
}) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [copyStatus, setCopyStatus] = useState("")

  async function submit() {
    const enteredCode = code.trim()
    if (!isStudySpaceCode(enteredCode) && !isStudySpaceInvitationToken(enteredCode)) {
      setError("Enter an OWLIO-SPS code or paste a personal invitation.")
      return
    }
    setError("")
    setBusy(true)
    try {
      await onSubmit({ name: "", inviteCode: enteredCode })
    } catch (cause) {
      setError(getApiErrorMessage(cause, "This code could not be accepted."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!busy) void submit() }}>
      <DialogHeader>
        <DialogTitle>Join a study space</DialogTitle>
        <DialogDescription>Enter the room’s OWLIO-SPS code or paste a personal invitation from the owner.</DialogDescription>
      </DialogHeader>
      <Field>
        <FieldLabel htmlFor="account-space-code">Invitation code</FieldLabel>
        <Input id="account-space-code" value={code} onChange={(event) => setCode(event.target.value)} disabled={busy} autoComplete="off" placeholder="OWLIO-SPS-XXXX" />
      </Field>
      <Field className="rounded-lg border bg-muted/30 p-3">
        <FieldLabel htmlFor="study-space-account-id">Your account ID</FieldLabel>
        <p className="text-xs text-muted-foreground">Share this ID with a room owner so they can create a code for you.</p>
        <div className="flex gap-2">
          <Input id="study-space-account-id" value={accountId} readOnly onFocus={(event) => event.target.select()} />
          <Button type="button" size="icon" variant="outline" aria-label="Copy your account ID" onClick={() => {
            void navigator.clipboard?.writeText(accountId).then(() => setCopyStatus("Account ID copied."), () => setCopyStatus("Select the account ID and copy it manually."))
            if (!navigator.clipboard) setCopyStatus("Select the account ID and copy it manually.")
          }}><Copy aria-hidden="true" /></Button>
        </div>
        {copyStatus && <p role="status" className="text-xs text-muted-foreground">{copyStatus}</p>}
      </Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" disabled={busy || !code.trim()}><LogIn aria-hidden="true" />{busy ? "Joining…" : "Join space"}</Button>
      </DialogFooter>
    </form>
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
        <DialogTitle className="text-lg font-semibold text-slate-900 surface-dark:text-foreground">
          {isPreview ? "Enter this space's code" : "Join a study space"}
        </DialogTitle>
        <DialogDescription className="text-slate-600 surface-dark:text-muted-foreground">
          {isPreview
            ? `"${previewName}" is a sample preview space. Unlocking it only adds it to this browser. `
            : ""}
          A study space is for peer collaboration. It is not an official classroom and cannot hold grades or
          attendance.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={nameError !== null}>
          <FieldLabel htmlFor="join-space-name" className="text-slate-700 surface-dark:text-foreground">
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
            className="border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background"
          />
          <FieldError id="join-space-name-error">{nameError}</FieldError>
        </Field>

        <Field data-invalid={codeError !== null}>
          <FieldLabel htmlFor="join-space-code" className="text-slate-700 surface-dark:text-foreground">
            Invite code or link
          </FieldLabel>
          <Input
            id="join-space-code"
            value={draft.inviteCode}
            onChange={(event) => setDraft((current) => ({ ...current, inviteCode: event.target.value }))}
            aria-invalid={codeError !== null}
            aria-describedby={codeError ? "join-space-code-hint join-space-code-error" : "join-space-code-hint"}
            placeholder="PHY-4821"
            className="border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background"
          />
          <p id="join-space-code-hint" className="text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground">
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
