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
