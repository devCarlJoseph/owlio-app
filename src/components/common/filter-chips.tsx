import { cn } from "cn"
import { chipClassName } from "./chip-styles"

type FilterChipsProps<T extends string> = {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onValueChange: (value: T) => void
  className?: string
}

export function FilterChips<T extends string>({ label, options, value, onValueChange, className }: FilterChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onValueChange(option.value)}
          className={chipClassName(option.value === value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
