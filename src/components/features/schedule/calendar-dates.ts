import type { CalendarView } from "./schedule-types"

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12)
}

export function startOfWeek(date: Date) {
  return addDays(date, -((date.getDay() + 6) % 7))
}

export function getVisibleDates(date: Date, view: CalendarView) {
  if (view === "day") return [date]
  const start = view === "week" ? startOfWeek(date) : startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1, 12))
  return Array.from({ length: view === "month" ? 42 : 7 }, (_, index) => addDays(start, index))
}

export function moveDate(date: Date, view: CalendarView, direction: number) {
  if (view !== "month") return addDays(date, direction * (view === "week" ? 7 : 1))
  const next = new Date(date.getFullYear(), date.getMonth() + direction, 1, 12)
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  return new Date(next.getFullYear(), next.getMonth(), Math.min(date.getDate(), lastDay), 12)
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date)
}

export function formatRange(date: Date, view: CalendarView) {
  if (view === "month") return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date)
  if (view === "day") return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date)
  const dates = getVisibleDates(date, view)
  const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" })
  return `${formatter.format(dates[0])} – ${formatter.format(dates[6])}`
}

export function formatHour(hour: number) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(2024, 0, 1, Math.floor(hour), Math.round((hour % 1) * 60)))
}
