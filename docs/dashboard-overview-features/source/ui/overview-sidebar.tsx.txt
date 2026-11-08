import { ArrowUpRight, CalendarDays, Clock3, ListChecks, ShieldCheck } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { OverviewContent } from "./overview-types"

export function OverviewSidebar({ content }: { content: OverviewContent }) {
  return (
    <aside aria-label="Your day and follow-ups" className="flex min-w-0 flex-col gap-4">
      <Card className="gap-0 rounded-3xl border border-white bg-white/75 p-5 shadow-none ring-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">{content.agenda.title}</h3>
          <span className="flex size-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground"><CalendarDays className="size-4" aria-hidden="true" /></span>
        </div>
        <div className="my-5 rounded-2xl border border-dashed border-border bg-white/60 px-4 py-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Clock3 className="size-5" aria-hidden="true" /></span>
          <h4 className="mt-4 text-sm font-medium">{content.agenda.emptyTitle}</h4>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{content.agenda.description}</p>
        </div>
        <Button render={<Link to={content.agenda.action.href} />} variant="outline" className="h-10 w-full rounded-full bg-white text-xs">
          {content.agenda.action.label}<ArrowUpRight aria-hidden="true" />
        </Button>
      </Card>

      <Card className="gap-0 rounded-3xl border border-white bg-white/75 p-5 shadow-none ring-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">{content.followUps.title}</h3>
          <ListChecks className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="mb-3 mt-2 text-xs leading-5 text-muted-foreground">{content.followUps.description}</p>
        <ul className="divide-y divide-border/60">
          {content.followUps.items.map(({ title, description, href, icon: Icon }) => (
            <li key={href}>
              <Link to={href} className="group -mx-2 flex items-start gap-3 rounded-xl px-2 py-4 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-brand">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Icon className="size-4" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium">{title}</h4>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                </div>
                <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-brand" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-auto rounded-3xl border border-white/80 bg-brand-soft/65 p-5">
        <ShieldCheck className="size-5 text-brand" aria-hidden="true" />
        <h3 className="mt-3 text-sm font-semibold">{content.note.title}</h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{content.note.description}</p>
      </div>
    </aside>
  )
}
