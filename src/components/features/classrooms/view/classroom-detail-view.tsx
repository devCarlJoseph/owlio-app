import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, BookOpen, Check, ChevronRight, GraduationCap, Info, MessageSquare, Users, Video } from 'lucide-react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { useClassroomPrototype } from '../context/classroom-prototype-context'
import { ClassroomMembersView } from './classroom-members-view'
import { ClassroomChatView } from './classroom-chat-view'
import { getClassroomCoverUrl } from '../utils/classroom-covers'
import { getClassroomCategory } from '../utils/classroom-list-meta'

const sections = [{ value: 'feed', label: 'Discussion' }, { value: 'classwork', label: 'Classwork' },
  { value: 'materials', label: 'Materials' }, { value: 'schedule', label: 'Schedule' },
  { value: 'people', label: 'Members' }, { value: 'about', label: 'About' },
  { value: 'attendance', label: 'Attendance' }, { value: 'progress', label: 'Grades & Feedback' }, { value: 'chat', label: 'Chat' }]
const card = 'rounded-xl border border-border bg-card shadow-xs'

export function ClassroomDetailView() {
  const { pathname } = useLocation()
  const { user } = useAuthSession()
  const role = getDashboardRole(pathname) ?? 'students'
  const { classroomId } = useParams()
  const [params, setParams] = useSearchParams()
  const { getClassroom, classroomsLoading, classroomsError, reloadClassrooms } = useClassroomPrototype()
  const [notice, setNotice] = useState('')
  const classroom = classroomId ? getClassroom(classroomId) : undefined
  const tabs = sections
  const defaultTab = 'about'
  const tab = tabs.find(item => item.value === params.get('tab'))?.value ?? defaultTab
  const activeTabRef = useRef<HTMLButtonElement>(null)
  const tabsViewportRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const viewport = tabsViewportRef.current
    if (!viewport) return
    const revealTab = () => {
      const selected = activeTabRef.current?.getBoundingClientRect()
      const bounds = viewport.getBoundingClientRect()
      if (!selected) return
      const delta = selected.left < bounds.left ? selected.left - bounds.left : selected.right > bounds.right ? selected.right - bounds.right : 0
      if (delta) viewport.scrollBy?.({ left: delta })
    }
    revealTab()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', revealTab)
      return () => window.removeEventListener('resize', revealTab)
    }
    const observer = new ResizeObserver(revealTab)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [tab, classroom?.id, classroomsLoading])
  const owned = classroom?.access === 'owner'
  const visible = classroom && (role === 'students' ? !owned : owned)
  if (classroomsLoading) return <p role="status">Loading classroom…</p>
  if (classroomsError) return <section role="alert" className="space-y-3 rounded-xl border p-6"><h2>Classroom could not be loaded</h2><p>{classroomsError}</p><Button onClick={reloadClassrooms}>Try again</Button></section>
  if (!classroom || !visible) return <section className="space-y-3 rounded-xl border p-6"><h2>Classroom unavailable</h2>
    <p>This classroom is not available to your account in this workspace.</p><Link className="underline" to={'/' + role + '/classrooms'}>Back to classrooms</Link></section>
  const selectTab = (value: string) => setParams(current => { const next = new URLSearchParams(current); if (value === defaultTab) next.delete('tab'); else next.set('tab', value); return next }, { replace: true })
  const meetingHref = classroom.meetingId ? `/${role}/classrooms/meeting-room?session=${encodeURIComponent(classroom.meetingId)}&code=${encodeURIComponent(classroom.meetingCode ?? '')}` : classroom.meetingCode ? `/${role}/classrooms/meeting-room?room=${encodeURIComponent(classroom.meetingCode)}` : null
  async function copyCode() {
    if (!classroom?.joinCode) return
    try { await navigator.clipboard.writeText(classroom.joinCode); setNotice('Classroom invite code copied.') }
    catch { setNotice('Copy was unavailable. Select the invite code to copy it manually.') }
  }
  return <div className="mx-auto min-w-0 max-w-[76rem] space-y-5 pb-4 [overflow-wrap:anywhere]">
    <Link className="inline-flex items-center gap-2 rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" to={'/' + role + '/classrooms'}><ArrowLeft aria-hidden="true" className="size-4" />Back to classrooms</Link>
    <Tabs value={tab} onValueChange={selectTab} className="min-w-0 gap-5">
      <section aria-label="Classroom group header" className={`${card} min-w-0 overflow-hidden`}>
        <div className={tab === 'chat' ? 'hidden' : 'relative h-40 overflow-hidden sm:h-56 lg:h-64'}>
          <img src={getClassroomCoverUrl(classroom.id)} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-5 inline-flex items-center gap-1.5 rounded-md bg-card/95 px-3 py-1.5 text-xs font-medium shadow-sm sm:left-7"><GraduationCap aria-hidden="true" className="size-3.5" />{getClassroomCategory(classroom)}</span>
        </div>
        <header className={tab === 'chat' ? 'hidden' : 'space-y-5 px-5 pt-5 pb-5 sm:px-7 sm:pt-6'}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 basis-72"><h2 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">{classroom.name}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><Users aria-hidden="true" className="size-4" /><span>Classroom group</span><span aria-hidden="true">·</span><span>{owned ? 'You manage this classroom' : 'You’re enrolled in this classroom'}</span></p>
            </div>
            <div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => selectTab('classwork')}><BookOpen aria-hidden="true" />View classwork</Button>
              {meetingHref && <Link className={buttonVariants()} to={meetingHref}><Video aria-hidden="true" />Meeting room</Link>}
            </div>
          </div>
          {tab !== 'chat' && <div className="flex items-center gap-3"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><GraduationCap className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-medium">{classroom.instructorName || 'Instructor details unavailable'}</p><p className="text-xs text-muted-foreground">{owned ? 'Teaching workspace' : 'Enrolled member'}</p></div><span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium"><Check aria-hidden="true" className="size-3.5" />{owned ? 'Class owner' : 'Enrolled'}</span></div>}
        </header>
        <ScrollArea viewportRef={tabsViewportRef} scrollbarOrientation="horizontal" className="h-16 min-w-0 border-t border-border" viewportClassName="overflow-y-hidden!" contentClassName="min-w-full! w-max">
          <TabsList aria-label="Classroom sections" variant="line" className="h-14 w-max min-w-full justify-start gap-0 px-2 sm:px-4">{tabs.map(item => <TabsTrigger key={item.value} ref={item.value === tab ? activeTabRef : undefined} value={item.value} className="h-full shrink-0 flex-none rounded-none px-4 font-semibold after:bottom-0 data-active:text-brand data-active:after:bg-brand">{item.value === 'progress' && classroom.ownerWorkspace !== 'educators' ? 'Progress & Feedback' : item.label}</TabsTrigger>)}</TabsList>
        </ScrollArea>
      </section>
      <div className={tab === 'chat' ? 'min-w-0' : 'grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]'}>
        <section aria-label="Classroom content" className="min-w-0 space-y-5">
          <TabsContent value="about" className={`${card} space-y-5 p-5 sm:p-6`}><header className="flex items-center gap-2 border-b border-border pb-4"><Info aria-hidden="true" className="size-4 text-muted-foreground" /><h3 className="text-lg font-semibold">About this classroom</h3></header><p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">{classroom.description || 'No description provided.'}</p><div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4"><GraduationCap aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" /><div><h4 className="text-sm font-semibold">A space for your class</h4><p className="mt-1 text-sm leading-6 text-muted-foreground">Classroom creation and enrollment are connected. Use Sessions to schedule or join a meeting.</p></div></div></TabsContent>
          <TabsContent value="people" className={`${card} p-5 sm:p-6`}><h3 className="mb-5 border-b border-border pb-4 text-lg font-semibold">Class members</h3><ClassroomMembersView classroom={classroom} role={role} /></TabsContent>
          {sections.filter(item => !['about', 'people', 'chat'].includes(item.value)).map(item => <TabsContent key={item.value} value={item.value} className={card}><header className="border-b border-border px-5 py-4"><h3 className="font-semibold">{item.value === 'progress' ? 'Progress' : item.label}</h3></header><div className="flex flex-col items-center px-5 py-12 text-center"><span className="mb-4 grid size-14 place-items-center rounded-full bg-muted"><MessageSquare aria-hidden="true" className="size-6 text-muted-foreground" /></span><p className="text-base font-medium">{item.value === 'feed' ? 'Your class conversation belongs here' : item.label + ' will appear here'}</p><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">This section is under development.</p></div></TabsContent>)}
          {tab === 'chat' && <TabsContent value="chat"><ClassroomChatView key={user?.id + ':' + classroom.id} classroom={classroom} role={role} /></TabsContent>}
        </section>
        {tab !== 'chat' && <aside aria-label="Classroom information" className="min-w-0 space-y-4 lg:sticky lg:top-0">
          {tab !== 'chat' && <section className={`${card} p-5`}><h3 className="font-semibold">Class details</h3><p className="mt-3 line-clamp-4 break-words text-sm leading-6 text-muted-foreground">{classroom.description || 'No description provided.'}</p><div className="mt-4 space-y-3 border-t border-border pt-4"><p className="flex items-start gap-2 text-sm"><GraduationCap aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>{classroom.instructorName || 'Instructor details unavailable'}</span></p><p className="flex items-center gap-2 text-sm"><Users aria-hidden="true" className="size-4 text-muted-foreground" />{owned ? 'Teaching workspace' : 'Enrolled member'}</p></div><Button variant="ghost" className="mt-4 w-full justify-between bg-muted/60" onClick={() => selectTab('about')}>View class information<ChevronRight aria-hidden="true" className="size-4" /></Button></section>}
          <details className={`${card} p-5`}><summary className="cursor-pointer rounded text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">Classroom invite</summary><section aria-label="Classroom invite" className="mt-4 space-y-3"><h3 className="text-sm font-semibold">Student invite code</h3>
            {classroom.joinCode ? <><code className="block select-all break-all rounded-lg bg-muted p-3 text-sm">{classroom.joinCode}</code><Button variant="outline" className="w-full" onClick={() => void copyCode()}>Copy invite code</Button><p className="text-xs leading-5 text-muted-foreground">Share this code only with students invited to this classroom.</p></> : <p className="text-sm leading-6 text-muted-foreground">This classroom has a legacy invite. Its owner must rotate the code before it can be displayed here.</p>}
            {notice && <p role="status" className="text-sm">{notice}</p>}</section></details>
          {classroom.meetingCode && <details className={`${card} p-5`}><summary className="cursor-pointer rounded text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">Classroom meeting code</summary><code className="mt-3 block select-all break-all rounded-lg bg-muted p-3 text-sm">{classroom.meetingCode}</code></details>}
          <p className="px-1 text-xs leading-5 text-muted-foreground">Your classroom, your learning community.</p>
        </aside>}
      </div>
    </Tabs>
  </div>
}
