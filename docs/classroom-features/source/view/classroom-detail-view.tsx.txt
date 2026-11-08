import { useState } from 'react'
import { ArrowLeft, BookOpen, Users, Video } from 'lucide-react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClassroomPrototype } from './classroom-prototype-context'
import { ClassroomMembersView } from './classroom-members-view'
import { UnderDevelopment } from './classroom-ui'
import { ClassroomPreviewNotice } from './classroom-preview-notice'
import { getClassroomCoverUrl } from './classroom-covers'
import { getClassroomCategory } from './classroom-list-meta'
import { ClassroomFeedView } from './classroom-feed-view'
import { ClassroomClassworkView } from './classroom-classwork-view'
import { ClassroomAttendanceView, ClassroomMaterialsView, ClassroomPeopleView, ClassroomProgressView, ClassroomScheduleView } from './classroom-records-view'

const sections = [{ value: 'feed', label: 'Discussion' }, { value: 'classwork', label: 'Classwork' },
  { value: 'materials', label: 'Materials' }, { value: 'schedule', label: 'Schedule' },
  { value: 'people', label: 'Members' }, { value: 'about', label: 'About' },
  { value: 'attendance', label: 'Attendance' }, { value: 'progress', label: 'Grades & Feedback' }]

export function ClassroomDetailView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const { classroomId } = useParams()
  const [params, setParams] = useSearchParams()
  const { getClassroom, classroomsLoading, classroomsError, reloadClassrooms } = useClassroomPrototype()
  const [notice, setNotice] = useState('')
  const classroom = classroomId ? getClassroom(classroomId) : undefined
  const tabs = [...sections, ...(params.get('tab') === 'chat' ? [{ value: 'chat', label: 'Chat' }] : [])]
  const defaultTab = classroom?.isMock ? 'feed' : 'about'
  const tab = tabs.find(item => item.value === params.get('tab'))?.value ?? defaultTab
  const owned = classroom?.access === 'owner'
  const visible = classroom && (role === 'students' ? !owned : owned)
  if (classroomsLoading) return <p role="status">Loading classroom…</p>
  if (classroomsError) return <section role="alert" className="space-y-3 rounded-xl border p-6"><h2>Classroom could not be loaded</h2><p>{classroomsError}</p><Button onClick={reloadClassrooms}>Try again</Button></section>
  if (!classroom || !visible) return <section className="space-y-3 rounded-xl border p-6"><h2>Classroom unavailable</h2>
    <p>This classroom is not available to your account in this workspace.</p><Link className="underline" to={'/' + role + '/classrooms'}>Back to classrooms</Link></section>
  const selectTab = (value: string) => setParams(current => { const next = new URLSearchParams(current); if (value === defaultTab) next.delete('tab'); else next.set('tab', value); return next }, { replace: true })
  async function copyCode() {
    if (!classroom?.joinCode) return
    try { await navigator.clipboard.writeText(classroom.joinCode); setNotice('Classroom invite code copied.') }
    catch { setNotice('Copy was unavailable. Select the invite code to copy it manually.') }
  }
  return <div className="mx-auto max-w-7xl space-y-5">
    <Link className="inline-flex items-center gap-2 rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" to={'/' + role + '/classrooms'}><ArrowLeft aria-hidden="true" className="size-4" />Back to classrooms</Link>
    <ClassroomPreviewNotice role={role} classroomId={classroom.id} />
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative h-32 overflow-hidden sm:h-44"><img src={getClassroomCoverUrl(classroom.id)} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" /><span className="absolute right-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-medium">{getClassroomCategory(classroom)}</span></div>
      <header className="relative flex flex-wrap items-end justify-between gap-5 px-5 pb-6 sm:px-7">
        <div className="min-w-0 flex-1 basis-80"><div className="relative -mt-8 mb-4 flex size-20 items-center justify-center rounded-2xl border-4 border-card bg-brand-soft shadow-sm"><img src="/mascot/owlio-mark.png" alt="" className="size-12 object-contain" /></div><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{classroom.name}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1.5"><BookOpen aria-hidden="true" className="size-4" />{classroom.instructorName || 'Instructor details unavailable'}</span>{owned && classroom.isMock && <span className="inline-flex items-center gap-1.5"><Users aria-hidden="true" className="size-4" />{classroom.enrolledLearnerIds.length} enrolled learners · preview</span>}<span>{owned ? 'Teaching workspace' : 'Enrolled member'}</span></p>
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => selectTab('classwork')}>View classwork</Button>
          {classroom.meetingId && <Link className={buttonVariants()} to={`/${role}/classrooms/meeting-room?room=${encodeURIComponent(classroom.meetingId)}`}><Video aria-hidden="true" />Meeting room</Link>}
        </div>
      </header>
    </section>
    {owned && <details className="rounded-xl border border-border bg-card p-4"><summary className="cursor-pointer rounded text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">Teacher tools · classroom invite</summary><section aria-label="Classroom invite" className="mt-4 space-y-3"><h3 className="text-sm font-semibold">Student invite code</h3>
      {classroom.joinCode ? <><code className="block break-all select-all rounded-lg bg-muted p-3 text-sm">{classroom.joinCode}</code><Button variant="outline" onClick={() => void copyCode()}>Copy invite code</Button>
        <p className="text-xs text-muted-foreground">{classroom.isMock ? 'Use this code in the student preview to enroll Alex Rivera. This is a demo invite, valid in this tab until refresh.' : 'Keep this code private. Save it now; it cannot be retrieved after reloading or signing out.'}</p></>
        : <p className="text-sm text-muted-foreground">The code was shown when this classroom was created. Retrieving or replacing a lost code is not available yet.</p>}
      {notice && <p role="status" className="text-sm">{notice}</p>}</section></details>}
    <Tabs value={tab} onValueChange={selectTab}>
      <div className="max-w-full overflow-x-auto rounded-xl border border-border bg-card p-1"><TabsList variant="line" className="h-12 min-w-max">{tabs.map(item => <TabsTrigger key={item.value} value={item.value} className="px-4 py-3">{item.value === 'progress' && classroom.ownerWorkspace !== 'educators' ? 'Progress & Feedback' : item.label}</TabsTrigger>)}</TabsList></div>
      <TabsContent value="about" className="space-y-3 rounded-2xl border border-border bg-card p-6"><h3 className="font-semibold">About this classroom</h3><p className="text-sm leading-6 text-muted-foreground">{classroom.description || 'No description provided.'}</p><p className="text-xs text-muted-foreground">{classroom.isMock ? 'Shared classroom preview. Teaching content is visible to enrolled members; individual attendance and released feedback are shown only to the relevant learner. No online meeting is connected.' : 'Classroom creation and enrollment are connected. Meetings and learning activities are not available in this classroom yet.'}</p></TabsContent>
      <TabsContent value="people" className="rounded-2xl border border-border bg-card p-5">{classroom.isMock ? <ClassroomPeopleView classroom={classroom} /> : <ClassroomMembersView classroom={classroom} role={role} />}</TabsContent>
      <TabsContent value="feed">{classroom.isMock ? <ClassroomFeedView key={classroom.id + role} classroom={classroom} role={role} /> : <UnderDevelopment title="Discussion" />}</TabsContent>
      <TabsContent value="classwork">{classroom.isMock ? <ClassroomClassworkView key={classroom.id + role} classroom={classroom} role={role} /> : <UnderDevelopment title="Classwork" />}</TabsContent>
      <TabsContent value="materials">{classroom.isMock ? <ClassroomMaterialsView classroom={classroom} /> : <UnderDevelopment title="Materials" />}</TabsContent>
      <TabsContent value="schedule">{classroom.isMock ? <ClassroomScheduleView key={classroom.id + role} classroom={classroom} role={role} /> : <UnderDevelopment title="Schedule" />}</TabsContent>
      <TabsContent value="attendance">{classroom.isMock ? <ClassroomAttendanceView classroom={classroom} role={role} /> : <UnderDevelopment title="Attendance" />}</TabsContent>
      <TabsContent value="progress">{classroom.isMock ? <ClassroomProgressView classroom={classroom} role={role} /> : <UnderDevelopment title="Progress" />}</TabsContent>
      {tab === 'chat' && <TabsContent value="chat"><UnderDevelopment title="Chat" /></TabsContent>}
    </Tabs>
  </div>
}
