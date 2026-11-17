import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { ClipboardCheck } from 'lucide-react'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { SessionAttendanceRegister } from '@/components/features/classrooms/view/classroom-attendance-view'
import { useAccountRecords } from '@/components/features/connected-workspace/hooks/use-account-records'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getClassrooms } from '@/services/api/classroom.service'
import { requestOperation } from '@/services/api/contract-client'
import { getClassroomSessions } from '@/services/api/meeting.service'

export function MeetingAttendance({ sessionId, role }: { sessionId: string; role: string }) {
  const [open, setOpen] = useState(false)
  return <><Button variant="outline" size="sm" className="shrink-0 self-start" onClick={() => setOpen(true)}><ClipboardCheck className="size-4" />Take attendance</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-5xl"><DialogHeader><DialogTitle>Class attendance</DialogTitle><DialogDescription>Mark each learner explicitly. Saved attendance is shared with the classroom Attendance tab.</DialogDescription></DialogHeader>{open && <MeetingRegister key={sessionId} sessionId={sessionId} role={role} />}</DialogContent></Dialog></>
}

function MeetingRegister({ sessionId, role }: { sessionId: string; role: string }) {
  const { user } = useAuthSession()
  const userId = user?.id
  const load = useCallback(async (signal?: AbortSignal) => {
    const [meeting, classrooms] = await Promise.all([
      requestOperation('GET /api/v1/sessions/{sessionId}/native-meeting', { params: { sessionId }, signal }),
      getClassrooms(signal),
    ])
    if (!meeting.isHost) throw new Error('Only the classroom owner can take attendance.')
    const start = Date.parse(meeting.startsAt)
    const from = new Date(start - 86400000).toISOString(), to = new Date(start + 86400000).toISOString()
    const candidates = classrooms.filter(item => item.ownerId === userId)
    // Resolve through authorized session lists; URL context never establishes classroom ownership.
    for (const classroom of candidates) {
      const sessions = await getClassroomSessions(classroom.id, from, to, signal)
      const session = sessions.find(item => item.id === sessionId)
      if (session) return [{ classroom, session }]
    }
    throw new Error('This meeting could not be matched to a classroom session. Refresh your classroom and try again.')
  }, [sessionId, userId])
  const state = useAccountRecords(load)
  const record = state.records[0]
  return state.loading ? <p role="status" className="p-8 text-sm text-muted-foreground">Loading the classroom register…</p> : state.error ? <div role="alert" className="space-y-3 text-sm"><p>{state.error}</p><Button variant="outline" onClick={state.reload}>Try again</Button></div> : record ? <div className="min-w-0 space-y-4"><Link className="inline-block text-sm text-indigo-600 underline surface-dark:text-indigo-300" to={`/${role}/classrooms/${encodeURIComponent(record.classroom.id)}?tab=attendance`}>Open {record.classroom.name} attendance</Link><SessionAttendanceRegister key={record.session.id} classroomId={record.classroom.id} session={record.session} /></div> : null
}
