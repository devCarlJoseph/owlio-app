import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className={`group relative rounded-lg bg-background ${
        tone === "danger"
          ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </Button>
  )
}
