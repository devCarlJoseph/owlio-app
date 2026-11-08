import { CalendarDays } from "lucide-react"
import { Card } from "@/components/ui/card"
import { scheduleColors } from "./schedule-colors"
import type { ScheduleContent, ScheduleExample } from "./schedule-types"

export function ScheduleSummary({ content, examples, showingExamples }: { content: ScheduleContent; examples: ScheduleExample[]; showingExamples: boolean }) {
  const summaries = [
    { label: "Total events", count: examples.length, icon: CalendarDays, color: "teal" as const },
    ...content.categories.map((category) => ({ ...category, count: examples.filter((event) => event.category.id === category.id).length })),
  ]

  return (
    <section aria-label="Schedule summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {summaries.map(({ label, count, icon: Icon, color }) => (
        <Card key={label} className={`gap-0 rounded-xl border border-border/70 bg-gradient-to-br p-4 shadow-none ring-0 ${scheduleColors[color].wash}`}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xs font-medium leading-5">{label}</h3>
            <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{showingExamples ? "Examples in this view" : "Selected date range"}</p>
          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">{showingExamples ? count : <span aria-label="Unavailable">—</span>}</span>
            <span className="text-[10px] text-muted-foreground">{showingExamples ? "Example only" : "Not connected"}</span>
          </div>
        </Card>
      ))}
    </section>
  )
}
