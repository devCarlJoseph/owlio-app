import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FieldError } from "./field-error"

type TagInputProps = {
  id: string
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  optional?: boolean
  error?: string
}

export function TagInput({ id, label, value, onChange, placeholder, optional, error }: TagInputProps) {
  const [draft, setDraft] = useState("")
  const errorId = `${id}-error`

  function addTag() {
    const tag = draft.trim().replace(/,$/, "").trim()
    if (tag && !value.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) {
      onChange([...value, tag])
    }
    setDraft("")
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addTag()
    }
    if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </label>
      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring/50">
        {value.map((tag, index) => (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
            {tag}
            <button
              type="button"
              className="rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </span>
        ))}
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-8 min-w-32 flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma after each item.</p>
      <FieldError id={errorId} message={error} />
    </div>
  )
}
