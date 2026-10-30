import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { OverviewContent } from "./overview-types"

const accents = ["bg-rose-200", "bg-teal-300", "bg-lime-200"] as const

export function OverviewIdentityCard({ content }: { content: OverviewContent }) {
  const Icon = content.icon

  return (
    <Card className="gap-0 rounded-3xl border border-white bg-white/85 py-0 shadow-none ring-0">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="relative flex size-28 shrink-0 items-center justify-center self-start rounded-[1.5rem] bg-brand-soft sm:size-32">
          <img src="/mascot/owlio-owl.png" alt="" className="size-24 object-contain sm:size-28" />
          <span className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-4 border-white bg-brand text-brand-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <Badge variant="secondary" className="rounded-full bg-brand-soft px-2.5 text-brand-soft-foreground">{content.workspace}</Badge>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{content.headline}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{content.introduction}</p>
          <Button render={<Link to={content.primaryAction.href} />} variant="outline" size="sm" className="mt-4 h-9 rounded-full border-border bg-white px-3.5">
            {content.primaryAction.label}<ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-border/50 px-5 pb-4 pt-4 sm:gap-5 sm:px-6">
        {content.focus.map((label, index) => (
          <div key={label} className="min-w-0">
            <p className="text-xs leading-5 text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">Not connected</p>
            <div className={`mt-3 h-1 rounded-full ${accents[index]}`} aria-hidden="true" />
          </div>
        ))}
      </div>
    </Card>
  )
}
