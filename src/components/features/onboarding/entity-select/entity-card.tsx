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
