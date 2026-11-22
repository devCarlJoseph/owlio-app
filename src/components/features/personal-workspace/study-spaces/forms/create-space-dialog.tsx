import { useState } from "react"
import { Check, LayoutGrid, Minus, Plus, Users } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  defaultSpaceCapacity,
  maxSpaceCapacity,
  minSpaceCapacity,
  studySpaceKinds,
  type StudySpaceKind,
} from "../utils/study-spaces-records"
import { RoomPlanPreview } from "../ui/room-plan-preview"

export type SpaceDraft = {
  name: string
  about: string
  kind: StudySpaceKind
  capacity: number
}

type CreateSpaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: SpaceDraft) => void | Promise<void>
  accountSpace?: boolean
}

export function CreateSpaceDialog({ open, onOpenChange, onSubmit, accountSpace }: CreateSpaceDialogProps) {
  const [busy, setBusy] = useState(false)
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next) }}>
      <DialogContent overlayClassName="bg-slate-950/55" className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-3xl [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:hover:bg-white/15">
        <CreateSpaceForm
          key={open ? "create-space-open" : "create-space-closed"}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
          accountSpace={accountSpace}
          busy={busy}
          setBusy={setBusy}
        />
      </DialogContent>
    </Dialog>
  )
}

function CreateSpaceForm({ onCancel, onSubmit, accountSpace, busy, setBusy }: Pick<CreateSpaceDialogProps, "onSubmit" | "accountSpace"> & {
  onCancel: () => void
  busy: boolean
  setBusy: (busy: boolean) => void
}) {
  const [draft, setDraft] = useState<SpaceDraft>({
    name: "",
    about: "",
    kind: "collaborative",
    capacity: defaultSpaceCapacity,
  })
  const [nameError, setNameError] = useState<string | null>(null)
  const [capacityError, setCapacityError] = useState<string | null>(null)

  const [submitError, setSubmitError] = useState("")
  const layoutName = studySpaceKinds.find((kind) => kind.value === draft.kind)?.label

  async function handleSubmit() {
    if (busy) return
    const nextNameError = draft.name.trim().length < 3 ? "Add a space name of at least 3 characters." : null
    const nextCapacityError =
      !Number.isInteger(draft.capacity) || draft.capacity < minSpaceCapacity || draft.capacity > maxSpaceCapacity
        ? `Choose between ${minSpaceCapacity} and ${maxSpaceCapacity} seats.`
        : null

    setNameError(nextNameError)
    setCapacityError(nextCapacityError)
    if (nextNameError || nextCapacityError) return

    setBusy(true)
    setSubmitError("")
    try {
      await onSubmit({ ...draft, name: draft.name.trim(), about: draft.about.trim() })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not create this space."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void handleSubmit() }}>
      <DialogHeader className="border-b border-teal-900/15 bg-teal-950 px-5 py-6 pr-14 text-white sm:px-7">
        <span className="mb-1 grid size-9 place-items-center rounded-xl bg-white/15"><LayoutGrid className="size-4" aria-hidden="true" /></span>
        <DialogTitle className="text-2xl font-semibold tracking-tight">Create a study space</DialogTitle>
        <DialogDescription className="max-w-md text-teal-100">
          Set up a room for independent study or group work. {accountSpace ? "" : "This room stays on this device."}
          {accountSpace ? " You’ll get a study space code to share after you create it." : ""}
        </DialogDescription>
      </DialogHeader>

      <fieldset disabled={busy} className="grid min-w-0 gap-5 px-5 py-5 sm:px-7">
        <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
        <Field data-invalid={nameError !== null}>
          <FieldLabel htmlFor="space-name" className="text-slate-700 surface-dark:text-foreground">
            Space name
          </FieldLabel>
          <Input
            id="space-name"
            maxLength={120}
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "space-name-error" : undefined}
            placeholder="Physics Group"
            className="border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background"
          />
          <FieldError id="space-name-error">{nameError}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="space-about" className="text-slate-700 surface-dark:text-foreground">
            What is it about?
          </FieldLabel>
          <Textarea
            id="space-about"
            rows={2}
            maxLength={2000}
            value={draft.about}
            onChange={(event) => setDraft((current) => ({ ...current, about: event.target.value }))}
            placeholder="Weekly problem sets and past paper review."
            className="border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background"
          />
        </Field>

        </div>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-semibold">Room layout</legend>
          <div className="grid gap-2 min-[460px]:grid-cols-3">
            {studySpaceKinds.map((kind) => {
              const selected = draft.kind === kind.value
              return (
                <label
                  key={kind.value}
                  className={`relative grid cursor-pointer grid-cols-[4.25rem_1fr] items-center gap-x-3 rounded-xl border p-2.5 text-left transition-colors has-focus-visible:ring-2 has-focus-visible:ring-teal-600 has-focus-visible:ring-offset-2 min-[460px]:block ${
                    selected
                      ? "border-emerald-700 bg-emerald-50/50 surface-dark:bg-surface-emerald-soft/50"
                      : "border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card hover:border-slate-300 surface-dark:hover:border-border"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="room-layout"
                    aria-label={kind.label}
                    checked={selected}
                    onChange={() => setDraft((current) => ({ ...current, kind: kind.value }))}
                  />
                  <span className="relative col-start-1 row-span-3 block overflow-hidden rounded-md bg-slate-100 surface-dark:bg-muted">
                    <RoomPlanPreview
                      kind={kind.value}
                      capacity={maxSpaceCapacity}
                      className="h-12 w-full min-[460px]:h-21"
                    />
                    {selected ? (
                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                    ) : null}
                  </span>
                  <span className="block text-sm font-medium min-[460px]:mt-2 text-slate-900 surface-dark:text-foreground">{kind.label}</span>
                  <span className="mt-0.5 block text-xs leading-4 text-slate-600 surface-dark:text-muted-foreground">{kind.description}</span>
                  <span className="mt-1 block text-[11px] text-slate-500 surface-dark:text-muted-foreground">
                    Up to {maxSpaceCapacity} seats
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <Field data-invalid={capacityError !== null} className="rounded-xl border bg-muted/30 p-3 sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-5">
          <span id="space-capacity-label" className="text-sm font-medium text-slate-700 surface-dark:text-foreground">
            Seats in the room
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:col-start-1">
            <div
              role="group"
              aria-labelledby="space-capacity-label"
              aria-describedby="space-capacity-hint space-capacity-error"
              className="flex items-center overflow-hidden rounded-lg border border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Decrease seats"
                disabled={draft.capacity <= minSpaceCapacity}
                onClick={() =>
                  setDraft((current) => ({ ...current, capacity: current.capacity - 1 }))
                }
              >
                <Minus aria-hidden="true" />
              </Button>
              <output
                aria-live="polite"
                className="w-16 text-center text-sm font-medium tabular-nums text-slate-800 surface-dark:text-foreground"
              >
                {draft.capacity} seats
              </output>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Increase seats"
                disabled={draft.capacity >= maxSpaceCapacity}
                onClick={() =>
                  setDraft((current) => ({ ...current, capacity: current.capacity + 1 }))
                }
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
            <p id="space-capacity-hint" className="flex-1 text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground">
              {minSpaceCapacity}–{maxSpaceCapacity} seats{accountSpace ? " · Shared room layout" : ""}
            </p>
          </div>
          <figure className="overflow-hidden rounded-lg bg-teal-100/60 surface-dark:bg-muted sm:col-start-2 sm:row-span-3 sm:row-start-1">
            <RoomPlanPreview kind={draft.kind} capacity={draft.capacity} className="h-28 w-full" />
            <figcaption className="bg-background/80 px-2 py-1 text-center text-xs text-muted-foreground">
              {layoutName} · {draft.capacity} seats
            </figcaption>
          </figure>
          <FieldError id="space-capacity-error" className="sm:col-start-1">{capacityError}</FieldError>
        </Field>
        {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
      </fieldset>

      <DialogFooter className="flex-row justify-end border-t bg-muted/30 px-5 py-3 sm:px-7">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          <Users aria-hidden="true" />
          {busy ? "Creating…" : "Create space"}
        </Button>
      </DialogFooter>
    </form>
  )
}

