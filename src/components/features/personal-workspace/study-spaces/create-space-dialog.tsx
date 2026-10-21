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
import {
  defaultSpaceCapacity,
  maxSpaceCapacity,
  minSpaceCapacity,
  studySpaceKinds,
  type StudySpaceKind,
} from "./study-spaces-records"

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
            {studySpaceKinds.map((kind) => (
              <button
                key={kind.value}
                type="button"
                role="radio"
                aria-checked={draft.kind === kind.value}
                onClick={() => setDraft((current) => ({ ...current, kind: kind.value }))}
                className={`rounded-xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  draft.kind === kind.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="block text-sm font-medium text-slate-900">{kind.label}</span>
                <span className="mt-1 block text-xs leading-4 text-slate-600">{kind.description}</span>
              </button>
            ))}
          </div>
        </div>

        <Field data-invalid={capacityError !== null}>
          <FieldLabel htmlFor="space-capacity" className="text-slate-700">
            Seats in the room
          </FieldLabel>
          <Input
            id="space-capacity"
            type="number"
            min={minSpaceCapacity}
            max={maxSpaceCapacity}
            value={draft.capacity}
            onChange={(event) =>
              setDraft((current) => ({ ...current, capacity: Number(event.target.value) }))
            }
            aria-invalid={capacityError !== null}
            aria-describedby="space-capacity-hint space-capacity-error"
            className="w-28 border-slate-200 bg-slate-50"
          />
          <p id="space-capacity-hint" className="text-xs leading-5 text-slate-500">
            {minSpaceCapacity}–{maxSpaceCapacity} seats. This sets how many desks or chairs appear in the room
            preview.
          </p>
          <FieldError id="space-capacity-error">{capacityError}</FieldError>
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

