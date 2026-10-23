import { useState } from "react"
import { Link } from "react-router"
import { UserRound } from "lucide-react"
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
import type { StudySpaceCharacter } from "../study-spaces-records"

const BODY_COLORS = [
  { value: "#2563eb", label: "Blue" },
  { value: "#16a34a", label: "Green" },
  { value: "#d97706", label: "Amber" },
  { value: "#dc2626", label: "Red" },
  { value: "#7c3aed", label: "Purple" },
  { value: "#0891b2", label: "Cyan" },
] as const

const ACCENT_COLORS = [
  { value: "#f59e0b", label: "Gold" },
  { value: "#f8fafc", label: "White" },
  { value: "#0f172a", label: "Slate" },
  { value: "#ec4899", label: "Pink" },
  { value: "#22d3ee", label: "Sky" },
  { value: "#a3e635", label: "Lime" },
] as const

type CharacterDraft = Pick<StudySpaceCharacter, "name" | "bodyColor" | "accentColor">

type CharacterDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  required: boolean
  initial: StudySpaceCharacter | null
  onSubmit: (draft: CharacterDraft) => void
}

export function CharacterDialog({ open, onOpenChange, required, initial, onSubmit }: CharacterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={required ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!required}>
        <CharacterForm
          key={`${open ? "open" : "closed"}-${initial?.createdAt ?? "new"}`}
          required={required}
          initial={initial}
          onCancel={required ? undefined : () => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function ColorSwatch({
  color,
  label,
  selected,
  onSelect,
}: {
  color: string
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onSelect}
      className={`size-8 rounded-full border-2 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        selected ? "scale-110 border-slate-900" : "border-transparent hover:scale-105"
      }`}
      style={{ backgroundColor: color }}
    />
  )
}

function CharacterForm({
  required,
  initial,
  onCancel,
  onSubmit,
}: {
  required: boolean
  initial: StudySpaceCharacter | null
  onCancel?: () => void
  onSubmit: (draft: CharacterDraft) => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [bodyColor, setBodyColor] = useState<string>(initial?.bodyColor ?? BODY_COLORS[0].value)
  const [accentColor, setAccentColor] = useState<string>(initial?.accentColor ?? ACCENT_COLORS[0].value)
  const [nameError, setNameError] = useState<string | null>(null)

  function handleSubmit() {
    const nextError = name.trim().length < 2 ? "Add a display name of at least 2 characters." : null

    setNameError(nextError)
    if (nextError) return

    onSubmit({ name: name.trim(), bodyColor, accentColor })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {required ? "Create your character" : "Edit your character"}
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          Your character only appears in this browser preview. It is not shown to other students.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={nameError !== null}>
          <FieldLabel htmlFor="character-name" className="text-slate-700">
            Display name
          </FieldLabel>
          <Input
            id="character-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "character-name-error" : undefined}
            placeholder="Alex"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="character-name-error">{nameError}</FieldError>
        </Field>

        <div role="radiogroup" aria-label="Body color" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Body color</span>
          <div className="flex flex-wrap gap-2">
            {BODY_COLORS.map((color) => (
              <ColorSwatch
                key={color.value}
                color={color.value}
                label={color.label}
                selected={bodyColor === color.value}
                onSelect={() => setBodyColor(color.value)}
              />
            ))}
          </div>
        </div>

        <div role="radiogroup" aria-label="Accent color" className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Accent color</span>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => (
              <ColorSwatch
                key={color.value}
                color={color.value}
                label={color.label}
                selected={accentColor === color.value}
                onSelect={() => setAccentColor(color.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        {required ? (
          <Button nativeButton={false} variant="outline" render={<Link to="/students/study-spaces" />}>
            Back to spaces
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSubmit}>
          <UserRound aria-hidden="true" />
          {required ? "Enter room" : "Save character"}
        </Button>
      </DialogFooter>
    </>
  )
}
