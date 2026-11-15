import { ArrowUpRight, CalendarClock, ShieldCheck } from "lucide-react"
import { Link } from "react-router"
import { dateKey, formatDate, formatHour } from "./calendar-dates"
import { scheduleColors } from "./schedule-colors"
import type { ScheduleContent, ScheduleExample } from "./schedule-types"

export function ScheduleDayAgenda({ content, selectedDate, examples, showingExamples, onSelectExample }: {
  content: ScheduleContent
  selectedDate: Date
  examples: ScheduleExample[]
  showingExamples: boolean
  onSelectExample: (event: ScheduleExample) => void
}) {
  const dayEvents = examples.filter((event) => dateKey(event.date) === dateKey(selectedDate))

  return (
    <section aria-label="Selected day agenda" className="border-t border-border bg-slate-50/50 p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Selected day</p>
          <h3 className="mt-1 text-sm font-semibold" aria-live="polite">{formatDate(selectedDate)}</h3>
          {dayEvents.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {dayEvents.map((event) => <li key={event.id}><button type="button" onClick={() => onSelectExample(event)} className={`w-full rounded-lg border-l-2 p-3 text-left text-xs outline-none focus-visible:ring-2 focus-visible:ring-brand ${scheduleColors[event.category.color].tile}`}><span className="font-semibold">Example: {event.title}</span><span className="mt-1 block">{formatHour(event.hour)} – {formatHour(event.hour + event.duration)} · {event.category.label}</span></button></li>)}
            </ul>
          ) : (
            <div className="mt-3 flex items-start gap-3">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="max-w-lg text-xs leading-5 text-muted-foreground">{showingExamples ? "No example events on this date. Choose another day to explore the example schedule." : content.emptyDescription}</p>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /><p>{content.boundary}</p></div>
          <nav aria-label="Related workspaces" className="mt-3 flex flex-wrap gap-2">
            {content.links.map(({ label, href, icon: Icon }) => <Link key={href} to={href} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-brand"><Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />{label}<ArrowUpRight className="size-3" aria-hidden="true" /></Link>)}
          </nav>
        </div>
      </div>
    </section>
  )
}
