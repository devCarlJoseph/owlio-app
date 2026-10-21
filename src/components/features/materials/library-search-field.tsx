import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type LibrarySearchFieldProps = {
  value: string
  onValueChange: (value: string) => void
  label: string
  placeholder: string
}

export function LibrarySearchField({ value, onValueChange, label, placeholder }: LibrarySearchFieldProps) {
  return (
    <div className="relative w-full sm:w-72">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        aria-label={label}
        placeholder={placeholder}
        autoComplete="off"
        className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9"
      />
    </div>
  )
}
