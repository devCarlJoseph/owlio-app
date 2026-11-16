import { Check } from "lucide-react"
import { FieldError } from "./field-error"
import { OptionalBadge } from "./optional-badge"

type Choice = { value: string; label: string }

type ChoiceCheckboxGroupProps = {
  id: string
  label: string
  options: readonly Choice[]
  value: string[]
  onChange: (value: string[]) => void
  optional?: boolean
  error?: string
}

export function ChoiceCheckboxGroup({ id, label, options, value, onChange, optional, error }: ChoiceCheckboxGroupProps) {
  const errorId = `${id}-error`

  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])
  }

  return (
    <fieldset className="space-y-3" aria-describedby={error ? errorId : undefined}>
      <legend className="flex items-center gap-2 text-sm font-medium">
        {label}
        {optional && <OptionalBadge />}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const inputId = `${id}-${option.value}`
          const checked = value.includes(option.value)
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-500 has-[:focus-visible]:ring-offset-2 ${
                checked
                  ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                  : error
                    ? "border-destructive/60 bg-background text-foreground hover:bg-muted/50"
                    : "border-border bg-background text-foreground hover:border-indigo-300 hover:bg-muted/40"
              }`}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                className="sr-only"
              />
              <span
                className={`flex size-4 items-center justify-center rounded-full border ${
                  checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                }`}
                aria-hidden="true"
              >
                {checked && <Check className="size-3" strokeWidth={3} />}
              </span>
              {option.label}
            </label>
          )
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}
