import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"
import { Card } from "@/components/ui/card"
import type { OverviewContent } from "./overview-types"

const tileColors = [
  "bg-lime-200/85 hover:bg-lime-200",
  "bg-teal-200/90 hover:bg-teal-200",
  "bg-rose-200/90 hover:bg-rose-200",
] as const

export function OverviewSummary({ summary }: { summary: OverviewContent["summary"] }) {
  return (
    <Card className="gap-4 rounded-3xl border border-white bg-white/70 p-4 shadow-none ring-0 sm:p-5">
      <h3 className="px-1 text-base font-semibold tracking-tight">{summary.title}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {summary.items.map(({ title, description, href, icon: Icon }, index) => (
          <Link key={href} to={href} className={`group flex min-h-44 flex-col rounded-[1.25rem] p-4 text-slate-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${tileColors[index]}`}>
            <div className="flex items-start justify-between gap-2">
              <Icon className="mt-1 size-5 shrink-0" aria-hidden="true" />
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-900/10 group-hover:bg-white/30">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </div>
            <h4 className="mt-4 text-sm font-semibold">{title}</h4>
            <p className="mt-1.5 text-xs leading-5 text-slate-700">{description}</p>
          </Link>
        ))}
      </div>
    </Card>
  )
}
