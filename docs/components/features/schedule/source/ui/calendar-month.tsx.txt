import { dateKey, formatDate } from "./calendar-dates"
import { scheduleColors } from "./schedule-colors"
import type { ScheduleExample } from "./schedule-types"

export function CalendarMonth({ dates, selectedDate, today, examples, onSelectDate, onSelectExample }: {
  dates: Date[]
  selectedDate: Date
  today: Date
  examples: ScheduleExample[]
  onSelectDate: (date: Date) => void
  onSelectExample: (event: ScheduleExample) => void
}) {
  return (
    <div role="region" aria-label="Month calendar, scroll horizontally on smaller screens" tabIndex={0} className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand">
      <table className="w-full min-w-[42rem] table-fixed border-collapse">
        <caption className="sr-only">Month calendar. Select a date to see its agenda.</caption>
        <thead>
          <tr>{dates.slice(0, 7).map((date) => <th key={dateKey(date)} scope="col" className="border-b border-border bg-slate-50/70 py-3 text-xs font-medium text-muted-foreground">{new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date)}</th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {dates.slice(week * 7, week * 7 + 7).map((date) => {
                const selected = dateKey(date) === dateKey(selectedDate)
                const isToday = dateKey(date) === dateKey(today)
                return (
                  <td key={dateKey(date)} className={`h-28 border-b border-r border-border/70 p-2 align-top last:border-r-0 ${date.getMonth() === selectedDate.getMonth() ? "bg-white" : "bg-slate-50"}`}>
                    <button type="button" onClick={() => onSelectDate(date)} aria-label={`Select ${formatDate(date)}`} aria-pressed={selected} aria-current={isToday ? "date" : undefined} className={`mb-1 flex size-8 items-center justify-center rounded-lg text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand ${isToday ? "bg-brand text-brand-foreground" : selected ? "bg-brand-soft text-brand" : "hover:bg-muted"}`}>{date.getDate()}</button>
                    {examples.filter((event) => dateKey(event.date) === dateKey(date)).map((event) => <button key={event.id} type="button" onClick={() => onSelectExample(event)} className={`mb-1 block w-full truncate rounded border-l-2 px-1.5 py-1 text-left text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-brand ${scheduleColors[event.category.color].tile}`} aria-label={`Example: ${event.title}, ${formatDate(date)}`}>{event.title}</button>)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
