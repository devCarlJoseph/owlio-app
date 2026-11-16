import { useState } from "react"
import { Lightbulb, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { overviewTip } from "../contents/student-overview-copy"

export function OverviewTipBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <section
      aria-label="Study tip"
      className="flex items-start gap-3 rounded-2xl border border-blue-100 surface-dark:border-surface-blue-border bg-blue-50 surface-dark:bg-surface-blue-soft px-4 py-3"
    >
      <Lightbulb className="mt-1 size-4 shrink-0 text-blue-700 surface-dark:text-blue-300" aria-hidden="true" />
      <p className="flex-1 text-sm leading-6 text-blue-800 surface-dark:text-blue-300">{overviewTip}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Dismiss study tip"
        onClick={() => setVisible(false)}
        className="text-blue-700 surface-dark:text-blue-300 hover:bg-blue-100 surface-dark:hover:bg-surface-blue-soft hover:text-blue-800 surface-dark:hover:text-blue-300"
      >
        <X aria-hidden="true" />
      </Button>
    </section>
  )
}