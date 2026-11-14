import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { getDashboardPageTitle, getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/components/features/auth/auth-session-context'
import { useClassroomPrototype } from '@/components/features/classrooms/classroom-prototype-context'
import { AccountNotifications } from './account-notifications'
import { PersonalNotes, PersonalSubjects, PersonalTasks } from './personal-workspace'
import { ClassroomSessions } from './classroom-sessions'

export function ApiWorkspaceContent({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname)
  const path = pathname.replace(/^\/(students|educators|tutors|esl)\/?/, '').replace(/\/$/, '')
  if (!path) return <AccountOverview />
  if (path === 'notifications') return <AccountNotifications />
  if (path === 'schedule' || (role === 'tutors' && path === 'sessions')) return <ClassroomSessions />
  if (role === 'students') {
    if (/^subjects(?:\/[^/]+)?$/.test(path)) return <PersonalSubjects key={path} subjectId={path.split('/')[1]} />
    if (path === 'tasks') return <PersonalTasks />
    if (path === 'notes') return <PersonalNotes />
  }
  if (/^classrooms(?:\/|$)/.test(path) || path === 'account/security') return children
  // Unconnected pages must not mount sample providers, local records, or design-only actions.
  return <section className="mx-auto max-w-3xl space-y-3 rounded-2xl border bg-card p-6"><h2 className="text-xl font-semibold">{getDashboardPageTitle(pathname)}</h2><p className="text-sm text-muted-foreground">This workspace is not available yet.</p><Link to={'/' + role + '/classrooms'} className="inline-block text-sm underline">Open my classes</Link></section>
}

function AccountOverview() {
  const { user } = useAuthSession()
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const { getClassroomsForWorkspace, classroomsLoading, classroomsError, reloadClassrooms } = useClassroomPrototype()
  const classrooms = getClassroomsForWorkspace(role)
  return <section className="mx-auto max-w-5xl space-y-6"><header><h2 className="text-2xl font-semibold">Welcome, {user?.name}</h2><p className="mt-2 text-sm text-muted-foreground">Your Owlio workspace.</p></header>
    <section className="space-y-3 rounded-2xl border bg-card p-6"><h3 className="font-semibold">My classes</h3>
      {classroomsLoading ? <p role="status">Loading your classes…</p> : classroomsError ? <div role="alert"><p>{classroomsError}</p><Button variant="outline" onClick={reloadClassrooms}>Try again</Button></div> : <p>{classrooms.length} {classrooms.length === 1 ? 'class' : 'classes'}</p>}
      <Link to={'/' + role + '/classrooms'} className="text-sm underline">View my classes</Link>
    </section>
    {role === 'students' && <nav aria-label="Personal learning" className="flex flex-wrap gap-4">{[['subjects', 'My Learning'], ['tasks', 'My Tasks'], ['notes', 'My Notes']].map(([path, label]) => <Link key={path} to={'/students/' + path} className="rounded-xl border bg-card p-5 underline">{label}</Link>)}</nav>}
  </section>
}
