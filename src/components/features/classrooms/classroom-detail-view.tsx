import { useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClassroomPrototype } from './classroom-prototype-context'
import { ClassroomMembersView } from './classroom-members-view'
import { UnderDevelopment } from './classroom-ui'

const tabs = [{ value: 'about', label: 'About' }, { value: 'people', label: 'Members' },
  { value: 'feed', label: 'Discussion' }, { value: 'chat', label: 'Chat' }, { value: 'classwork', label: 'Classwork' },
  { value: 'materials', label: 'Materials' }, { value: 'schedule', label: 'Schedule' },
  { value: 'attendance', label: 'Attendance' }, { value: 'progress', label: 'Progress' }]
export function ClassroomDetailView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const { classroomId } = useParams()
  const [params, setParams] = useSearchParams()
  const { getClassroom, classroomsLoading, classroomsError, reloadClassrooms } = useClassroomPrototype()
  const [notice, setNotice] = useState('')
  const classroom = classroomId ? getClassroom(classroomId) : undefined
  const tab = tabs.find(item => item.value === params.get('tab'))?.value ?? 'about'
  const owned = classroom?.access === 'owner'
  const visible = classroom && (role === 'students' ? !owned : owned)
  if (classroomsLoading) return <p role="status">Loading classroom…</p>
  if (classroomsError) return <section role="alert" className="space-y-3 rounded-xl border p-6"><h2>Classroom could not be loaded</h2><p>{classroomsError}</p><Button onClick={reloadClassrooms}>Try again</Button></section>
  if (!classroom || !visible) return <section className="space-y-3 rounded-xl border p-6"><h2>Classroom unavailable</h2>
    <p>This classroom is not available to your account in this workspace.</p><Link to={'/' + role + '/classrooms'}>Back to classrooms</Link></section>
  async function copyCode() {
    if (!classroom?.joinCode) return
    try { await navigator.clipboard.writeText(classroom.joinCode); setNotice('Classroom invite code copied.') }
    catch { setNotice('Copy was unavailable. Select the invite code to copy it manually.') }
  }
  return <div className="mx-auto max-w-7xl space-y-5">
    <Link className="underline" to={'/' + role + '/classrooms'}>Back to classrooms</Link>
    <header><h2 className="text-2xl font-semibold">{classroom.name}</h2><p className="mt-2 text-muted-foreground">{classroom.description}</p></header>
    {owned && <section aria-label="Classroom invite" className="space-y-3 rounded-xl border p-4"><h3 className="font-semibold">Student invite code</h3>
      {classroom.joinCode ? <><code className="block break-all select-all">{classroom.joinCode}</code><Button variant="outline" onClick={() => void copyCode()}>Copy invite code</Button>
        <p className="text-sm text-muted-foreground">Keep this code private. Save it now; it cannot be retrieved after reloading or signing out.</p></>
        : <p className="text-sm text-muted-foreground">The code was shown when this classroom was created. Retrieving or replacing a lost code is not available yet.</p>}
      {notice && <p role="status">{notice}</p>}</section>}
    <Tabs value={tab} onValueChange={value => setParams(value === 'about' ? {} : { tab: value }, { replace: true })}>
      <TabsList className="h-auto flex-wrap">{tabs.map(item => <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>)}</TabsList>
      <TabsContent value="about" className="space-y-3 p-4"><h3 className="font-semibold">About this classroom</h3><p>{classroom.description || 'No description provided.'}</p>
        <p className="text-sm text-muted-foreground">Classroom creation and enrollment are connected. Meetings and learning activities are not available in this classroom yet.</p></TabsContent>
      <TabsContent value="people" className="p-4"><ClassroomMembersView classroom={classroom} role={role} /></TabsContent>
      {tabs.filter(item => item.value !== 'about' && item.value !== 'people').map(item => <TabsContent key={item.value} value={item.value} className="p-4"><UnderDevelopment title={item.label} /></TabsContent>)}
    </Tabs>
  </div>
}
