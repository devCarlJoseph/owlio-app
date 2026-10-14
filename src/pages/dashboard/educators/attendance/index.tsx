import {
  ArrowUpRight,
  CalendarDays,
  CalendarOff,
  ChevronDown,
  Clock,
  History,
  TriangleAlert,
  UserCheck,
  UserX,
} from "lucide-react"
import { Link } from "react-router"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const recordStates = [
  { label: "Not recorded", chip: "border-slate-200 bg-slate-100 text-slate-600" },
  { label: "Needs review", chip: "border-amber-200 bg-amber-50 text-amber-800" },
  { label: "Confirmed", chip: "border-emerald-200 bg-emerald-50 text-emerald-700" },
] as const

const attendanceStatuses = [
  { label: "Present", description: "The learner attended the session.", icon: UserCheck, tile: "bg-emerald-100 text-emerald-700", chip: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { label: "Absent", description: "The learner did not attend the session.", icon: UserX, tile: "bg-rose-100 text-rose-700", chip: "border-rose-200 bg-rose-50 text-rose-700" },
  { label: "Late", description: "The learner joined after the session started.", icon: Clock, tile: "bg-amber-100 text-amber-700", chip: "border-amber-200 bg-amber-50 text-amber-700" },
  { label: "Excused", description: "The absence was excused ahead of time.", icon: CalendarOff, tile: "bg-slate-200 text-slate-700", chip: "border-slate-200 bg-slate-100 text-slate-700" },
] as const

const sampleClassrooms = [
  { name: "3A", subject: "Mathematics", start: "08:00", end: "08:45", present: 23, total: 27, state: "Confirmed", learners: ["AN", "JW", "MP"], extra: 19 },
  { name: "3B", subject: "English Language", start: "08:00", end: "08:45", present: 19, total: 22, state: "Needs review", learners: ["KL", "DR", "SV"], extra: 15 },
  { name: "3C", subject: "Science", start: "09:00", end: "09:45", present: 24, total: 24, state: "Confirmed", learners: ["TB", "NC", "YA"], extra: 20 },
  { name: "3D", subject: "History", start: "09:00", end: "09:45", present: 17, total: 20, state: "Needs review", learners: ["EM", "FR", "GH"], extra: 13 },
  { name: "3E", subject: "Creative Arts", start: "10:00", end: "10:45", present: 21, total: 25, state: "Not recorded", learners: ["IL", "PS", "UW"], extra: 17 },
  { name: "3F", subject: "Music", start: "10:00", end: "10:45", present: 12, total: 18, state: "Needs review", learners: ["AX", "CD", "VR"], extra: 11 },
  { name: "3G", subject: "Computer Studies", start: "11:00", end: "11:45", present: 26, total: 26, state: "Confirmed", learners: ["KM", "QL", "ZS"], extra: 21 },
  { name: "3H", subject: "Physical Education", start: "11:00", end: "11:45", present: 15, total: 21, state: "Confirmed", learners: ["BJ", "NW", "OL"], extra: 12 },
] as const

const avatarTones = [
  "bg-emerald-200 text-emerald-900",
  "bg-amber-200 text-amber-900",
  "bg-rose-200 text-rose-900",
  "bg-sky-200 text-sky-900",
  "bg-violet-200 text-violet-900",
] as const

const boardSummary = [
  { value: "8", label: "Classrooms on this board", tile: "bg-emerald-50 text-emerald-700" },
  { value: "12", label: "Sessions today", tile: "bg-sky-50 text-sky-700" },
  { value: "3", label: "Needing review", tile: "bg-amber-50 text-amber-700" },
] as const

const sessionsToRecord = sampleClassrooms.filter(({ state }) => state !== "Confirmed").slice(0, 4)

function stateChip(label: string) {
  return recordStates.find((state) => state.label === label)?.chip ?? recordStates[0].chip
}

export default function EducatorAttendancePage() {
  const todayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Classroom records</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Attendance</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Record and review attendance for classrooms you own or are authorized to manage. Attendance is an official classroom record.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<a href="#attendance-history" />} variant="outline" size="sm" className="border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">Attendance history</Button>
          <Button render={<Link to="/educators/classrooms" />} variant="outline" size="sm" className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">View classrooms <ArrowUpRight aria-hidden="true" /></Button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="space-y-5">
          <section aria-label="Classroom attendance board" className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Classroom attendance</h3>
                <p className="mt-1 text-sm text-slate-600">Sessions in classrooms you are authorized to manage.</p>
              </div>
              <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample data</Badge>
            </div>

            <Alert className="mt-4 border-amber-200 bg-amber-50 text-amber-900">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle className="font-semibold">Example board</AlertTitle>
              <AlertDescription className="text-amber-800">The classroom cards, learners, and totals below are sample content. They are not connected to the classroom or attendance services and are not real records.</AlertDescription>
            </Alert>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { id: "attendance-filter-classroom", label: "Classroom", placeholder: "All classrooms" },
                { id: "attendance-filter-status", label: "Status", placeholder: "All statuses" },
                { id: "attendance-filter-date", label: "Date", placeholder: "Any date" },
              ].map(({ id, label, placeholder }) => (
                <div key={id} className="flex flex-col gap-1.5">
                  <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{label}</label>
                  <Select disabled>
                    <SelectTrigger id={id} disabled aria-describedby="attendance-filter-note" className="w-full justify-between rounded-full bg-slate-50">
                      <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                  </Select>
                </div>
              ))}
            </div>
            <p id="attendance-filter-note" className="mt-2 text-xs leading-5 text-slate-500" role="status">Filters activate when classroom sessions are connected.</p>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Sample classroom sessions">
              {sampleClassrooms.map((classroom, classroomIndex) => (
                <li key={classroom.name}>
                  <Card className="flex h-full flex-col gap-3 border-slate-200 bg-white px-4 py-4 shadow-sm ring-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base font-semibold text-slate-900">{classroom.name}</p>
                      <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample</Badge>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-700">Lesson</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">{classroom.subject}</p>
                    </div>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{classroom.start} – {classroom.end}</span>
                      <span aria-hidden="true">·</span>
                      <span>{classroom.present} of {classroom.total} present</span>
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <AvatarGroup>
                        {classroom.learners.map((initials, learnerIndex) => (
                          <Avatar key={initials} size="sm" className="size-6">
                            <AvatarFallback className={`text-[10px] font-semibold ${avatarTones[(classroomIndex + learnerIndex) % avatarTones.length]}`}>{initials}</AvatarFallback>
                          </Avatar>
                        ))}
                        <AvatarGroupCount className={`text-[10px] font-semibold ${avatarTones[classroomIndex % avatarTones.length]}`}>+{classroom.extra}</AvatarGroupCount>
                      </AvatarGroup>
                      <Badge variant="outline" className={stateChip(classroom.state)}>{classroom.state}</Badge>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500" role="status">Each card will show classroom, lesson, time range, present count, and one of these states:</span>
              {recordStates.map((state) => (
                <Badge key={state.label} variant="outline" className={state.chip}>{state.label}</Badge>
              ))}
            </div>
          </section>

          <Card className="border border-emerald-200 bg-emerald-50/40 shadow-sm ring-0">
            <CardHeader>
              <CardTitle><h3 className="text-base font-semibold text-slate-900">Roll call</h3></CardTitle>
              <CardDescription>Mark present, absent, late, or excused for one of your sessions.</CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <TriangleAlert aria-hidden="true" />
                <AlertTitle className="font-semibold">Nothing is saved here</AlertTitle>
                <AlertDescription className="text-amber-800">The attendance service is not connected, so no attendance record will be written.</AlertDescription>
              </Alert>
              <Collapsible className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-900 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 [&[data-panel-open]_svg]:rotate-180">
                  Show roll call scaffold
                  <ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t border-slate-200 px-4 py-4">
                  <ul className="grid gap-3 sm:grid-cols-2" aria-label="Attendance statuses">
                    {attendanceStatuses.map(({ label, description, icon: Icon, tile }) => (
                      <li key={label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <Checkbox disabled className="mt-1" aria-label={`${label} (not available yet)`} />
                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tile}`}><Icon className="size-4" aria-hidden="true" /></span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{label}</p>
                          <p className="mt-0.5 text-sm leading-5 text-slate-500">{description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs leading-5 text-slate-500" role="status">The learner roster is not connected, so no names can be marked yet.</p>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card id="attendance-history" className="scroll-mt-24 border border-sky-200 bg-sky-50/40 shadow-sm ring-0">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle><h3 className="text-base font-semibold text-slate-900">Attendance history</h3></CardTitle>
                  <CardDescription className="mt-1">Records by session and by learner.</CardDescription>
                </div>
                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">No history data</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Empty className="border border-dashed border-sky-200 bg-white/70">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-sky-100 text-sky-700"><History aria-hidden="true" /></EmptyMedia>
                  <EmptyTitle className="text-base font-semibold text-slate-900">No attendance history yet</EmptyTitle>
                  <EmptyDescription>Attendance history is not connected, so there are no records to display.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex-row flex-wrap items-center justify-center gap-2">
                  {attendanceStatuses.map((status) => (
                    <Badge key={status.label} variant="outline" className={status.chip}>{status.label}</Badge>
                  ))}
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border border-slate-200 bg-white shadow-sm ring-0">
            <CardContent className="gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CalendarDays className="size-5" aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Today</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{todayLabel}</p>
                </div>
              </div>
              <p className="text-xs leading-5 text-slate-500" role="status">Times will be shown with the classroom time zone once scheduling is connected.</p>
            </CardContent>
          </Card>

          <section aria-label="Board summary" className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Board summary</h3>
              <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample</Badge>
            </div>
            <div className="mt-3 space-y-2.5">
              {boardSummary.map(({ value, label, tile }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tile}`}><Clock className="size-4" aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-none text-slate-900">{value}</p>
                    <p className="mt-1 text-xs text-slate-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500" role="status">Example totals for this sample board.</p>
          </section>

          <Card className="border border-amber-200 bg-amber-50/40 shadow-sm ring-0">
            <CardHeader>
              <CardTitle><h3 className="text-base font-semibold text-slate-900">Sessions to record</h3></CardTitle>
              <CardDescription>Sessions on this board without a confirmed record.</CardDescription>
            </CardHeader>
            <CardContent className="gap-0">
              {sessionsToRecord.length === 0 ? (
                <Empty className="border border-amber-200 bg-white py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-amber-100 text-amber-700"><Clock aria-hidden="true" /></EmptyMedia>
                    <EmptyTitle className="text-base font-semibold text-slate-900">Nothing waiting</EmptyTitle>
                    <EmptyDescription>Every session on this sample board is confirmed.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
                  <ul aria-label="Sample sessions to record">
                    {sessionsToRecord.map(({ name, subject, state }, index) => (
                      <li key={name}>
                        {index > 0 && <Separator />}
                        <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{name}</p>
                            <p className="truncate text-xs text-slate-500">{subject}</p>
                          </div>
                          <Badge variant="outline" className={stateChip(state)}>{state}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs leading-5 text-slate-500" role="status">Starting a roll call needs the classroom session service.</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm ring-0">
            <CardHeader>
              <CardTitle><h3 className="text-base font-semibold text-slate-900">Status legend</h3></CardTitle>
              <CardDescription>How each attendance status is used.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2.5">
                {attendanceStatuses.map(({ label, description, chip }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <dt><Badge variant="outline" className={chip}>{label}</Badge></dt>
                    <dd className="min-w-0 text-sm leading-5 text-slate-500">{description}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}