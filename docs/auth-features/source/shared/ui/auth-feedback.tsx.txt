import type { ReactNode } from "react"
import { CheckCircle2, Info, TriangleAlert } from "lucide-react"

type AuthFeedbackProps = {
  title: string
  children: ReactNode
  tone?: "info" | "error" | "success"
  preview?: boolean
}

const toneStyles = {
  info: "border-indigo-200 bg-indigo-50/70 text-indigo-950",
  error: "border-destructive/30 bg-destructive/5 text-foreground",
  success: "border-indigo-200 bg-indigo-50/70 text-indigo-950",
}

const toneIcons = {
  info: Info,
  error: TriangleAlert,
  success: CheckCircle2,
}

export function AuthFeedback({ title, children, tone = "info", preview = false }: AuthFeedbackProps) {
  const Icon = toneIcons[tone]
  const liveRole = tone === "error" ? "alert" : "status"

  return (
    <div className={`rounded-xl border p-4 ${toneStyles[tone]}`} role={liveRole} aria-live={tone === "error" ? "assertive" : "polite"}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{title}</p>
            {preview && <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">Preview only</span>}
          </div>
          <div className="mt-1 text-sm leading-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
