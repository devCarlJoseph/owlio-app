import type { ReactNode } from "react"
import { CircleCheck, FlaskConical, LayoutGrid, List } from "lucide-react"
import { cn } from "cn"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ClassroomStatus } from "../utils/classroom-list-meta"

export function StatusChip({ status, className }: { status: ClassroomStatus; className?: string }) {
  const Icon = status.tone === "demo" ? FlaskConical : CircleCheck

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-xs font-medium",
        status.tone === "demo"
          ? "border-amber-200 surface-dark:border-surface-amber-border bg-amber-50 surface-dark:bg-surface-amber-soft text-amber-800 surface-dark:text-amber-300"
          : "border-emerald-200 surface-dark:border-surface-emerald-border bg-emerald-50 surface-dark:bg-surface-emerald-soft text-emerald-800 surface-dark:text-emerald-300",
        className
      )}
    >
      <Icon aria-hidden="true" className="size-3" />
      {status.label}
    </span>
  )
}

export function MetaCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-slate-500 surface-dark:text-muted-foreground">{label}</p>
      <div className="mt-0.5 truncate text-sm font-medium text-slate-900 surface-dark:text-foreground">{children}</div>
    </div>
  )
}

export type FilterPillOption = { value: string; label: string; count: number }

export function FilterPills({
  label,
  options,
  value,
  onValueChange,
}: {
  label: string
  options: FilterPillOption[]
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background p-1 [scrollbar-width:none]">
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand",
              active ? "bg-white surface-dark:bg-card font-medium text-slate-900 surface-dark:text-foreground shadow-sm" : "text-slate-600 surface-dark:text-muted-foreground hover:text-slate-900 surface-dark:hover:text-foreground"
            )}
          >
            {option.label}
            <span className={cn("text-xs", active ? "text-brand-soft-foreground" : "text-slate-500 surface-dark:text-muted-foreground")}>{option.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export type ClassroomView = "grid" | "list"

export function GridListToggle({ value, onValueChange }: { value: ClassroomView; onValueChange: (value: ClassroomView) => void }) {
  return (
    <ToggleGroup
      aria-label="Class layout"
      value={[value]}
      onValueChange={(next) => {
        const selected = next[0]
        if (selected === "grid" || selected === "list") onValueChange(selected)
      }}
      spacing={1}
      className="rounded-xl border border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background p-1"
    >
      <ToggleGroupItem value="grid" aria-label="Grid view" title="Grid view" className="size-8 rounded-lg data-[pressed]:bg-white surface-dark:data-[pressed]:bg-card data-[pressed]:shadow-sm">
        <LayoutGrid aria-hidden="true" className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" title="List view" className="size-8 rounded-lg data-[pressed]:bg-white surface-dark:data-[pressed]:bg-card data-[pressed]:shadow-sm">
        <List aria-hidden="true" className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
