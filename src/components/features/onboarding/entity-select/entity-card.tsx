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
      className={`relative flex min-h-48 cursor-pointer flex-col rounded-xl border p-5 text-left transition focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 ${
        checked
          ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
          : "border-border bg-card hover:border-indigo-300 hover:bg-muted/30"
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
      <span className={`mb-5 flex size-11 items-center justify-center rounded-xl ${checked ? "bg-indigo-600 text-white" : "bg-muted text-foreground"}`} aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <span className="mb-1 flex items-center gap-2 font-semibold text-foreground">
        {title}
        {checked && <Check className="size-4 text-indigo-700" aria-label="Selected" />}
      </span>
      <span className="text-sm leading-5 text-muted-foreground">{description}</span>
      <span className="sr-only">{checked ? "Selected" : "Not selected"}</span>
    </label>
  )
}
