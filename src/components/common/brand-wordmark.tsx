import { cn } from "cn"

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight text-slate-950", className)}>
      owlio<span className="text-brand">.</span>
    </span>
  )
}
