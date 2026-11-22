import { useCallback, useEffect, useRef, useState } from 'react'
import { addMonths, format, startOfMonth } from 'date-fns'
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, Download, RefreshCw, Search, UserX, Users } from 'lucide-react'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { useAccountRecords } from '@/components/features/connected-workspace/hooks/use-account-records'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getApiErrorMessage } from '@/services/api/api-error'
import { attendanceStatuses, getAttendanceRoster, getOwnAttendance, getSessionAttendance, saveAttendance, type AttendanceRecord, type AttendanceStatus } from '@/services/api/attendance.service'
import { getClassroomSessions, type ScheduledSession } from '@/services/api/meeting.service'
import type { Classroom } from '../types/classroom-types'

const labels = { PRESENT: 'Present', LATE: 'Late', ABSENT: 'Absent', EXCUSED: 'Excused' }
const colors = { PRESENT: 'bg-emerald-50 text-emerald-700 surface-dark:bg-emerald-950 surface-dark:text-emerald-300', LATE: 'bg-orange-50 text-orange-700 surface-dark:bg-orange-950 surface-dark:text-orange-300', ABSENT: 'bg-rose-50 text-rose-700 surface-dark:bg-rose-950 surface-dark:text-rose-300', EXCUSED: 'bg-indigo-50 text-indigo-700 surface-dark:bg-indigo-950 surface-dark:text-indigo-300' }

export function ClassroomAttendanceView({ classroom }: { classroom: Classroom }) {
  const { user } = useAuthSession()
  const owner = classroom.access === 'owner' && classroom.ownerId === user?.id && Boolean(user?.roles.some(role => ['EDUCATOR', 'ESL', 'TUTOR'].includes(role)))
  return owner ? <ClassroomRegister classroomId={classroom.id} /> : <LearnerAttendance classroomId={classroom.id} />
}

function ClassroomRegister({ classroomId }: { classroomId: string }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState('')
  const from = month.toISOString(), to = addMonths(month, 1).toISOString()
  const load = useCallback((signal?: AbortSignal) => getClassroomSessions(classroomId, from, to, signal), [classroomId, from, to])
  const state = useAccountRecords(load)
  const session = state.records.find(item => item.id === selected) ?? state.records[0]
  return <section className="min-w-0 space-y-5" aria-label="Classroom attendance">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-semibold tracking-tight">Attendance</h3><p className="mt-1 text-sm text-muted-foreground">Your classroom register, for online and in-person sessions.</p></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon-sm" aria-label="Previous attendance month" onClick={() => { setMonth(addMonths(month, -1)); setSelected('') }}><ChevronLeft /></Button><span className="min-w-32 text-center text-sm font-medium">{format(month, 'MMMM yyyy')}</span><Button variant="ghost" size="icon-sm" aria-label="Next attendance month" onClick={() => { setMonth(addMonths(month, 1)); setSelected('') }}><ChevronRight /></Button></div></header>
    {state.loading ? <p role="status" className="p-6 text-sm text-muted-foreground">Loading sessions…</p> : state.error ? <Failure message={state.error} retry={state.reload} /> : state.records.length === 0 ? <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">No sessions this month. Add a session in the Schedule tab to take attendance.</div> : <>
      <Select value={session?.id ?? ''} onValueChange={value => { if (value) setSelected(value) }}><SelectTrigger aria-label="Attendance session" className="w-full sm:max-w-md"><SelectValue>{session ? `${session.title} · ${format(new Date(session.startsAt), 'MMM d, h:mm a')}` : 'Choose session'}</SelectValue></SelectTrigger><SelectContent>{state.records.map(item => <SelectItem key={item.id} value={item.id}>{item.title} · {format(new Date(item.startsAt), 'MMM d, h:mm a')}{item.status === 'CANCELLED' ? ' · Cancelled' : ''}</SelectItem>)}</SelectContent></Select>
      {session && <SessionAttendanceRegister key={session.id} classroomId={classroomId} session={session} />}
    </>}
  </section>
}

function Failure({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="space-y-3 rounded-lg border border-destructive/20 p-5 text-sm"><p>{message}</p><Button variant="outline" size="sm" onClick={retry}>Try again</Button></div>
}

export function SessionAttendanceRegister({ classroomId, session }: { classroomId: string; session: ScheduledSession }) {
  const load = useCallback(async (signal?: AbortSignal) => {
    const [roster, records] = await Promise.all([getAttendanceRoster(classroomId, signal), getSessionAttendance(session.id, signal)])
    return roster.map(member => ({ ...member, record: records.find(record => record.studentId === member.studentId) as AttendanceRecord | undefined }))
  }, [classroomId, session.id])
  const state = useAccountRecords(load)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const pending = useRef(false)
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  const rows = state.records.filter(member => member.name.toLowerCase().includes(query.toLowerCase()) && (filter === 'ALL' || (member.record?.status ?? 'UNRECORDED') === filter))
  const ready = !state.loading && !state.error
  const metrics = [
    { label: 'Learners present', value: state.records.filter(item => item.record?.status === 'PRESENT').length, icon: CheckCircle2, note: 'Marked present by the educator' },
    { label: 'Late arrivals', value: state.records.filter(item => item.record?.status === 'LATE').length, icon: Clock3, note: 'Marked late for this session' },
    { label: 'Learners absent', value: state.records.filter(item => item.record?.status === 'ABSENT').length, icon: UserX, note: 'Explicitly recorded absences' },
    { label: 'Not recorded', value: state.records.filter(item => !item.record).length, icon: Users, note: 'Awaiting your attendance check' },
  ]
  async function mark(studentId: string, status: AttendanceStatus) {
    if (pending.current || !ready || session.status === 'CANCELLED') return
    const member = state.records.find(item => item.studentId === studentId)
    if (!member || member.record?.status === status) return
    pending.current = true; setBusy(studentId); setError(''); setNotice('')
    try {
      const saved = await saveAttendance(session.id, studentId, status, member.record?.version ?? 0)
      if (!alive.current) return
      state.setRecords(items => items.map(item => item.studentId === studentId ? { ...item, record: saved } : item))
      setNotice(`Attendance saved for ${member.name}. Available in the classroom Attendance tab.`)
    } catch (cause) {
      if (!alive.current) return
      setError(getApiErrorMessage(cause, 'Attendance could not be saved. Refresh the register before trying again.'))
      state.reload()
    } finally { pending.current = false; if (alive.current) setBusy('') }
  }
  function download() {
    const cell = (value: string) => '"' + value.replaceAll('"', '""').replace(/^[=+@\-\t\r]/, "'$&") + '"'
    const csv = [['Learner ID', 'Name', 'Session', 'Starts at', 'Status'], ...rows.map(item => [item.studentId, item.name, session.title, session.startsAt, item.record ? labels[item.record.status] : 'Not recorded'])].map(row => row.map(cell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `attendance-${session.id}.csv`; anchor.click(); URL.revokeObjectURL(url)
  }
  return <div className="min-w-0 space-y-4">
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, note }) => <div key={label} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5"><p className="flex items-center gap-2 text-xs font-medium"><Icon aria-hidden="true" className="size-3.5 shrink-0 text-indigo-500" />{label}</p><p className="mt-4 text-3xl font-semibold tracking-tight">{ready ? value : '—'}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{note}</p></div>)}</div>
    <section className="min-w-0 rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5" aria-label="Attendance history">
      <div className="mb-5 flex items-center justify-between gap-3"><h4 className="flex items-center gap-2 text-sm font-semibold"><ClipboardCheck className="size-4 text-indigo-500" />Attendance history</h4><Button variant="ghost" size="icon-sm" aria-label="Refresh attendance" disabled={state.loading || Boolean(busy)} onClick={() => { setError(''); setNotice(''); state.reload() }}><RefreshCw className="size-4" /></Button></div>
      <p className="mb-4 text-xs leading-5 text-muted-foreground">{format(new Date(session.startsAt), 'EEE, MMM d, yyyy · h:mm a')} · {session.mode === 'IN_PERSON' ? 'In person' : session.mode === 'ONLINE' ? 'Online' : 'Hybrid'} · {session.title}{session.status === 'CANCELLED' ? ' · Cancelled — read only' : ''}</p>
      <div className="mb-4 flex flex-wrap items-center gap-2"><Select value={filter} onValueChange={value => { if (value) setFilter(value) }}><SelectTrigger aria-label="Filter attendance status" className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem>{attendanceStatuses.map(value => <SelectItem key={value} value={value}>{labels[value]}</SelectItem>)}<SelectItem value="UNRECORDED">Not recorded</SelectItem></SelectContent></Select><div className="relative min-w-40 flex-1 sm:ml-auto sm:max-w-56"><Search aria-hidden="true" className="absolute top-2.5 left-3 size-3.5 text-muted-foreground" /><Input aria-label="Search learner" placeholder="Search learner" className="pl-9 text-xs" value={query} onChange={event => setQuery(event.target.value)} /></div><Button size="sm" disabled={!ready || rows.length === 0 || Boolean(busy)} onClick={download}><Download className="size-3.5" />Download data</Button></div>
      {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}{notice && <p role="status" className="mb-3 text-xs text-emerald-700 surface-dark:text-emerald-300">{notice}</p>}
      {state.loading ? <p role="status" className="py-10 text-center text-sm text-muted-foreground">Loading attendance…</p> : state.error ? <Failure message={state.error} retry={state.reload} /> : <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-xs"><caption className="sr-only">Learner attendance for {session.title}</caption><thead className="bg-muted/40 text-muted-foreground"><tr>{['Learner', 'Session', 'Mode', 'Status'].map(title => <th scope="col" key={title} className="px-3 py-3 font-medium">{title}</th>)}</tr></thead><tbody className="divide-y divide-border/60">{rows.map(member => <tr key={member.studentId}><td className="px-3 py-4"><span className="flex items-center gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-600 surface-dark:bg-indigo-950 surface-dark:text-indigo-300">{member.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('')}</span><span className="font-medium">{member.name}</span></span></td><td className="max-w-48 truncate px-3 py-4 text-muted-foreground">{session.title}</td><td className="px-3 py-4 text-muted-foreground">{session.mode === 'IN_PERSON' ? 'In person' : session.mode === 'ONLINE' ? 'Online' : 'Hybrid'}</td><td className="px-3 py-3"><Select value={member.record?.status ?? null} disabled={Boolean(busy) || session.status === 'CANCELLED'} onValueChange={value => { if (value && attendanceStatuses.includes(value as AttendanceStatus)) void mark(member.studentId, value as AttendanceStatus) }}><SelectTrigger aria-label={`Attendance for ${member.name}`} size="sm" className={`min-w-32 rounded-full border-0 text-xs shadow-none ${member.record ? colors[member.record.status] : 'bg-muted text-muted-foreground'}`}><SelectValue placeholder="Not recorded">{busy === member.studentId ? 'Saving…' : member.record ? labels[member.record.status] : 'Not recorded'}</SelectValue></SelectTrigger><SelectContent>{attendanceStatuses.map(value => <SelectItem key={value} value={value}>{labels[value]}</SelectItem>)}</SelectContent></Select></td></tr>)}</tbody></table>{rows.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">{state.records.length ? 'No learners match your filters.' : 'No enrolled learners to display.'}</p>}</div>}
      <p className="mt-4 border-t border-border/60 pt-3 text-[11px] leading-5 text-muted-foreground">Attendance is recorded explicitly by the educator. Joining or leaving a meeting does not mark attendance.</p>
    </section>
  </div>
}

function LearnerAttendance({ classroomId }: { classroomId: string }) {
  const load = useCallback((signal?: AbortSignal) => getOwnAttendance(classroomId, signal), [classroomId])
  const state = useAccountRecords(load)
  return <section className="space-y-4 rounded-xl border bg-card p-5"><header className="flex items-center justify-between"><h3 className="font-semibold">Your attendance</h3><Button variant="ghost" size="sm" disabled={state.loading} onClick={state.reload}>Refresh</Button></header><p className="text-sm text-muted-foreground">Your educator-recorded attendance for this classroom.</p>{state.loading ? <p role="status">Loading attendance…</p> : state.error ? <Failure message={state.error} retry={state.reload} /> : <ul className="divide-y divide-border">{[...state.records].sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map(item => <li key={item.sessionId} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"><time dateTime={item.startsAt}>{format(new Date(item.startsAt), 'MMM d, yyyy · h:mm a')}</time><span className={`rounded-full px-3 py-1 text-xs ${colors[item.status]}`}>{labels[item.status]}</span></li>)}</ul>}{!state.loading && !state.error && state.records.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No attendance recorded yet.</p>}</section>
}
