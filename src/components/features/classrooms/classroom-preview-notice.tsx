import { FlaskConical } from 'lucide-react'
import { Link } from 'react-router'
import { useClassroomPrototype } from './classroom-prototype-context'
import type { WorkspaceRole } from './classroom-types'

const workspaces: { role: WorkspaceRole; label: string }[] = [
  { role: 'students', label: 'Student' }, { role: 'educators', label: 'Educator' },
  { role: 'tutors', label: 'Tutor' }, { role: 'esl', label: 'ESL teacher' },
]

export function ClassroomPreviewNotice({ role, classroomId }: { role: WorkspaceRole; classroomId?: string }) {
  const { connectedModeEnabled, getClassroomsForWorkspace } = useClassroomPrototype()
  if (connectedModeEnabled) return null
  return <aside aria-label="Classroom preview" className="rounded-xl border border-brand/20 bg-brand-soft/50 p-4 text-sm">
    <p className="flex items-center gap-2 font-semibold"><FlaskConical aria-hidden="true" className="size-4 text-brand" />Demo / Preview data</p>
    <p className="mt-1 text-xs leading-5 text-muted-foreground">Explore as Alex Rivera or a sample teacher. Changes stay in this tab while you switch workspaces and reset on refresh. Nothing is saved to an account.</p>
    <nav aria-label="Preview as a role" className="mt-3 flex flex-wrap gap-2">{workspaces.map(item => <Link key={item.role}
      to={`/${item.role}/classrooms${classroomId && getClassroomsForWorkspace(item.role).some(item => item.id === classroomId) ? `/${classroomId}` : ''}`} aria-current={role === item.role ? 'page' : undefined}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand ${role === item.role ? 'border-brand bg-brand text-white' : 'border-border bg-background hover:bg-muted'}`}>
      {item.label} preview
    </Link>)}</nav>
  </aside>
}
