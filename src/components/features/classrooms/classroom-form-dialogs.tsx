import type { FormEvent, RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type CreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  pending: boolean
  error: string
  finalFocus?: () => HTMLElement | boolean
}

export function ClassroomCreateDialog({ open, onOpenChange, onSubmit, pending, error, finalFocus }: CreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent finalFocus={finalFocus} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a classroom</DialogTitle>
          <DialogDescription>Create a connected class record and generate a student invite code.</DialogDescription>
        </DialogHeader>
        <form id="create-class-form" onSubmit={onSubmit} aria-busy={pending} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="class-name">Classroom name</Label>
            <Input id="class-name" name="class-name" required maxLength={80} placeholder="e.g. Foundations of Biology" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="class-subject">Subject or learning focus</Label>
            <Input id="class-subject" name="class-subject" required maxLength={80} placeholder="e.g. Life science" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="class-description">Description</Label>
            <Textarea id="class-description" name="class-description" maxLength={500} placeholder="What will learners explore in this class?" />
          </div>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Discard</Button>
          <Button type="submit" form="create-class-form" disabled={pending}>{pending ? "Creating…" : "Create classroom"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type JoinDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  code: string
  onCodeChange: (code: string) => void
  joining: boolean
  error: string
  disclosure: string
  inputRef: RefObject<HTMLInputElement | null>
  finalFocus?: () => HTMLElement | boolean
}

export function ClassroomJoinDialog({ open, onOpenChange, onSubmit, code, onCodeChange, joining, error, disclosure, inputRef, finalFocus }: JoinDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="join-class-panel" finalFocus={finalFocus} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Join a classroom</DialogTitle>
          <DialogDescription>Enter an invite code shared by the educator.</DialogDescription>
        </DialogHeader>
        <form id="join-class-form" onSubmit={onSubmit} aria-busy={joining} className="grid gap-2">
          <Label htmlFor="class-join-code">Classroom invite code</Label>
          <Input
            id="class-join-code"
            ref={inputRef}
            value={code}
            onChange={(event) => onCodeChange(event.currentTarget.value)}
            autoComplete="off"
            disabled={joining}
            placeholder="OWLIO-0123ABCDEF"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "join-disclosure join-status" : "join-disclosure"}
          />
          {error && <p id="join-status" role="alert" className="text-sm text-rose-700">{error}</p>}
          <p id="join-disclosure" className="text-xs leading-5 text-slate-500">{disclosure}</p>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Discard</Button>
          <Button type="submit" form="join-class-form" disabled={!code.trim() || joining}>{joining ? "Joining…" : "Join class"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
