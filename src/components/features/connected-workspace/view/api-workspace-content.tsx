import type { ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { useClassroomPrototype } from '@/components/features/classrooms/context/classroom-prototype-context'
import { AccountNotifications } from './account-notifications'
import { PersonalNotes, PersonalSubjects, PersonalTasks } from './personal-workspace'
import { ClassroomSessions } from './classroom-sessions'

export function ApiWorkspaceContent({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const role = getDashboardRole(pathname)
  const path = pathname.replace(/^\/(students|educators|tutors|esl)\/?/, '').replace(/\/$/, '')
  let accountContent: ReactNode = null
  let localTools = false
  if (!path) accountContent = <AccountOverview />
  if (path === 'notifications') accountContent = <AccountNotifications />
  if (path === 'schedule' || (role === 'tutors' && path === 'sessions')) accountContent = <ClassroomSessions />
  if (role === 'students') {
    if (/^subjects(?:\/[^/]+)?$/.test(path)) accountContent = <PersonalSubjects key={path} subjectId={path.split('/')[1]} />
    if (path === 'tasks') accountContent = <PersonalTasks />
    if (path === 'notes') accountContent = <PersonalNotes />
    localTools = /^(subjects(?:\/[^/]+)?|tasks|notes)$/.test(path)
  }
  if (!accountContent) return children
  const accountSelected = params.get('source') === 'account'
  const viewHref = (account: boolean) => {
    const next = new URLSearchParams(params)
    if (account) next.set('source', 'account')
    else next.delete('source')
    return { pathname, search: next.size ? `?${next}` : '' }
  }
  return <div className="space-y-5">
    <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
      <nav aria-label="Workspace data source" className="inline-flex rounded-full border border-border bg-card p-1 text-xs font-medium">
        {[false, true].map(account => <Link key={String(account)} to={viewHref(account)} aria-current={accountSelected === account ? 'page' : undefined}
          className={`rounded-full px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring ${accountSelected === account ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`}>
          {account ? 'Account records' : localTools ? 'On this device' : 'Workspace view'}
        </Link>)}
      </nav>
      {localTools && <p className="text-xs text-muted-foreground">{accountSelected ? 'Saved to your account. Device records stay separate.' : 'Saved on this device. Account records stay separate.'}</p>}
    </div>
    {accountSelected ? accountContent : children}
  </div>
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
    {role === 'students' && <nav aria-label="Personal learning" className="flex flex-wrap gap-4">{[['subjects', 'My Learning'], ['tasks', 'My Tasks'], ['notes', 'My Notes']].map(([path, label]) => <Link key={path} to={'/students/' + path + '?source=account'} className="rounded-xl border bg-card p-5 underline">{label}</Link>)}</nav>}
  </section>
}
