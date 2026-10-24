import { cn } from "cn"

type ProgressBarProps = {
  value: number
  max: number
  label: string
  className?: string
}

export function ProgressBar({ value, max, label, className }: ProgressBarProps) {
  if (!(max > 0) || value < 0) return null
  const percent = Math.min(100, (value / max) * 100)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className={cn("h-2.5 w-full overflow-hidden rounded-full border-2 border-outline bg-white/70", className)}
    >
      <div className="h-full rounded-full bg-outline" style={{ width: `${percent}%` }} />
    </div>
  )
}
