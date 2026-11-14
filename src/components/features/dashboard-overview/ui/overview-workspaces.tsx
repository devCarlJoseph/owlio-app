import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { OverviewContent } from "./overview-types"

export function OverviewWorkspaces({ explore }: { explore: OverviewContent["explore"] }) {
  return (
    <Card className="gap-4 rounded-3xl border border-white bg-white/70 p-4 shadow-none ring-0 sm:p-5">
      <div className="px-1">
        <h3 className="text-base font-semibold tracking-tight">{explore.title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{explore.description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {explore.items.map(({ title, description, href, category, cover, icon: Icon }) => (
          <Link key={href} to={href} className="group overflow-hidden rounded-[1.25rem] border border-white bg-white outline-none transition-shadow hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
            <div className="relative h-36 overflow-hidden bg-brand-soft sm:h-40">
              <img src={cover} alt="" className="size-full object-cover" />
              <Badge variant="secondary" className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 text-slate-800">{category}</Badge>
              <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-800 group-hover:bg-white"><ArrowUpRight className="size-4" aria-hidden="true" /></span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <Icon className="size-4 shrink-0 text-brand" aria-hidden="true" />
                <h4 className="text-sm font-semibold">{title}</h4>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
