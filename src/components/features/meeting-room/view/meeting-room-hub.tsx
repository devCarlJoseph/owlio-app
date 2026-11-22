import { MeetingClassesSkeleton } from '../ui/meeting-room-skeleton'
import { ArrowUpRight, CalendarDays, GraduationCap, Languages, School, Video } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from 'cn'
import { useClassroomPrototype } from '@/components/features/classrooms/context/classroom-prototype-context'
import { StartPeerMeeting } from '../ui/start-peer-meeting'

const categories = [
  { value: 'educators', label: 'Classroom', description: 'Meet with your teacher and classmates.', icon: School, tone: 'bg-emerald-100 text-emerald-800 surface-dark:bg-surface-emerald-soft surface-dark:text-emerald-300' },
  { value: 'tutors', label: 'Tutor', description: 'Join individual or group tutoring.', icon: GraduationCap, tone: 'bg-sky-100 text-sky-800 surface-dark:bg-surface-sky-soft surface-dark:text-sky-300' },
  { value: 'esl', label: 'ESL', description: 'Practice with your ESL teacher.', icon: Languages, tone: 'bg-amber-100 text-amber-800 surface-dark:bg-surface-amber-soft surface-dark:text-amber-300' },
] as const

const studentMeetings = { value: 'students', label: 'Student meetings', description: 'Start a study call or join one with a code.', icon: Video, tone: 'bg-violet-100 text-violet-800 surface-dark:bg-surface-violet-soft surface-dark:text-violet-300' }

export function MeetingRoomHub() {
  const { pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const role = getDashboardRole(pathname) ?? 'students'
  const { getClassroomsForWorkspace, classroomsLoading, classroomsError, reloadClassrooms, connectedModeEnabled } = useClassroomPrototype()
  const selected = categories.find(item => item.value === params.get('category'))
  const peerAvailable = role === 'students' && connectedModeEnabled
  const peerSelected = peerAvailable && params.get('category') === 'students'
  const classrooms = getClassroomsForWorkspace(role)
  const matches = selected ? classrooms.filter(item => item.ownerWorkspace === selected.value) : []
  const base = `/${role}/classrooms/meeting-room`

  return <div className="@container mx-auto w-full max-w-6xl space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-linear-to-br from-teal-950 via-teal-900 to-emerald-800 p-5 text-white sm:px-8 sm:py-7">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Meeting Room</h2>
        <p className="max-w-lg text-sm leading-6 text-emerald-50">Find your class meeting, join with an invite, or see what’s scheduled.</p>
      </div>
      <Link to={`${base}?source=account`} className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-full bg-white/15 text-white hover:bg-white/25 hover:text-white dark:hover:bg-white/25')}><CalendarDays aria-hidden="true" />Scheduled sessions</Link>
    </header>
    <div role="group" aria-label="Meeting categories" className={cn('grid gap-3 @min-[32rem]:grid-cols-2', peerAvailable ? '@min-[55rem]:grid-cols-4' : '@min-[44rem]:grid-cols-3')}>
      {(peerAvailable ? [...categories, studentMeetings] : categories).map(({ value, label, description, icon: Icon, tone }) => <Button
        key={value} variant="outline" aria-pressed={value === 'students' ? peerSelected : selected?.value === value}
        onClick={() => setParams({ category: value })}
        className="h-auto min-w-0 items-start justify-start gap-3 whitespace-normal rounded-2xl border-border bg-card p-4 text-left aria-pressed:border-teal-600 aria-pressed:bg-teal-50 aria-pressed:ring-1 aria-pressed:ring-teal-600 surface-dark:aria-pressed:bg-teal-950"
      >
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tone)}><Icon aria-hidden="true" className="size-5" /></span>
        <span><span className="block font-semibold">{label}</span><span className="mt-1 block text-sm font-normal leading-5 text-muted-foreground">{description}</span></span>
      </Button>)}
    </div>
    {peerSelected ? <section className="flex flex-wrap items-start gap-3" aria-label="Student meeting actions">
      <StartPeerMeeting />
      <Link className={buttonVariants({ variant: 'outline' })} to={`${base}?category=students&join=1`}>Join with a meeting code</Link>
    </section> : !selected ? <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Select a meeting category to get started.</div> : <section aria-labelledby="meeting-category-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="meeting-category-heading" className="text-lg font-semibold">{selected.label} meetings</h3>
        <Link className={buttonVariants()} to={`${base}?category=${selected.value}&join=1`}><Video aria-hidden="true" />Use a meeting invite</Link>
      </div>
      {!connectedModeEnabled && <p className="text-sm text-muted-foreground">Class previews are shown below. Live meetings are unavailable in this preview.</p>}
      {connectedModeEnabled && classrooms.some(item => item.ownerWorkspace === null) && <p className="text-sm text-muted-foreground">Your classes can’t be grouped by teacher type yet. Use your teacher’s meeting invite to join.</p>}
      {classroomsLoading ? <MeetingClassesSkeleton /> : classroomsError ? <div role="alert" className="space-y-3 rounded-xl border p-4"><p>{classroomsError}</p><Button variant="outline" onClick={reloadClassrooms}>Try again</Button></div> : matches.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center"><p className="font-medium">No {selected.label.toLowerCase()} classes to show</p><p className="mt-2 text-sm text-muted-foreground">Use a meeting invite from your teacher when it’s time to join.</p></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map(classroom => <Card key={classroom.id} className="min-w-0 gap-4 overflow-hidden rounded-2xl pt-0">
          <CardHeader className="bg-linear-to-br from-teal-900 to-emerald-800 py-5 text-white"><h4 className="text-lg font-semibold wrap-break-word">{classroom.name}</h4><p className="text-sm text-emerald-50">{classroom.instructorName || 'Your teacher'}{classroom.isMock ? ' · Preview' : ''}</p></CardHeader>
          <CardContent className="mt-auto flex-row flex-wrap items-center justify-between">
            {classroom.archivedAt ? <p className="text-sm text-muted-foreground">Classroom ended.</p> : (classroom.meetingId || classroom.meetingCode) && !classroom.isMock ? <Link className={buttonVariants()} to={classroom.meetingId ? `${base}?category=${selected.value}&session=${encodeURIComponent(classroom.meetingId)}&code=${encodeURIComponent(classroom.meetingCode ?? "")}` : `${base}?category=${selected.value}&room=${encodeURIComponent(classroom.meetingCode!)}`}>Join meeting</Link> : <p className="text-sm text-muted-foreground">No meeting linked. Ask your teacher for an invite.</p>}
            <Link className={buttonVariants({ variant: 'ghost', size: 'sm' })} to={`/${role}/classrooms/${classroom.id}`}>Open class<ArrowUpRight aria-hidden="true" /></Link>
          </CardContent>
        </Card>)}
      </div>}
    </section>}
  </div>
}
