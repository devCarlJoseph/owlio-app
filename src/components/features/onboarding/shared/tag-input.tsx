import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FieldError } from "./field-error"
import { OptionalBadge } from "./optional-badge"

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
  const hintId = `${id}-hint`

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
        {optional && <OptionalBadge />}
      </label>
      <div
        className={`flex min-h-11 flex-wrap items-center gap-2 rounded-lg border bg-background p-1.5 shadow-xs transition focus-within:border-indigo-500 focus-within:ring-3 focus-within:ring-indigo-500/20 ${
          error ? "border-destructive" : "border-input"
        }`}
      >
        {value.map((tag, index) => (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pr-1.5 pl-3 text-sm font-medium text-indigo-800 ring-1 ring-indigo-100">
            {tag}
            <button
              type="button"
              className="rounded-full p-0.5 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
          aria-describedby={[hintId, error ? errorId : null].filter(Boolean).join(" ")}
          className="h-8 min-w-32 flex-1 border-0 px-1.5 shadow-none focus-visible:ring-0 aria-invalid:ring-0"
        />
      </div>
      <p id={hintId} className="text-xs text-muted-foreground">Press Enter or comma after each item.</p>
      <FieldError id={errorId} message={error} />
    </div>
  )
}
