import { useState } from "react"
import { Check, Minus, Plus, Users } from "lucide-react"
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
} from "./study-spaces-records"
import { RoomPlanPreview } from "./room-plan-preview"

export type SpaceDraft = {
  name: string
  about: string
  kind: StudySpaceKind
  capacity: number
}

type CreateSpaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: SpaceDraft) => void
}

export function CreateSpaceDialog({ open, onOpenChange, onSubmit }: CreateSpaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
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
  const [draft, setDraft] = useState<SpaceDraft>({
    name: "",
    about: "",
    kind: "collaborative",
    capacity: defaultSpaceCapacity,
  })
  const [nameError, setNameError] = useState<string | null>(null)
  const [capacityError, setCapacityError] = useState<string | null>(null)

  function handleSubmit() {
    const nextNameError = draft.name.trim().length < 3 ? "Add a space name of at least 3 characters." : null
    const nextCapacityError =
      !Number.isInteger(draft.capacity) || draft.capacity < minSpaceCapacity || draft.capacity > maxSpaceCapacity
        ? `Choose between ${minSpaceCapacity} and ${maxSpaceCapacity} seats.`
        : null

    setNameError(nextNameError)
    setCapacityError(nextCapacityError)
    if (nextNameError || nextCapacityError) return

    onSubmit({
      name: draft.name.trim(),
      about: draft.about.trim(),
      kind: draft.kind,
      capacity: draft.capacity,
    })
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

        <div role="radiogroup" aria-label="Room type" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Room type</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {studySpaceKinds.map((kind) => {
              const selected = draft.kind === kind.value
              return (
                <button
                  key={kind.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDraft((current) => ({ ...current, kind: kind.value }))}
                  className={`rounded-xl border p-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                    selected
                      ? "border-emerald-700 bg-emerald-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="relative block overflow-hidden rounded-lg border border-slate-200">
                    <RoomPlanPreview
                      kind={kind.value}
                      capacity={maxSpaceCapacity}
                      className="h-24 w-full"
                    />
                    {selected ? (
                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-2 block text-sm font-medium text-slate-900">{kind.label}</span>
                  <span className="mt-0.5 block text-xs leading-4 text-slate-600">{kind.description}</span>
                  <span className="mt-1 block text-[11px] text-slate-500">
                    Up to {maxSpaceCapacity} seats
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <Field data-invalid={capacityError !== null}>
          <span id="space-capacity-label" className="text-sm font-medium text-slate-700">
            Seats in the room
          </span>
          <div className="flex items-center gap-3">
            <div
              role="group"
              aria-labelledby="space-capacity-label"
              aria-describedby="space-capacity-hint space-capacity-error"
              className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
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
                className="w-16 text-center text-sm font-medium tabular-nums text-slate-800"
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
            <p id="space-capacity-hint" className="flex-1 text-xs leading-5 text-slate-500">
              {minSpaceCapacity}–{maxSpaceCapacity} seats. The plan below shows the layout you will get.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <RoomPlanPreview kind={draft.kind} capacity={draft.capacity} className="h-36 w-full" />
          </div>
          <FieldError id="space-capacity-error">{capacityError}</FieldError>
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className="bg-emerald-800 text-white hover:bg-emerald-700" onClick={handleSubmit}>
          <Users aria-hidden="true" />
          Create space
        </Button>
      </DialogFooter>
    </>
  )
}

