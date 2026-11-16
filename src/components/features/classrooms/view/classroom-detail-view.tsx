import { useState, useSyncExternalStore } from 'react'
import { ArrowLeft, GraduationCap, Info, MessageSquare } from 'lucide-react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { useClassroomPrototype } from '../context/classroom-prototype-context'
import { ClassroomMembersView } from './classroom-members-view'
import { ClassroomChatView } from './classroom-chat-view'
import { ClassroomFeedView } from './classroom-feed-view'
import { ClassroomClassworkView } from './classroom-classwork-view'
import { ClassroomInformation } from '../ui/classroom-information'
import { ClassroomDetailHeader } from '../ui/classroom-detail-header'
import { ClassroomSectionNavigation } from '../ui/classroom-section-navigation'
import { classroomSections } from '../contents/classroom-sections'

const desktopQuery = '(min-width: 1024px)'
function subscribeToLayout(callback: () => void) {
  const media = window.matchMedia?.(desktopQuery)
  media?.addEventListener?.('change', callback)
  return () => media?.removeEventListener?.('change', callback)
}
function isDesktopLayout() { return window.matchMedia?.(desktopQuery).matches ?? false }

const sections = classroomSections
const card = 'rounded-xl border border-border bg-card shadow-none'

export function ClassroomDetailView() {
  const desktop = useSyncExternalStore(subscribeToLayout, isDesktopLayout, () => false)
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
  const owned = classroom?.access === 'owner'
  const visible = classroom && (role === 'students' ? !owned : owned)
  if (classroomsLoading) return <p role="status">Loading classroom…</p>
  if (classroomsError) return <section role="alert" className="space-y-3 rounded-xl border p-6"><h2>Classroom could not be loaded</h2><p>{classroomsError}</p><Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={reloadClassrooms}>Try again</Button></section>
  if (!classroom || !visible) return <section className="space-y-3 rounded-xl border p-6"><h2>Classroom unavailable</h2>
    <p>This classroom is not available to your account in this workspace.</p><Link className="underline" to={'/' + role + '/classrooms'}>Back to classrooms</Link></section>
  const selectTab = (value: string) => setParams(current => { const next = new URLSearchParams(current); if (value === defaultTab) next.delete('tab'); else next.set('tab', value); return next }, { replace: true })
  const meetingHref = classroom.meetingId ? `/${role}/classrooms/meeting-room?session=${encodeURIComponent(classroom.meetingId)}&code=${encodeURIComponent(classroom.meetingCode ?? '')}` : classroom.meetingCode ? `/${role}/classrooms/meeting-room?room=${encodeURIComponent(classroom.meetingCode)}` : null
  async function copyCode() {
    if (!classroom?.joinCode) return
    try { await navigator.clipboard.writeText(classroom.joinCode); setNotice('Classroom invite code copied.') }
    catch { setNotice('Copy was unavailable. Select the invite code to copy it manually.') }
  }
  return <div className="classroom-detail mx-auto min-w-0 max-w-[82rem] space-y-5 pb-4 [overflow-wrap:anywhere]">
    <Link className="inline-flex items-center gap-2 rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" to={'/' + role + '/classrooms'}><ArrowLeft aria-hidden="true" className="size-4" />Back to classrooms</Link>
    {tab !== 'chat' && <ClassroomDetailHeader classroom={classroom} owned={owned} meetingHref={meetingHref} onClasswork={() => selectTab('classwork')} />}
    <Tabs orientation={desktop ? 'vertical' : 'horizontal'} value={tab} onValueChange={selectTab} className="min-w-0 gap-5 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[12rem_minmax(0,1fr)]">
      <ClassroomSectionNavigation tab={tab} schoolClassroom={classroom.ownerWorkspace === 'educators'} />
      <div className={['chat', 'feed'].includes(tab) ? 'min-w-0' : 'grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_15rem]'}>
        <section aria-label="Classroom content" className="min-w-0 space-y-5">
          <TabsContent value="about" className={`${card} space-y-5 p-5 sm:p-6`}><header className="flex items-center gap-2 border-b border-border pb-4"><Info aria-hidden="true" className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">About this classroom</h3></header><p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">{classroom.description || 'No description provided.'}</p><div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4"><GraduationCap aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" /><div><h4 className="text-sm font-semibold">A space for your class</h4><p className="mt-1 text-sm leading-6 text-muted-foreground">Classroom creation and enrollment are connected. Use Sessions to schedule or join a meeting.</p></div></div></TabsContent>
          <TabsContent value="people" className={`${card} p-5 sm:p-6`}><h3 className="mb-5 border-b border-border pb-4 text-sm font-semibold">Class members</h3><ClassroomMembersView classroom={classroom} role={role} /></TabsContent>
          {sections.filter(item => !['about', 'people', 'chat', 'feed', 'classwork'].includes(item.value)).map(item => <TabsContent key={item.value} value={item.value} className={card}><header className="border-b border-border px-5 py-4"><h3 className="font-semibold">{item.value === 'progress' ? 'Progress' : item.label}</h3></header><div className="flex flex-col items-center px-5 py-12 text-center"><span className="mb-4 grid size-14 place-items-center rounded-full bg-muted"><MessageSquare aria-hidden="true" className="size-6 text-muted-foreground" /></span><p className="text-base font-medium">{item.label + ' will appear here'}</p><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">This section is under development.</p></div></TabsContent>)}
          {tab === 'classwork' && <TabsContent value="classwork"><ClassroomClassworkView key={user?.id + ':' + classroom.id} classroom={classroom} /></TabsContent>}
          {tab === 'feed' && <TabsContent value="feed"><ClassroomFeedView key={user?.id + ':' + classroom.id} classroom={classroom} /></TabsContent>}
          {tab === 'chat' && <TabsContent value="chat"><ClassroomChatView key={user?.id + ':' + classroom.id} classroom={classroom} role={role} /></TabsContent>}
        </section>
        {!['chat', 'feed'].includes(tab) && <ClassroomInformation classroom={classroom} owned={owned} notice={notice} onAbout={() => selectTab('about')} onCopyCode={() => void copyCode()} />}
      </div>
    </Tabs>
  </div>
}
