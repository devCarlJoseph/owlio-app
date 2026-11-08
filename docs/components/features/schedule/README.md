# Schedule component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(schedule): add organized schedule source copies`

Target: `src/components/features/schedule/`. Organize the existing calendar preview, not a fictional scheduling service. [Folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `schedule-colors.ts`, `schedule-content.ts` |
| `utils/` | `calendar-dates.ts`, `calendar-dates.test.ts` |
| `ui/` | `calendar-month.tsx`, `calendar-timeline.tsx`, `schedule-day-agenda.tsx`, `schedule-summary.tsx` |
| `view/` | `role-schedule-view.tsx`, `schedule-workspace-view.tsx`, `schedule-workspace-view.test.tsx` |
| Root contract | `schedule-types.ts` |

Move date calculations with their tests before UI. Keep event examples labeled, navigation/filters working, and the create action unavailable until a real persistence contract exists. Do not create a global calendar context for a local view selection.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/schedule/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `calendar-dates.test.ts`

Current file: `src/components/features/schedule/calendar-dates.test.ts`

```ts
import { describe, expect, it } from "vitest"
import { addDays, dateKey, getVisibleDates, moveDate, startOfWeek } from "./calendar-dates"

describe("calendar date navigation", () => {
  it("starts the week on Monday across a year boundary", () => {
    expect(dateKey(startOfWeek(new Date(2027, 0, 3)))).toBe("2026-12-28")
    const week = getVisibleDates(new Date(2027, 0, 3), "week")
    expect(week).toHaveLength(7)
    expect(dateKey(week[6])).toBe("2027-01-03")
  })

  it("clamps month navigation to the last valid day, including leap years", () => {
    expect(dateKey(moveDate(new Date(2028, 0, 31), "month", 1))).toBe("2028-02-29")
    expect(dateKey(moveDate(new Date(2027, 0, 31), "month", 1))).toBe("2027-02-28")
    expect(dateKey(moveDate(new Date(2026, 0, 31), "month", -1))).toBe("2025-12-31")
  })

  it("moves by civil dates across month and daylight-saving boundaries", () => {
    expect(dateKey(addDays(new Date(2026, 2, 8), 1))).toBe("2026-03-09")
    expect(dateKey(moveDate(new Date(2026, 9, 30), "week", 1))).toBe("2026-11-06")
    expect(dateKey(moveDate(new Date(2026, 9, 31), "day", 1))).toBe("2026-11-01")
  })

  it("includes every day of a six-week month exactly once", () => {
    const dates = getVisibleDates(new Date(2026, 2, 1), "month")
    expect(dates).toHaveLength(42)
    expect(dates[0].getDay()).toBe(1)
    expect(new Set(dates.map(dateKey)).size).toBe(42)
    expect(dates.filter((date) => date.getMonth() === 2)).toHaveLength(31)
    expect(getVisibleDates(new Date(2026, 2, 1), "day")).toHaveLength(1)
  })
})
```

### `calendar-dates.ts`

Current file: `src/components/features/schedule/calendar-dates.ts`

```ts
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
```

### `calendar-month.tsx`

Current file: `src/components/features/schedule/calendar-month.tsx`

```tsx
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
```

### `calendar-timeline.tsx`

Current file: `src/components/features/schedule/calendar-timeline.tsx`

```tsx
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
```

### `role-schedule-view.tsx`

Current file: `src/components/features/schedule/role-schedule-view.tsx`

```tsx
import { useLocation } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { scheduleContent } from "./schedule-content"
import { ScheduleWorkspaceView } from "./schedule-workspace-view"

export function RoleScheduleView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname)

  return role ? <ScheduleWorkspaceView key={role} content={scheduleContent[role]} /> : null
}
```

### `schedule-colors.ts`

Current file: `src/components/features/schedule/schedule-colors.ts`

```ts
export const scheduleColors = {
  teal: { dot: "bg-teal-500", tile: "border-teal-400 bg-teal-100 text-teal-950 hover:bg-teal-200", wash: "from-teal-50/70 to-white", icon: "bg-teal-50 text-teal-700" },
  violet: { dot: "bg-violet-500", tile: "border-violet-400 bg-violet-100 text-violet-950 hover:bg-violet-200", wash: "from-violet-50/70 to-white", icon: "bg-violet-50 text-violet-700" },
  rose: { dot: "bg-rose-500", tile: "border-rose-400 bg-rose-100 text-rose-950 hover:bg-rose-200", wash: "from-rose-50/70 to-white", icon: "bg-rose-50 text-rose-700" },
}
```

### `schedule-content.ts`

Current file: `src/components/features/schedule/schedule-content.ts`

```ts
import { BookOpen, ClipboardList, FolderOpen, NotebookPen, School, Users } from "lucide-react"
import type { ScheduleContent, ScheduleRole } from "./schedule-types"

export const scheduleContent: Record<ScheduleRole, ScheduleContent> = {
  students: {
    role: "students", workspace: "Student workspace", title: "Calendar and Schedule",
    description: "A little structure for your learning day. Keep your study time, class sessions, and deadlines in view.",
    createLabel: "Add study block", unavailableTitle: "Student scheduling is unavailable",
    emptyDescription: "Your personal study blocks, joined-class sessions, and learning deadlines are not connected yet.",
    boundary: "Your personal study plans are yours. Class sessions and educator-assigned deadlines stay separate from personal work.",
    categories: [
      { id: "personal", label: "Personal study", color: "teal", icon: BookOpen },
      { id: "classes", label: "Class sessions", color: "violet", icon: School },
      { id: "deadlines", label: "Learning deadlines", color: "rose", icon: ClipboardList },
    ],
    links: [
      { label: "My learning", href: "/students/subjects", icon: BookOpen },
      { label: "Personal tasks", href: "/students/tasks", icon: ClipboardList },
      { label: "My classes", href: "/students/classrooms", icon: School },
    ],
    examples: [
      { title: "Independent reading", context: "Personal study block", category: "personal", day: 0, hour: 9, duration: 1 },
      { title: "Class lesson", context: "Educator-led learning", category: "classes", day: 1, hour: 10, duration: 1.5 },
      { title: "Review my notes", context: "Personal study block", category: "personal", day: 2, hour: 14, duration: 1 },
      { title: "Classwork due", context: "Educator-assigned deadline", category: "deadlines", day: 3, hour: 11, duration: 0.5 },
      { title: "Weekly study review", context: "Personal study block", category: "personal", day: 4, hour: 15, duration: 1 },
    ],
  },
  educators: {
    role: "educators", workspace: "Educator workspace", title: "Calendar and Schedule",
    description: "See your teaching week clearly. Bring class sessions, lesson preparation, and assessment deadlines together.",
    createLabel: "Schedule a class", unavailableTitle: "Class scheduling is unavailable",
    emptyDescription: "Class sessions, lesson preparation, and assessment deadlines are not connected yet.",
    boundary: "Teaching events belong to the classes you are authorized to manage. A calendar entry does not establish attendance or publish classwork.",
    categories: [
      { id: "classes", label: "Class sessions", color: "teal", icon: School },
      { id: "preparation", label: "Lesson preparation", color: "violet", icon: BookOpen },
      { id: "deadlines", label: "Assessment deadlines", color: "rose", icon: ClipboardList },
    ],
    links: [
      { label: "My classes", href: "/educators/classrooms", icon: School },
      { label: "Classwork & assessments", href: "/educators/classwork", icon: ClipboardList },
      { label: "Teaching materials", href: "/educators/materials", icon: FolderOpen },
    ],
    examples: [
      { title: "Class lesson", context: "Authorized classroom", category: "classes", day: 0, hour: 9, duration: 1.5 },
      { title: "Prepare lesson materials", context: "Teacher preparation", category: "preparation", day: 1, hour: 11, duration: 1 },
      { title: "Group class session", context: "Authorized classroom", category: "classes", day: 2, hour: 10, duration: 1 },
      { title: "Assessment deadline", context: "Classwork due date", category: "deadlines", day: 3, hour: 14, duration: 0.5 },
      { title: "Plan next week's lesson", context: "Teacher preparation", category: "preparation", day: 4, hour: 15, duration: 1 },
    ],
  },
  tutors: {
    role: "tutors", workspace: "Tutor workspace", title: "Sessions and Schedule",
    description: "Make room for focused support. Organize individual sessions, group learning, and preparation for your tutoring week.",
    createLabel: "Schedule a session", unavailableTitle: "Session scheduling is unavailable",
    emptyDescription: "Tutoring appointments, learner or group details, and session preparation are not connected yet.",
    boundary: "A session is a dated appointment; a Learning Plan spans longer-term goals. Private tutor notes stay separate from learner-visible feedback.",
    categories: [
      { id: "individual", label: "Individual sessions", color: "teal", icon: BookOpen },
      { id: "group", label: "Group sessions", color: "violet", icon: Users },
      { id: "preparation", label: "Session preparation", color: "rose", icon: NotebookPen },
    ],
    links: [
      { label: "Learning Plans", href: "/tutors/learning-plans", icon: BookOpen },
      { label: "My learners", href: "/tutors/learners", icon: Users },
      { label: "Activities & evaluations", href: "/tutors/classwork", icon: ClipboardList },
    ],
    examples: [
      { title: "Individual tutoring", context: "One-to-one learning", category: "individual", day: 0, hour: 10, duration: 1 },
      { title: "Prepare practice materials", context: "Tutor preparation", category: "preparation", day: 1, hour: 9, duration: 1 },
      { title: "Group tutoring", context: "Learning group", category: "group", day: 2, hour: 14, duration: 1.5 },
      { title: "Individual tutoring", context: "One-to-one learning", category: "individual", day: 3, hour: 11, duration: 1 },
      { title: "Review session goals", context: "Tutor preparation", category: "preparation", day: 4, hour: 15, duration: 1 },
    ],
  },
  esl: {
    role: "esl", workspace: "ESL teaching workspace", title: "Lesson Schedule",
    description: "Plan a week of meaningful language practice. Keep individual lessons, group lessons, and preparation in focus.",
    createLabel: "Schedule a lesson", unavailableTitle: "Lesson scheduling is unavailable",
    emptyDescription: "Dated lessons, learner or group details, and lesson preparation are not connected yet.",
    boundary: "Lesson Plans are reusable preparation. Scheduled lessons are dated sessions. Language progress and attendance require their own records.",
    categories: [
      { id: "individual", label: "Individual lessons", color: "teal", icon: BookOpen },
      { id: "group", label: "Group lessons", color: "violet", icon: Users },
      { id: "preparation", label: "Lesson preparation", color: "rose", icon: ClipboardList },
    ],
    links: [
      { label: "Lesson Plans", href: "/esl/lessons", icon: BookOpen },
      { label: "My learners", href: "/esl/learners", icon: Users },
      { label: "Teaching materials", href: "/esl/materials", icon: FolderOpen },
    ],
    examples: [
      { title: "Conversation practice", context: "Individual language lesson", category: "individual", day: 0, hour: 9, duration: 1 },
      { title: "Prepare reading prompts", context: "Lesson preparation", category: "preparation", day: 1, hour: 10, duration: 1 },
      { title: "Group language practice", context: "Group language lesson", category: "group", day: 2, hour: 14, duration: 1.5 },
      { title: "Listening practice", context: "Individual language lesson", category: "individual", day: 3, hour: 11, duration: 1 },
      { title: "Prepare the next lesson", context: "Lesson preparation", category: "preparation", day: 4, hour: 15, duration: 1 },
    ],
  },
}
```

### `schedule-day-agenda.tsx`

Current file: `src/components/features/schedule/schedule-day-agenda.tsx`

```tsx
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
```

### `schedule-summary.tsx`

Current file: `src/components/features/schedule/schedule-summary.tsx`

```tsx
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
```

### `schedule-types.ts`

Current file: `src/components/features/schedule/schedule-types.ts`

```ts
import type { LucideIcon } from "lucide-react"

export type ScheduleRole = "students" | "educators" | "tutors" | "esl"
export type CalendarView = "day" | "week" | "month"
export type ScheduleCategory = {
  id: string
  label: string
  color: "teal" | "violet" | "rose"
  icon: LucideIcon
}
export type ScheduleContent = {
  role: ScheduleRole
  workspace: string
  title: string
  description: string
  createLabel: string
  unavailableTitle: string
  emptyDescription: string
  boundary: string
  categories: [ScheduleCategory, ScheduleCategory, ScheduleCategory]
  links: { label: string; href: string; icon: LucideIcon }[]
  examples: { title: string; context: string; category: string; day: number; hour: number; duration: number }[]
}
export type ScheduleExample = {
  id: string
  title: string
  context: string
  category: ScheduleCategory
  date: Date
  hour: number
  duration: number
}
```

### `schedule-workspace-view.test.tsx`

Current file: `src/components/features/schedule/schedule-workspace-view.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router"
import userEvent from "@testing-library/user-event"
import { RoleScheduleView } from "./role-schedule-view"
import TutorSessionsView from "@/components/features/tutor-workspace/sessions/tutor-sessions-view"

afterEach(cleanup)

const roles = [
  { role: "students", title: "Calendar and Schedule", action: "Add study block", category: "Personal study" },
  { role: "educators", title: "Calendar and Schedule", action: "Schedule a class", category: "Class sessions" },
  { role: "tutors", title: "Sessions and Schedule", action: "Schedule a session", category: "Individual sessions" },
  { role: "esl", title: "Lesson Schedule", action: "Schedule a lesson", category: "Individual lessons" },
]

function renderSchedule(role = "students") {
  return render(<MemoryRouter initialEntries={[`/${role}/schedule`]}><RoleScheduleView /></MemoryRouter>)
}

describe("workspace schedules", () => {
  it.each(roles)("scopes the $role schedule and keeps unavailable actions disabled", ({ role, title, action, category }) => {
    renderSchedule(role)

    expect(screen.getByRole("heading", { name: title })).toBeTruthy()
    expect((screen.getByRole("button", { name: action }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByRole("tab", { name: "Week" }).getAttribute("aria-selected")).toBe("true")
    expect(within(screen.getByRole("list", { name: "Event type legend" })).getByText(category)).toBeTruthy()
    expect(screen.getAllByLabelText("Unavailable")).toHaveLength(4)
    expect(screen.getAllByRole("link").every((link) => link.getAttribute("href")?.startsWith(`/${role}/`))).toBe(true)
    expect(screen.queryByRole("button", { name: /^Example:/ })).toBeNull()
    expect(screen.queryByRole("link", { name: /join|meeting room/i })).toBeNull()
  })

  it("uses the same calendar on the tutor sidebar sessions page", () => {
    render(<MemoryRouter initialEntries={["/tutors/sessions"]}><TutorSessionsView /></MemoryRouter>)
    expect(screen.getByRole("heading", { name: "Sessions and Schedule" })).toBeTruthy()
    expect(screen.getByRole("region", { name: /Week calendar/ })).toBeTruthy()
  })

  it("navigates weeks and returns to today", () => {
    renderSchedule()
    const original = screen.getByLabelText("Visible date range").textContent
    fireEvent.click(screen.getByRole("button", { name: "Next week" }))
    expect(screen.getByLabelText("Visible date range").textContent).not.toBe(original)
    fireEvent.click(screen.getByRole("button", { name: "Today" }))
    expect(screen.getByLabelText("Visible date range").textContent).toBe(original)
    fireEvent.click(screen.getByRole("button", { name: "Previous week" }))
    expect(screen.getByLabelText("Visible date range").textContent).not.toBe(original)
  })

  it("switches Day and Month views and selects dates without changing route", async () => {
    renderSchedule()
    fireEvent.click(screen.getByRole("tab", { name: "Day" }))
    expect(await screen.findByRole("region", { name: /Day calendar/ })).toBeTruthy()
    fireEvent.click(screen.getByRole("tab", { name: "Month" }))
    const calendar = await screen.findByRole("table", { name: /Month calendar/ })
    expect(within(calendar).getAllByRole("button", { name: /^Select/ })).toHaveLength(42)
    const day = within(calendar).getAllByRole("button", { name: /^Select/ })[10]
    const label = day.getAttribute("aria-label")!.replace("Select ", "")
    fireEvent.click(day)
    expect(within(screen.getByRole("region", { name: "Selected day agenda" })).getByRole("heading", { name: label })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Next month" })).toBeTruthy()
  })

  it("shows fictional examples only when requested and opens accessible details", async () => {
    renderSchedule()
    fireEvent.click(screen.getByRole("button", { name: "Show examples" }))
    expect(screen.getByText(/Showing fictional examples/)).toBeTruthy()
    fireEvent.click(screen.getAllByRole("button", { name: /^Example: Independent reading/ })[0])
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText(/not a saved appointment/)).toBeTruthy()
    expect(within(dialog).queryByRole("button", { name: /save|join|publish/i })).toBeNull()
    fireEvent.click(within(dialog).getAllByRole("button", { name: "Close" })[0])
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    fireEvent.click(screen.getByRole("button", { name: "Hide examples" }))
    expect(screen.queryByRole("button", { name: /^Example:/ })).toBeNull()
    expect(screen.getAllByLabelText("Unavailable")).toHaveLength(4)
  })

  it("filters examples by their owning event type", async () => {
    const user = userEvent.setup()
    renderSchedule()
    await user.click(screen.getByRole("button", { name: "Show examples" }))
    await user.click(screen.getByRole("combobox", { name: "Filter calendar by event type" }))
    await user.click(await screen.findByRole("option", { name: "Class sessions" }))
    await waitFor(() => expect(screen.queryByRole("button", { name: /^Example: Independent reading/ })).toBeNull())
    expect(screen.getAllByRole("button", { name: /^Example: Class lesson/ }).length).toBeGreaterThan(0)
  })
})
```

### `schedule-workspace-view.tsx`

Current file: `src/components/features/schedule/schedule-workspace-view.tsx`

```tsx
import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, FlaskConical, Info, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addDays, dateKey, formatDate, formatHour, formatRange, getVisibleDates, moveDate, startOfWeek } from "./calendar-dates"
import { CalendarMonth } from "./calendar-month"
import { CalendarTimeline } from "./calendar-timeline"
import { ScheduleDayAgenda } from "./schedule-day-agenda"
import { ScheduleSummary } from "./schedule-summary"
import { scheduleColors } from "./schedule-colors"
import type { CalendarView, ScheduleContent, ScheduleExample } from "./schedule-types"

const views: CalendarView[] = ["day", "week", "month"]

export function ScheduleWorkspaceView({ content }: { content: ScheduleContent }) {
  const [today] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [view, setView] = useState<CalendarView>("week")
  const [category, setCategory] = useState("all")
  const [showingExamples, setShowingExamples] = useState(false)
  const [selectedExample, setSelectedExample] = useState<ScheduleExample | null>(null)
  const dates = getVisibleDates(selectedDate, view)
  const weekStart = startOfWeek(selectedDate)
  const examples: ScheduleExample[] = showingExamples ? content.examples.flatMap((example, index) => {
    const source = content.categories.find(({ id }) => id === example.category)
    if (!source || (category !== "all" && source.id !== category)) return []
    return [{ ...example, id: `${content.role}-${index}`, category: source, date: addDays(weekStart, example.day) }]
  }) : []
  const visibleExamples = examples.filter((event) => dates.some((date) => dateKey(date) === dateKey(event.date)))
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const rangeLabel = formatRange(selectedDate, view)

  return (
    <div className="mx-auto w-full max-w-[100rem] overflow-hidden rounded-2xl border border-border bg-white text-foreground shadow-xs">
      <Tabs value={view} onValueChange={(value) => { if (views.includes(value as CalendarView)) setView(value as CalendarView) }} className="gap-0">
        <header className="flex flex-wrap items-start justify-between gap-4 px-4 pb-5 pt-6 sm:px-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{content.workspace}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{content.title}</h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">{content.description}</p>
          </div>
          <Badge variant="outline" className="gap-1.5 rounded-full px-2.5 py-1 text-muted-foreground"><CalendarDays className="size-3" aria-hidden="true" />Calendar preview</Badge>
        </header>

        <div className="flex flex-wrap items-center gap-3 px-4 pb-5 sm:px-6">
          <Button variant="outline" onClick={() => setSelectedDate(new Date())} className="h-9 rounded-lg px-3 text-xs">Today</Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label={`Previous ${view}`} onClick={() => setSelectedDate((date) => moveDate(date, view, -1))} className="rounded-full border border-border"><ChevronLeft aria-hidden="true" /></Button>
            <Button variant="ghost" size="icon-sm" aria-label={`Next ${view}`} onClick={() => setSelectedDate((date) => moveDate(date, view, 1))} className="rounded-full border border-border"><ChevronRight aria-hidden="true" /></Button>
          </div>
          <p className="min-w-0 text-xs font-semibold tabular-nums" aria-live="polite" aria-label="Visible date range">{rangeLabel}</p>
          <TabsList aria-label="Calendar view" className="h-9 rounded-lg sm:ml-2">
            {views.map((value) => <TabsTrigger key={value} value={value} className="min-w-14 px-3 text-xs data-active:text-brand">{value.charAt(0).toUpperCase() + value.slice(1)}</TabsTrigger>)}
          </TabsList>
          <Select value={category} onValueChange={(value) => setCategory(value ?? "all")}>
            <SelectTrigger aria-label="Filter calendar by event type" className="h-9 rounded-lg text-xs"><SelectValue>{category === "all" ? "All event types" : content.categories.find(({ id }) => id === category)?.label}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All event types</SelectItem>
              {content.categories.map(({ id, label }) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button disabled aria-describedby="schedule-availability" className="h-9 gap-2 rounded-lg bg-brand px-3 text-xs text-brand-foreground disabled:opacity-60 sm:ml-auto"><Plus className="size-3.5" aria-hidden="true" />{content.createLabel}</Button>
        </div>

        <div className="px-4 pb-5 sm:px-6"><ScheduleSummary content={content} examples={visibleExamples} showingExamples={showingExamples} /></div>

        <div id="schedule-availability" className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-slate-50 px-4 py-3 sm:mx-6">
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <h3 className="text-xs font-medium">{content.unavailableTitle}</h3>
              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{showingExamples ? "Showing fictional examples for layout preview. No events are saved or linked to learners." : "Browse dates and views. Event records and scheduling are not connected yet."}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" aria-pressed={showingExamples} onClick={() => { setShowingExamples((current) => !current); setSelectedExample(null) }} className="h-9 gap-2 rounded-lg bg-white text-xs"><FlaskConical className="size-3.5" aria-hidden="true" />{showingExamples ? "Hide examples" : "Show examples"}</Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border px-4 py-3 sm:px-6">
          <ul aria-label="Event type legend" className="flex flex-wrap gap-x-5 gap-y-2">
            {content.categories.map(({ id, label, color }) => <li key={id} className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className={`size-2 rounded-full ${scheduleColors[color].dot}`} aria-hidden="true" />{label}</li>)}
          </ul>
          <span className="text-[10px] text-muted-foreground">Device time · {timezone}</span>
        </div>
        <p className="border-b border-border px-4 py-2 text-[10px] text-muted-foreground sm:hidden">Scroll the calendar to see more days and times.</p>

        {views.map((mode) => <TabsContent key={mode} value={mode}>
          {mode === "month" ? <CalendarMonth dates={dates} selectedDate={selectedDate} today={today} examples={visibleExamples} onSelectDate={setSelectedDate} onSelectExample={setSelectedExample} /> : <CalendarTimeline dates={dates} selectedDate={selectedDate} today={today} examples={visibleExamples} onSelectDate={setSelectedDate} onSelectExample={setSelectedExample} />}
        </TabsContent>)}
      </Tabs>

      <ScheduleDayAgenda content={content} selectedDate={selectedDate} examples={visibleExamples} showingExamples={showingExamples} onSelectExample={setSelectedExample} />

      <Dialog open={selectedExample !== null} onOpenChange={(open) => { if (!open) setSelectedExample(null) }}>
        <DialogContent className="gap-5 overflow-hidden rounded-2xl p-0">
          {selectedExample && <>
            <DialogHeader className={`border-b border-border border-t-4 p-5 pr-12 ${scheduleColors[selectedExample.category.color].tile}`}>
              <p className="text-[10px] font-semibold uppercase tracking-widest">Example event</p>
              <DialogTitle className="text-lg leading-6">{selectedExample.title}</DialogTitle>
              <DialogDescription className="text-xs text-slate-700">Fictional layout preview. This is not a saved appointment or learner record.</DialogDescription>
            </DialogHeader>
            <dl className="space-y-4 px-5 text-sm">
              <div><dt className="text-xs text-muted-foreground">Date and time · device timezone</dt><dd className="mt-1 font-medium">{formatDate(selectedExample.date)}</dd><dd className="mt-1 text-xs">{formatHour(selectedExample.hour)} – {formatHour(selectedExample.hour + selectedExample.duration)} · {timezone}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Event type</dt><dd className="mt-1">{selectedExample.category.label}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Learning context</dt><dd className="mt-1">{selectedExample.context}</dd></div>
            </dl>
            <DialogFooter showCloseButton className="border-t border-border bg-slate-50 p-4" />
          </>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
