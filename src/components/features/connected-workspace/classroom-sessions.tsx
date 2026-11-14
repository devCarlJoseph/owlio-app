import { useCallback, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { useAuthSession } from '@/components/features/auth/auth-session-context'
import { useClassroomPrototype } from '@/components/features/classrooms/classroom-prototype-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getClassroomSessions, scheduleClassroomSession, type ScheduledSession } from '@/services/api/meeting.service'
import { RecordStatus } from './personal-workspace'
import { useAccountRecords } from './use-account-records'

export function ClassroomSessions() {
  const { user } = useAuthSession()
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const { getClassroomsForWorkspace, classroomsLoading, classroomsError, reloadClassrooms } = useClassroomPrototype()
  const classrooms = getClassroomsForWorkspace(role)
  const [selectedId, setSelectedId] = useState('')
  const classroom = classrooms.find(item => item.id === selectedId) ?? classrooms[0]
  return <section className="mx-auto max-w-5xl space-y-5"><header><h2 className="text-2xl font-semibold">Sessions</h2><p className="mt-2 text-sm text-muted-foreground">Scheduled sessions for your classes. Online rooms open shortly before a session starts.</p></header>
    {classroomsLoading ? <p role="status">Loading your classes…</p> : classroomsError ? <div role="alert"><p>{classroomsError}</p><Button variant="outline" onClick={reloadClassrooms}>Try again</Button></div> : classrooms.length === 0 ? <p className="rounded-2xl border p-6">Join or create a class to see its sessions.</p> : <>
      <label className="block space-y-2"><span className="text-sm">Classroom</span><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={classroom?.id ?? ''} onChange={event => setSelectedId(event.target.value)}>{classrooms.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {classroom && <ClassroomSessionList key={classroom.id} classroomId={classroom.id} role={role} canSchedule={classroom.ownerId === user?.id && Boolean(user?.roles.some(item => ['EDUCATOR', 'TUTOR', 'ESL'].includes(item)))} />}
    </>}
  </section>
}

function ClassroomSessionList({ classroomId, role, canSchedule }: { classroomId: string; role: string; canSchedule: boolean }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const load = useCallback((signal?: AbortSignal) => {
    const from = new Date(month + '-01T00:00:00Z')
    const to = new Date(from); to.setUTCMonth(to.getUTCMonth() + 1)
    return getClassroomSessions(classroomId, from.toISOString(), to.toISOString(), signal)
  }, [classroomId, month])
  // A new window remounts to clear previous records before starting the next read.
  return <><label className="block max-w-xs space-y-2"><span className="text-sm">Month (UTC)</span><Input type="month" required value={month} onChange={event => { if (event.target.value) setMonth(event.target.value) }} /></label><SessionWindow key={month} classroomId={classroomId} role={role} canSchedule={canSchedule} load={load} /></>
}

function SessionWindow({ classroomId, role, canSchedule, load }: { classroomId: string; role: string; canSchedule: boolean; load: (signal?: AbortSignal) => Promise<ScheduledSession[]> }) {
  const state = useAccountRecords(load)
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [mode, setMode] = useState<'ONLINE' | 'IN_PERSON' | 'HYBRID'>('ONLINE')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const create = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      if (new Date(end).getTime() <= new Date(start).getTime()) throw new Error('End time must be after start time.')
      await scheduleClassroomSession(classroomId, { title: title.trim(), startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, mode })
      setTitle(''); setStart(''); setEnd(''); setNotice('Session saved. Select its month to view it.'); state.reload()
    } catch (cause) { setError(getApiErrorMessage(cause, 'Could not schedule the session. Your draft is still here.')) }
    finally { setBusy(false) }
  }
  return <div className="space-y-5"><RecordStatus {...state} />{error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {canSchedule && <form onSubmit={event => void create(event)} className="space-y-4 rounded-2xl border bg-card p-5" aria-label="Schedule session">
      <h3 className="font-semibold">Schedule a session</h3>
      <label className="block space-y-2"><span className="text-sm">Title</span><Input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} disabled={busy} /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-2"><span className="text-sm">Starts (local time)</span><Input required type="datetime-local" value={start} onChange={event => setStart(event.target.value)} disabled={busy} /></label><label className="block space-y-2"><span className="text-sm">Ends (local time)</span><Input required type="datetime-local" value={end} onChange={event => setEnd(event.target.value)} disabled={busy} /></label></div>
      <label className="block space-y-2"><span className="text-sm">Session mode</span><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={mode} onChange={event => setMode(event.target.value as typeof mode)} disabled={busy}><option value="ONLINE">Online</option><option value="IN_PERSON">In person</option><option value="HYBRID">Hybrid</option></select></label>
      <Button disabled={busy}>{busy ? 'Saving…' : 'Schedule session'}</Button>
    </form>}
    {!state.loading && !state.error && <><Button variant="outline" disabled={busy} onClick={state.reload}>Refresh sessions</Button>
      {state.records.length === 0 && <p className="rounded-xl border p-6">No sessions scheduled in this month.</p>}
      <ul className="space-y-3">{state.records.map(item => <li key={item.id} className="space-y-3 rounded-2xl border bg-card p-5"><h3 className="font-semibold">{item.title}</h3><p className="text-sm">{new Date(item.startsAt).toLocaleString()} – {new Date(item.endsAt).toLocaleTimeString()} · {item.mode.replace('_', ' ').toLowerCase()} · {item.status.toLowerCase()}</p>
        {item.mode !== 'IN_PERSON' && item.status === 'SCHEDULED' && <Link className="inline-block text-sm underline" to={'/' + role + '/classrooms/meeting-room?session=' + item.id}>Open meeting room</Link>}
      </li>)}</ul></>}
  </div>
}

