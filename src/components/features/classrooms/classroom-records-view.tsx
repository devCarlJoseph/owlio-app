import { useState, type FormEvent } from "react"
import { BookOpen, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { AttendanceStatus, Classroom, WorkspaceRole } from "./classroom-types"

export function ClassroomMaterialsView({
  classroom,
  kindGroup = "all",
}: {
  classroom: Classroom
  kindGroup?: "all" | "media" | "files"
}) {
  const materials = classroom.materials.filter((material) => kindGroup === "all"
    || (kindGroup === "media" ? material.kind === "Link" || material.kind === "Video" : material.kind === "Document" || material.kind === "Presentation"),
  )
  const title = kindGroup === "media" ? "Class media" : kindGroup === "files" ? "Class files" : "Class materials"
  const headingId = kindGroup === "all" ? "materials-heading" : `${kindGroup}-heading`
  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div>
        <h3 id={headingId} className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">Resources listed for {classroom.name}.</p>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Resource entries are preview metadata only. No documents or media are uploaded or stored.</p>
      {materials.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-8 text-sm text-slate-600">{classroom.isMock ? `No demo ${kindGroup === "all" ? "materials" : kindGroup} in this classroom yet.` : `No ${kindGroup === "all" ? "materials" : kindGroup} are connected to this classroom.`}</CardContent></Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {materials.map((material) => (
            <li key={material.id}>
              <Card>
                <CardContent className="flex items-start gap-3 py-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><BookOpen aria-hidden="true" className="size-4" /></span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900">{material.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{material.description}</p>
                    <Badge variant="outline" className="mt-2">{material.kind} · demo</Badge>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ClassroomPeopleView({ classroom }: { classroom: Classroom }) {
  return (
    <section className="space-y-4" aria-labelledby="people-heading">
      <div>
        <h3 id="people-heading" className="text-lg font-semibold text-slate-900">People in this class</h3>
        <p className="mt-1 text-sm text-slate-600">{classroom.isMock
          ? classroom.access === 'student' ? 'Your instructor and your own enrollment.' : `${classroom.members.length} demo members.`
          : "Connected classroom membership is verified by the API."}
        </p>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">{classroom.isMock
        ? "This is a sample roster, not live membership data."
        : "The classroom API does not return a full member roster yet; only the instructor and current learner context are shown."}
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {classroom.members.map((member) => (
          <li key={member.id}>
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{member.name}</p>
                  <p className="text-xs capitalize text-slate-500">{member.role} · demo</p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ClassroomScheduleView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { addSession } = useClassroomPrototype()
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState("")
  const isStudent = role === "students"

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    addSession(classroom.id, {
      title: String(form.get("session-title") ?? "").trim(),
      date: String(form.get("session-date") ?? ""),
      time: String(form.get("session-time") ?? ""),
      meetingNote: "Demo schedule · local time",
    })
    event.currentTarget.reset()
    setShowForm(false)
    setStatus("Demo session added for this in-memory preview only.")
  }

  return (
    <section className="space-y-4" aria-labelledby="schedule-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="schedule-heading" className="text-lg font-semibold text-slate-900">Class schedule</h3>
          <p className="mt-1 text-sm text-slate-600">Sessions for {classroom.name}.</p>
        </div>
        {!isStudent && <Button type="button" variant="outline" onClick={() => setShowForm((current) => !current)}><CalendarDays aria-hidden="true" /> Add session preview</Button>}
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">Schedule entries are local-time mock previews. No reminders, recurrence, or calendar integration is active.</p>
      {status && <p role="status" className="text-sm text-amber-800">{status}</p>}
      {showForm && !isStudent && (
        <Card>
          <CardHeader><CardTitle>Add a demo session</CardTitle><CardDescription>This session will appear only in this app session.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2 sm:col-span-3"><Label htmlFor="session-title">Session name</Label><Input id="session-title" name="session-title" required maxLength={80} /></div>
              <div className="grid gap-2"><Label htmlFor="session-date">Date</Label><Input id="session-date" name="session-date" type="date" required /></div>
              <div className="grid gap-2"><Label htmlFor="session-time">Local time</Label><Input id="session-time" name="session-time" type="time" required /></div>
              <div className="flex items-end gap-2"><Button type="submit">Add demo session</Button><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </CardContent>
        </Card>
      )}
      {classroom.sessions.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-8 text-sm text-slate-600">No demo sessions scheduled.</CardContent></Card>
      ) : (
        <ol className="space-y-3">
          {classroom.sessions.map((session) => (
            <li key={session.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center gap-3 py-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><CalendarDays aria-hidden="true" className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900">{session.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{session.date} · {session.time} · {session.meetingNote}</p>
                  </div>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo</Badge>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function ClassroomAttendanceView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { markAttendance, currentLearnerId } = useClassroomPrototype()
  const [status, setStatus] = useState("")
  const isStudent = role === "students"
  const sessions = classroom.sessions
  const statuses: AttendanceStatus[] = ["Present", "Absent", "Late", "Excused"]
  const learnerMembers = classroom.members.filter((member) => member.role === "student")
  const visibleMembers = isStudent ? learnerMembers.filter((member) => member.id === currentLearnerId) : learnerMembers

  return (
    <section className="space-y-4" aria-labelledby="attendance-heading">
      <div>
        <h3 id="attendance-heading" className="text-lg font-semibold text-slate-900">Attendance</h3>
        <p className="mt-1 text-sm text-slate-600">{isStudent ? "Your permitted attendance preview for this class." : "Educator-managed attendance preview for this class."}</p>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">Attendance here is mock data and does not create an official record. It is recorded explicitly by the teacher, never inferred from meeting presence.</p>
      {status && <p role="status" className="text-sm text-amber-800">{status}</p>}
      {sessions.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-8 text-sm text-slate-600">Add a demo session before viewing attendance.</CardContent></Card>
      ) : sessions.map((session) => (
        <Card key={session.id}>
          <CardHeader><CardTitle className="text-base">{session.title}</CardTitle><CardDescription>{session.date} · {session.time} · demo</CardDescription></CardHeader>
          <CardContent>
            {visibleMembers.length === 0 ? (
              <p className="text-sm text-slate-600">No demo learner attendance to display.</p>
            ) : (
              <ul className="space-y-3">
                {visibleMembers.map((member) => {
                  const record = classroom.attendance.find((item) => item.sessionId === session.id && item.learnerId === member.id)
                  return (
                    <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="text-sm font-medium text-slate-800">{isStudent ? "You · demo learner" : member.name}</span>
                      {isStudent ? (
                        <Badge variant="outline">{record?.status ?? "Not recorded · demo"}</Badge>
                      ) : (
                        <Label className="sr-only" htmlFor={`attendance-${session.id}-${member.id}`}>Attendance for {member.name}</Label>
                      )}
                      {!isStudent && (
                        <select
                          id={`attendance-${session.id}-${member.id}`}
                          value={record?.status ?? ""}
                          onChange={(event) => {
                            const nextStatus = event.currentTarget.value as AttendanceStatus
                            if (!nextStatus) return
                            markAttendance(classroom.id, session.id, member.id, nextStatus)
                            setStatus(`${member.name}'s attendance preview was changed for this session only.`)
                          }}
                          className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <option value="" disabled>Select status</option>
                          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

export function ClassroomProgressView({ classroom, role }: { classroom: Classroom; role: WorkspaceRole }) {
  const { currentLearnerId } = useClassroomPrototype()
  const isStudent = role === "students"
  const progress = classroom.progress.filter((record) => isStudent
    ? record.learnerId === currentLearnerId && record.released
    : true,
  )

  return (
    <section className="space-y-4" aria-labelledby="progress-heading">
      <div>
        <h3 id="progress-heading" className="text-lg font-semibold text-slate-900">{isStudent ? "Your released results" : classroom.ownerWorkspace === "tutors" || classroom.ownerWorkspace === "esl" ? "Learner evaluations" : "Grades & progress"}</h3>
        <p className="mt-1 text-sm text-slate-600">{isStudent ? "Only your released classroom feedback is shown." : `Mock learning records for ${classroom.name}.`}</p>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">Preview records only. These are not official grades or saved progress.</p>
      {progress.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-8 text-sm text-slate-600">{isStudent ? "No released demo results yet." : "No demo evaluations yet."}</CardContent></Card>
      ) : (
        <ul className="space-y-3">
          {progress.map((record) => (
            <li key={record.id}>
              <Card>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{record.activityTitle}</h4>
                      {!isStudent && <p className="mt-1 text-xs text-slate-500">{record.learnerName}</p>}
                    </div>
                    <Badge variant="outline">{record.evaluation} · {record.released ? 'Released' : 'Unreleased'}</Badge>
                  </div>
                  {record.feedback && <p className="mt-3 whitespace-pre-wrap text-sm leading-5 text-slate-700">{record.feedback}</p>}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
