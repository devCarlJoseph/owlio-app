import { useState } from "react"
import { Lightbulb, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { overviewTip } from "./student-overview-copy"

export function OverviewTipBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <section
      aria-label="Study tip"
      className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
    >
      <Lightbulb className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
      <p className="flex-1 text-sm leading-6 text-blue-800">{overviewTip}</p>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label="Dismiss study tip"
        onClick={() => setVisible(false)}
        className="text-blue-700 hover:bg-blue-100 hover:text-blue-800"
      >
        <X aria-hidden="true" />
      </Button>
    </section>
  )
}