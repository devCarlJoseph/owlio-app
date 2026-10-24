import { cn } from "cn"

export const chipClassName = (active: boolean) =>
  cn(
    "inline-flex h-9 items-center rounded-full border-2 border-outline px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/50",
    active ? "bg-ink text-ink-foreground" : "bg-white text-panel-foreground hover:bg-slate-100"
  )
