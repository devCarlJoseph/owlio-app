import { useCallback, useState, type FormEvent } from 'react'
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, List, Plus, RefreshCw } from 'lucide-react'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { useAccountRecords } from '@/components/features/connected-workspace/hooks/use-account-records'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getClassroomSessions, scheduleClassroomSession, type ScheduledSession } from '@/services/api/meeting.service'
import type { Classroom } from '../types/classroom-types'
import { eventsOnDay } from '../lib/schedule-dates'

const modeLabels = { ONLINE: 'Online', IN_PERSON: 'In person', HYBRID: 'Hybrid' }
const eventColor = (item: ScheduledSession) => item.status === 'CANCELLED'
  ? 'border-border bg-muted text-muted-foreground'
  : item.mode === 'ONLINE' ? 'border-indigo-200 bg-indigo-100 text-indigo-950 surface-dark:border-indigo-800 surface-dark:bg-indigo-950 surface-dark:text-indigo-100'
    : item.mode === 'HYBRID' ? 'border-emerald-200 bg-emerald-100 text-emerald-950 surface-dark:border-emerald-800 surface-dark:bg-emerald-950 surface-dark:text-emerald-100'
      : 'border-orange-200 bg-orange-100 text-orange-950 surface-dark:border-orange-800 surface-dark:bg-orange-950 surface-dark:text-orange-100'

export function ClassroomScheduleView({ classroom }: { classroom: Classroom }) {
  const { user } = useAuthSession()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<ScheduledSession | null>(null)
  const [notice, setNotice] = useState('')
  const canSchedule = classroom.access === 'owner' && classroom.ownerId === user?.id && Boolean(user?.roles.some(role => ['EDUCATOR', 'TUTOR', 'ESL'].includes(role)))
  const from = startOfWeek(month).toISOString()
  const to = addDays(endOfWeek(endOfMonth(month)), 1)
  to.setHours(0, 0, 0, 0)
  const until = to.toISOString()
  const load = useCallback((signal?: AbortSignal) => getClassroomSessions(classroom.id, from, until, signal), [classroom.id, from, until])
  const state = useAccountRecords(load)
  const items = [...state.records].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
  const monthItems = items.filter(item => new Date(item.startsAt) < addMonths(month, 1) && new Date(item.endsAt) > month)
  const days: Date[] = []
  for (let day = new Date(from); day < to; day = addDays(day, 1)) days.push(day)
  const changeMonth = (next: Date) => { setMonth(startOfMonth(next)); setSelected(null); setNotice('') }

  return <section aria-labelledby="class-schedule-heading" className="min-w-0 space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h3 id="class-schedule-heading" className="text-xl font-semibold tracking-tight">Class schedule</h3><p className="mt-1 text-sm text-muted-foreground">Exams, meetings, and activities set by your {classroom.ownerWorkspace === 'educators' ? 'adviser' : 'instructor'}.</p></div>
      {canSchedule && <Button onClick={() => setCreating(true)} className="bg-brand text-brand-foreground hover:bg-brand/90"><Plus className="size-4" />Add schedule</Button>}
    </header>
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:px-5">
        <div className="flex items-center gap-2"><Button variant="ghost" size="icon-sm" aria-label="Previous month" onClick={() => changeMonth(addMonths(month, -1))}><ChevronLeft /></Button><h4 aria-live="polite" className="min-w-32 text-center text-sm font-semibold">{format(month, 'MMMM yyyy')}</h4><Button variant="ghost" size="icon-sm" aria-label="Next month" onClick={() => changeMonth(addMonths(month, 1))}><ChevronRight /></Button></div>
        <div className="flex flex-wrap items-center gap-2"><Button variant="ghost" size="sm" onClick={() => changeMonth(new Date())}>Today</Button><Button variant="ghost" size="icon-sm" aria-label="Refresh schedule" disabled={state.loading} onClick={state.reload}><RefreshCw className="size-4" /></Button><div role="group" aria-label="Schedule view" className="flex rounded-lg border border-border bg-muted/40 p-1">{(['calendar', 'list'] as const).map(value => <Button key={value} variant="ghost" size="sm" aria-pressed={view === value} onClick={() => setView(value)} className={view === value ? 'bg-card shadow-sm' : 'text-muted-foreground'}>{value === 'calendar' ? <CalendarDays className="size-4" /> : <List className="size-4" />}<span className="capitalize">{value}</span></Button>)}</div></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-xs text-muted-foreground"><span>All times in {Intl.DateTimeFormat().resolvedOptions().timeZone}</span><span>{monthItems.length} {monthItems.length === 1 ? 'schedule' : 'schedules'} this month</span></div>
      {state.loading ? <p role="status" className="p-10 text-center text-sm text-muted-foreground">Loading class schedule…</p> : state.error ? <div role="alert" className="space-y-3 p-8 text-center"><p className="text-sm">{state.error}</p><Button variant="outline" onClick={state.reload}>Try again</Button></div> : <>
        {view === 'calendar' ? <div className="overflow-x-auto px-3 pb-3 sm:px-4 sm:pb-4"><div className="min-w-[630px] overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-7 border-b border-border">{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => <div key={day} className="py-3 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{day}</div>)}</div>
          <div className="grid grid-cols-7">{days.map((day, index) => <div key={day.toISOString()} className={`min-h-28 border-border p-1.5 sm:min-h-32 ${index % 7 !== 6 ? 'border-r' : ''} ${index < days.length - 7 ? 'border-b' : ''} ${isSameMonth(day, month) ? 'bg-card' : 'bg-muted/30'}`}>
            <time dateTime={format(day, 'yyyy-MM-dd')} className={`mb-1 flex size-6 items-center justify-center rounded-full text-xs ${isSameDay(day, new Date()) ? 'bg-brand font-semibold text-brand-foreground' : isSameMonth(day, month) ? 'text-foreground' : 'text-muted-foreground'}`}>{format(day, 'd')}</time>
            <div className="space-y-1">{eventsOnDay(items, day).map(item => <button key={item.id} onClick={() => setSelected(item)} className={`block w-full rounded border p-1.5 text-left outline-none transition-colors hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring ${eventColor(item)}`}><span className="block text-[10px]">{isSameDay(new Date(item.startsAt), day) ? format(new Date(item.startsAt), 'h:mm a') : 'Continues'}</span><span className={`line-clamp-2 text-xs font-medium ${item.status === 'CANCELLED' ? 'line-through' : ''}`}>{item.title}</span>{item.status === 'CANCELLED' && <span className="block text-[10px]">Cancelled</span>}</button>)}</div>
          </div>)}</div>
        </div></div> : <ul className="divide-y divide-border px-4 sm:px-5">{monthItems.map(item => <li key={item.id}><button onClick={() => setSelected(item)} className="flex w-full items-center gap-4 rounded-lg py-5 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"><span className={`flex w-14 shrink-0 flex-col items-center rounded-lg border py-2 ${eventColor(item)}`}><span className="text-[10px] font-medium uppercase">{format(new Date(item.startsAt), 'MMM')}</span><span className="text-xl font-semibold">{format(new Date(item.startsAt), 'd')}</span></span><span className="min-w-0 flex-1"><span className={`block break-words text-sm font-semibold ${item.status === 'CANCELLED' ? 'line-through' : ''}`}>{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{format(new Date(item.startsAt), 'EEE, MMM d · h:mm a')} – {format(new Date(item.endsAt), 'MMM d, h:mm a')}</span><span className="mt-1 block text-xs text-muted-foreground">{modeLabels[item.mode]}{item.status === 'CANCELLED' ? ' · Cancelled' : ''}</span></span><ChevronRight className="size-4 shrink-0 text-muted-foreground" /></button></li>)}</ul>}
        {monthItems.length === 0 && <div className="px-5 py-8 text-center"><CalendarDays className="mx-auto mb-3 size-7 text-muted-foreground" /><p className="text-sm font-medium">No schedules this month</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{canSchedule ? 'Add an exam, meeting, or class activity to get started.' : 'Schedules published by your adviser or instructor will appear here.'}</p></div>}
      </>}
    </div>
    {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null) }}><DialogContent><DialogHeader><DialogTitle>Schedule details</DialogTitle><DialogDescription>Set by your classroom adviser or instructor.</DialogDescription></DialogHeader>{selected && <><div className={`rounded-lg border p-4 ${eventColor(selected)}`}><CalendarDays className="mb-3 size-5" /><h4 className="break-words text-lg font-semibold">{selected.title}</h4><p className="mt-2 text-sm">{modeLabels[selected.mode]} · {selected.status === 'CANCELLED' ? 'Cancelled' : 'Scheduled'}</p></div><div className="flex items-start gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><p className="text-sm leading-6">{format(new Date(selected.startsAt), 'EEEE, MMMM d, yyyy · h:mm a')}<br />to {format(new Date(selected.endsAt), 'MMMM d, yyyy · h:mm a')}<span className="mt-1 block text-xs text-muted-foreground">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span></p></div></>}</DialogContent></Dialog>
    {canSchedule && <ScheduleComposer classroomId={classroom.id} open={creating} onOpenChange={setCreating} onSaved={item => { changeMonth(new Date(item.startsAt)); state.reload(); setNotice('Schedule saved and available to classroom members.') }} />}
  </section>
}

function ScheduleComposer({ classroomId, open, onOpenChange, onSaved }: { classroomId: string; open: boolean; onOpenChange: (open: boolean) => void; onSaved: (item: ScheduledSession) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    const start = new Date(String(form.get('start')))
    const end = new Date(String(form.get('end')))
    if (!title || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) { setError('Enter a title and an end time after the start time.'); return }
    setBusy(true); setError('')
    try {
      const item = await scheduleClassroomSession(classroomId, { title, startsAt: start.toISOString(), endsAt: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, mode: String(form.get('mode')) as ScheduledSession['mode'] })
      onOpenChange(false); onSaved(item)
    } catch (cause) { setError(getApiErrorMessage(cause, 'Could not save the schedule. Your draft is still here.')) }
    finally { setBusy(false) }
  }
  return <Dialog open={open} onOpenChange={next => { if (!busy) { setError(''); onOpenChange(next) } }}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Add schedule</DialogTitle><DialogDescription>Share an exam, meeting, or activity with everyone in this classroom.</DialogDescription></DialogHeader><form onSubmit={event => void save(event)} className="space-y-4"><fieldset disabled={busy} className="space-y-4"><label className="block space-y-2"><span className="text-sm font-medium">Title</span><Input name="title" required maxLength={120} placeholder="e.g. Prelim exam" /></label><label className="block space-y-2"><span className="text-sm font-medium">Starts</span><Input name="start" type="datetime-local" required /></label><label className="block space-y-2"><span className="text-sm font-medium">Ends</span><Input name="end" type="datetime-local" required /></label><p className="text-xs text-muted-foreground">Times in {Intl.DateTimeFormat().resolvedOptions().timeZone}</p><label className="block space-y-2"><span className="text-sm font-medium">Mode</span><select name="mode" defaultValue="IN_PERSON" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="IN_PERSON">In person</option><option value="ONLINE">Online</option><option value="HYBRID">Hybrid</option></select></label></fieldset>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={busy} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">{busy ? 'Saving…' : 'Save schedule'}</Button></form></DialogContent></Dialog>
}
