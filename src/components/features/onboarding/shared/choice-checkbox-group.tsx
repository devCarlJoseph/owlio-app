import { FieldError } from "./field-error"

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
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const inputId = `${id}-${option.value}`
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-muted/50 has-checked:border-indigo-600 has-checked:bg-indigo-50 focus-within:ring-2 focus-within:ring-ring/50"
            >
              <input
                id={inputId}
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggle(option.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                className="size-4 accent-indigo-600"
              />
              {option.label}
            </label>
          )
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}
