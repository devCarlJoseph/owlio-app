import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" })
const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" })
const selectedDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
})
const accessibleDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
})
const weekdays = Array.from({ length: 7 }, (_, index) =>
  weekdayFormatter.format(new Date(2023, 0, index + 1))
)

function isSameDate(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
}

function getCalendarDates(month: Date) {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const firstVisibleDate = new Date(
    firstOfMonth.getFullYear(),
    firstOfMonth.getMonth(),
    1 - firstOfMonth.getDay()
  )

  return Array.from({ length: 42 }, (_, index) =>
    new Date(firstVisibleDate.getFullYear(), firstVisibleDate.getMonth(), firstVisibleDate.getDate() + index)
  )
}

export default function SchedulePage() {
  const [today] = useState(() => new Date())
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDate, setSelectedDate] = useState(today)
  const calendarDates = useMemo(() => getCalendarDates(visibleMonth), [visibleMonth])
  const selectedDateLabel = selectedDateFormatter.format(selectedDate)

  const changeMonth = (amount: number) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1)
    const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()

    setVisibleMonth(nextMonth)
    setSelectedDate((currentDate) =>
      new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(currentDate.getDate(), lastDayOfNextMonth))
    )
  }

  const goToToday = () => {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  const selectDate = (date: Date) => {
    setSelectedDate(date)
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative isolate overflow-hidden bg-slate-900 px-6 py-7 text-white sm:px-8 sm:py-9">
          <div aria-hidden="true" className="absolute -right-10 -top-20 -z-10 size-64 rounded-full border-[36px] border-sky-300/10" />
          <div aria-hidden="true" className="absolute -bottom-24 right-36 -z-10 size-48 rounded-full bg-cyan-300/10 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">Shared calendar</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Schedule</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Keep personal study plans, classroom sessions, tutoring lessons, and learning deadlines in view.
          </p>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:p-7">
          <section aria-label="Calendar">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900" aria-live="polite">
                {monthFormatter.format(visibleMonth)}
              </h3>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Previous month"
                    onClick={() => changeMonth(-1)}
                  >
                    <ChevronLeft aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Next month"
                    onClick={() => changeMonth(1)}
                  >
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              role="grid"
              aria-label={`Calendar dates for ${monthFormatter.format(visibleMonth)}`}
              className="overflow-hidden rounded-xl border border-slate-200"
            >
              <div role="row" className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {weekdays.map((weekday, index) => (
                  <div
                    key={index}
                    role="columnheader"
                    className="px-1 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:py-3 sm:text-xs"
                  >
                    {weekday}
                  </div>
                ))}
              </div>
              {Array.from({ length: 6 }, (_, weekIndex) => (
                <div key={weekIndex} role="row" className="grid grid-cols-7">
                  {calendarDates.slice(weekIndex * 7, weekIndex * 7 + 7).map((date, dayIndex) => {
                    const isCurrentMonth = date.getMonth() === visibleMonth.getMonth()
                    const isToday = isSameDate(date, today)
                    const isSelected = isSameDate(date, selectedDate)
                    const isLastWeek = weekIndex === 5

                    return (
                      <div
                        key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                        role="gridcell"
                        aria-selected={isSelected}
                        className={`min-w-0 border-b border-r border-slate-100 p-1.5 sm:min-h-20 sm:p-2 ${
                          dayIndex === 6 ? "border-r-0" : ""
                        } ${isLastWeek ? "border-b-0" : ""}`}
                      >
                        <button
                          type="button"
                          aria-label={accessibleDateFormatter.format(date)}
                          aria-pressed={isSelected}
                          aria-current={isToday ? "date" : undefined}
                          onClick={() => selectDate(date)}
                          className={`flex size-8 items-center justify-center rounded-full text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:size-9 sm:text-sm ${
                            isSelected
                              ? "bg-slate-900 text-white"
                              : isToday
                                ? "bg-sky-100 font-semibold text-sky-900"
                                : isCurrentMonth
                                  ? "text-slate-700 hover:bg-slate-100"
                                  : "text-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Dates follow your device's local calendar.
            </p>
          </section>

          <aside className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-5" aria-label="Selected date details">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                <CalendarDays aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Selected day</p>
                <h3 className="mt-1 text-sm font-semibold leading-5 text-slate-900">{selectedDateLabel}</h3>
              </div>
            </div>

            <div className="my-5 border-t border-slate-200" />

            <div className="flex flex-1 flex-col items-center justify-center py-5 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
                <Clock3 aria-hidden="true" className="size-5" />
              </span>
              <h4 className="mt-4 text-sm font-semibold text-slate-800">No connected events</h4>
              <p className="mt-1.5 max-w-xs text-sm leading-5 text-slate-500">
                Schedule data will appear here when calendar connections are available.
              </p>
            </div>

            <p className="rounded-lg bg-white px-3 py-2.5 text-xs leading-5 text-slate-500 ring-1 ring-slate-200/80">
              This date view does not load or save events yet.
            </p>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Schedule contexts">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span aria-hidden="true" className="mb-3 block h-1 w-9 rounded-full bg-sky-500" />
          <h3 className="text-sm font-semibold text-slate-900">Personal study</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Study sessions and personal deadlines belong to your own workspace.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span aria-hidden="true" className="mb-3 block h-1 w-9 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold text-slate-900">Classes and lessons</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Classroom schedules and flexible tutoring sessions stay attached to their learning context.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span aria-hidden="true" className="mb-3 block h-1 w-9 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900">Learning deadlines</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Personal task due dates remain distinct from educator-assigned deadlines.
          </p>
        </article>
      </section>
    </div>
  )
}
