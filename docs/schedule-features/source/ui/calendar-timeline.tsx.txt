import { useEffect, useRef } from "react"
import { dateKey, formatDate, formatHour } from "./calendar-dates"
import { scheduleColors } from "./schedule-colors"
import type { ScheduleExample } from "./schedule-types"

export function CalendarTimeline({ dates, selectedDate, today, examples, onSelectDate, onSelectExample }: {
  dates: Date[]
  selectedDate: Date
  today: Date
  examples: ScheduleExample[]
  onSelectDate: (date: Date) => void
  onSelectExample: (event: ScheduleExample) => void
}) {
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (viewportRef.current) viewportRef.current.scrollTop = 8 * 64
  }, [])

  const columns = { gridTemplateColumns: `4rem repeat(${dates.length}, minmax(0, 1fr))` }

  return (
    <div ref={viewportRef} role="region" aria-label={`${dates.length === 1 ? "Day" : "Week"} calendar, scroll to explore all hours`} tabIndex={0} className="max-h-[38rem] overflow-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand">
      <div className={dates.length === 1 ? "min-w-72" : "min-w-[52rem]"}>
        <div className="sticky top-0 z-20 grid border-b border-border bg-white shadow-xs" style={columns}>
          <div className="flex items-center justify-center text-[10px] font-medium text-muted-foreground">Local</div>
          {dates.map((date) => {
            const isToday = dateKey(date) === dateKey(today)
            const selected = dateKey(date) === dateKey(selectedDate)
            return (
              <button key={dateKey(date)} type="button" onClick={() => onSelectDate(date)} aria-label={`Select ${formatDate(date)}`} aria-pressed={selected} aria-current={isToday ? "date" : undefined} className={`flex min-h-20 items-center justify-center gap-2 border-l border-border/70 px-2 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand ${selected ? "bg-brand-soft/60" : ""}`}>
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ${isToday ? "bg-brand text-brand-foreground" : "text-foreground"}`}>{date.getDate()}</span>
                <span className="text-left">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider">{new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date)}</span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">{new Intl.DateTimeFormat(undefined, { month: "short" }).format(date)}</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="grid" style={columns}>
          <div className="relative bg-white" aria-hidden="true" style={{ height: 24 * 64 }}>
            {Array.from({ length: 24 }, (_, hour) => <span key={hour} className="absolute right-2 pt-2 text-[10px] tabular-nums text-muted-foreground" style={{ top: hour * 64 }}>{formatHour(hour)}</span>)}
          </div>
          {dates.map((date) => (
            <section key={dateKey(date)} aria-label={formatDate(date)} className={`relative border-l border-border/70 ${[0, 6].includes(date.getDay()) ? "bg-slate-50/80" : "bg-white"}`} style={{ height: 24 * 64, backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, var(--muted) 31px, var(--muted) 32px, transparent 32px, transparent 63px, var(--border) 63px, var(--border) 64px)" }}>
              {examples.filter((event) => dateKey(event.date) === dateKey(date)).map((event) => (
                <button key={event.id} type="button" onClick={() => onSelectExample(event)} aria-label={`Example: ${event.title}, ${event.category.label}, ${formatHour(event.hour)} to ${formatHour(event.hour + event.duration)}`} className={`absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-left outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-brand ${scheduleColors[event.category.color].tile}`} style={{ top: event.hour * 64 + 2, height: event.duration * 64 - 4 }}>
                  <span className="block truncate text-[10px] font-medium tabular-nums">{formatHour(event.hour)}{event.duration < 1 ? ` · ${event.title}` : ` – ${formatHour(event.hour + event.duration)}`}</span>
                  {event.duration >= 1 && <span className="mt-1 block text-xs font-semibold leading-4">{event.title}</span>}
                  {event.duration >= 1.5 && <span className="mt-1 block text-[10px]">{event.category.label}</span>}
                </button>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
