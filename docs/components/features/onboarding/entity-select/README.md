# entity-select

This directory mirrors `src/components/features/onboarding/entity-select/`. For the current files, proposed component folders, and manual migration checks, use the [onboarding guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/onboarding/entity-select/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `entity-card.tsx`

Current file: `src/components/features/onboarding/entity-select/entity-card.tsx`

```tsx
import { Check, GraduationCap, Languages, School } from "lucide-react"
import type { Entity } from "../onboarding.types"

type EntityCardProps = {
  entity: Entity
  title: string
  description: string
  icon: "student" | "educator" | "others"
  checked: boolean
  onChange: () => void
}

const entityIcons = {
  student: GraduationCap,
  educator: School,
  others: Languages,
}

export function EntityCard({ entity, title, description, icon, checked, onChange }: EntityCardProps) {
  const Icon = entityIcons[icon]
  const inputId = `entity-${entity}`

  return (
    <label
      htmlFor={inputId}
      className={`group relative flex min-h-44 cursor-pointer flex-col rounded-2xl border p-5 text-left transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 has-[:focus-visible]:ring-offset-2 ${
        checked
          ? "border-indigo-600 bg-indigo-50/80 shadow-md shadow-indigo-600/10 ring-1 ring-indigo-600"
          : "border-border bg-slate-50/60 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-sm"
      }`}
    >
      <input
        id={inputId}
        className="sr-only"
        type="radio"
        name="entity"
        value={entity}
        checked={checked}
        onChange={onChange}
        aria-label={`${title}: ${description}`}
      />
      <span
        className={`absolute top-4 right-4 flex size-5 items-center justify-center rounded-full border transition-colors ${
          checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span
        className={`mb-6 flex size-12 items-center justify-center rounded-xl transition-colors ${
          checked ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20" : "bg-white text-slate-700 ring-1 ring-slate-200"
        }`}
        aria-hidden="true"
      >
        <Icon className="size-6" />
      </span>
      <span className="mt-auto text-base font-semibold text-foreground">{title}</span>
      <span className="mt-1 text-sm leading-5 text-muted-foreground">{description}</span>
      <span className={`mt-3 text-xs font-medium ${checked ? "text-indigo-700" : "text-transparent"}`} aria-hidden="true">
        Selected
      </span>
    </label>
  )
}
```

### `entity-select-step.tsx`

Current file: `src/components/features/onboarding/entity-select/entity-select-step.tsx`

```tsx
import { ENTITY_OPTIONS } from "../onboarding.constants"
import type { Entity } from "../onboarding.types"
import { FieldError } from "../shared/field-error"
import { EntityCard } from "./entity-card"

type EntitySelectStepProps = {
  value?: Entity
  error?: string
  onSelect: (entity: Entity) => void
}

export function EntitySelectStep({ value, error, onSelect }: EntitySelectStepProps) {
  return (
    <fieldset className="space-y-4" aria-describedby={error ? "entity-error" : undefined}>
      <legend className="sr-only">How will you use Owlio?</legend>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {ENTITY_OPTIONS.map((option) => (
          <EntityCard
            key={option.value}
            entity={option.value}
            title={option.title}
            description={option.description}
            icon={option.icon}
            checked={value === option.value}
            onChange={() => onSelect(option.value)}
          />
        ))}
      </div>
      <FieldError id="entity-error" message={error} />
    </fieldset>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
