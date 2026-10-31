import { GraduationCap, Languages, School, Video } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useClassroomPrototype } from '@/components/features/classrooms/classroom-prototype-context'

const categories = [
  { value: 'educators', label: 'Classroom', description: 'Meet with your school educator and classmates.', icon: School },
  { value: 'tutors', label: 'Tutor', description: 'Join your tutor for individual or group learning.', icon: GraduationCap },
  { value: 'esl', label: 'ESL', description: 'Meet your ESL teacher for language practice.', icon: Languages },
] as const

export function MeetingRoomHub() {
  const { pathname } = useLocation()
  const [params, setParams] = useSearchParams()
  const role = getDashboardRole(pathname) ?? 'students'
  const { getClassroomsForWorkspace, classroomsLoading, classroomsError, reloadClassrooms, connectedModeEnabled } = useClassroomPrototype()
  const selected = categories.find(item => item.value === params.get('category'))
  const classrooms = getClassroomsForWorkspace(role)
  const matches = selected ? classrooms.filter(item => item.ownerWorkspace === selected.value) : []
  const base = `/${role}/classrooms/meeting-room`

  return <div className="mx-auto w-full max-w-6xl space-y-6">
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Meeting Room</h2>
      <p className="mt-2 text-sm text-muted-foreground">Choose where you’re learning, then join with your teacher’s meeting invite.</p>
    </div>
    <div role="group" aria-label="Meeting categories" className="grid gap-4 lg:grid-cols-3">
      {categories.map(({ value, label, description, icon: Icon }) => <Button
        key={value} variant="outline" aria-pressed={selected?.value === value}
        onClick={() => setParams({ category: value })}
        className="h-auto min-w-0 items-start justify-start gap-4 whitespace-normal rounded-2xl bg-card p-5 text-left aria-pressed:border-brand aria-pressed:bg-brand/5 aria-pressed:ring-1 aria-pressed:ring-brand"
      >
        <Icon aria-hidden="true" className="mt-1 size-6 shrink-0 text-brand" />
        <span><span className="block text-base font-semibold">{label}</span><span className="mt-2 block text-sm font-normal leading-6 text-muted-foreground">{description}</span></span>
      </Button>)}
    </div>
    {!selected ? <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Select Classroom, Tutor, or ESL to find your learning group.</div> : <section aria-labelledby="meeting-category-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="meeting-category-heading" className="text-lg font-semibold">{selected.label} meetings</h3>
        <Link className={buttonVariants()} to={`${base}?category=${selected.value}&join=1`}><Video aria-hidden="true" />Use a meeting invite</Link>
      </div>
      {!connectedModeEnabled && <p className="text-sm text-muted-foreground">Class previews are shown below. Live meetings are unavailable in this preview.</p>}
      {connectedModeEnabled && classrooms.some(item => item.ownerWorkspace === null) && <p className="text-sm text-muted-foreground">Your classes can’t be grouped by teacher type yet. Use your teacher’s meeting invite to join.</p>}
      {classroomsLoading ? <p role="status">Loading your classes…</p> : classroomsError ? <div role="alert" className="space-y-3 rounded-xl border p-4"><p>{classroomsError}</p><Button variant="outline" onClick={reloadClassrooms}>Try again</Button></div> : matches.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center"><p className="font-medium">No {selected.label.toLowerCase()} classes to show</p><p className="mt-2 text-sm text-muted-foreground">Use a meeting invite from your teacher when it’s time to join.</p></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map(classroom => <Card key={classroom.id}>
          <CardHeader><h4 className="font-semibold">{classroom.name}</h4><p className="text-sm text-muted-foreground">{classroom.instructorName || 'Your teacher'}{classroom.isMock ? ' · Preview' : ''}</p></CardHeader>
          <CardContent>
            {classroom.meetingId && !classroom.isMock ? <Link className={buttonVariants()} to={`${base}?category=${selected.value}&room=${encodeURIComponent(classroom.meetingId)}`}>Join meeting</Link> : <p className="text-sm text-muted-foreground">No meeting linked. Ask your teacher for an invite.</p>}
            <Link className="rounded text-sm text-brand underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" to={`/${role}/classrooms/${classroom.id}`}>Open class</Link>
          </CardContent>
        </Card>)}
      </div>}
    </section>}
  </div>
}
