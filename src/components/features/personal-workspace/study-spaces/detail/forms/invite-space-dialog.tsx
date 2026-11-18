import { useState } from "react"
import { Copy, UserPlus } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/services/api/api-error"
import { issueStudySpaceInvitation } from "@/services/api/study-space.service"

export function InviteSpaceDialog({ spaceId, onClose }: { spaceId: string; onClose: () => void }) {
  const [recipientId, setRecipientId] = useState("")
  const [invitation, setInvitation] = useState<{ token: string; expiresAt: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [copyStatus, setCopyStatus] = useState("")

  async function issueCode() {
    const recipient = z.uuid().safeParse(recipientId.trim())
    if (!recipient.success) {
      setError("Enter the account ID the student shared with you.")
      return
    }
    setError("")
    setBusy(true)
    try {
      setInvitation(await issueStudySpaceInvitation(spaceId, recipient.data))
    } catch (cause) {
      setError(getApiErrorMessage(cause, "An invitation could not be created for this account."))
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    if (!invitation) return
    try {
      await navigator.clipboard.writeText(invitation.token)
      setCopyStatus("Invitation code copied.")
    } catch {
      setCopyStatus("Select the invitation code and copy it manually.")
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a student</DialogTitle>
          <DialogDescription>
            Ask the student for their account ID from <strong>Study Spaces → Join by code</strong>. Each code works once for that account.
          </DialogDescription>
        </DialogHeader>
        {invitation ? (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="generated-space-code">Invitation code</FieldLabel>
              <div className="flex gap-2">
                <Input id="generated-space-code" value={invitation.token} readOnly onFocus={(event) => event.target.select()} />
                <Button type="button" size="icon" variant="outline" aria-label="Copy invitation code" onClick={() => void copyCode()}><Copy aria-hidden="true" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Expires {new Date(invitation.expiresAt).toLocaleString()}.</p>
              {copyStatus && <p role="status" className="text-xs text-muted-foreground">{copyStatus}</p>}
            </Field>
            <DialogFooter><Button type="button" onClick={onClose}>Done</Button></DialogFooter>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!busy) void issueCode() }}>
            <Field>
              <FieldLabel htmlFor="invite-recipient-id">Student account ID</FieldLabel>
              <Input id="invite-recipient-id" value={recipientId} onChange={(event) => setRecipientId(event.target.value)} disabled={busy} autoComplete="off" />
            </Field>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Close</Button>
              <Button type="submit" disabled={busy || !recipientId.trim()}><UserPlus aria-hidden="true" />{busy ? "Generating…" : "Generate code"}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
