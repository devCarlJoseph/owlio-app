import type { LucideIcon } from "lucide-react"

type SubjectActionButtonProps = {
  icon: LucideIcon
  label: string
  onClick: () => void
  tone?: "default" | "danger"
}

export function SubjectActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: SubjectActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group relative inline-flex size-9 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
        tone === "danger"
          ? "bg-white/15 text-white hover:bg-red-500/80"
          : "bg-white/15 text-white hover:bg-white/30"
      }`}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </button>
  )
}
