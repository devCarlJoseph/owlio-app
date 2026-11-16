import { ClassworkDetailSkeleton } from '../ui/classroom-skeletons'
import { Link, useLocation, useParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { Button } from '@/components/ui/button'
import { useClassroomPrototype } from '../context/classroom-prototype-context'
import { ClassroomClassworkView } from './classroom-classwork-view'

export function ClassroomActivityView() {
  const { pathname } = useLocation()
  const { user } = useAuthSession()
  const role = getDashboardRole(pathname) ?? 'students'
  const { classroomId, activityId } = useParams()
  const { getClassroom, classroomsLoading, classroomsError, reloadClassrooms } = useClassroomPrototype()
  const classroom = classroomId ? getClassroom(classroomId) : undefined
  const owned = classroom?.access === 'owner'
  const available = classroom && (role === 'students' ? !owned : owned)
  return <div className="mx-auto max-w-4xl space-y-4"><Link className="text-sm text-muted-foreground underline" to={`/${role}/classrooms/${encodeURIComponent(classroomId ?? '')}?tab=classwork`}>Back to classroom</Link>
    {classroomsLoading ? <ClassworkDetailSkeleton /> : classroomsError ? <div role="alert"><p>{classroomsError}</p><Button onClick={reloadClassrooms}>Retry classroom</Button></div> : available && activityId ? <ClassroomClassworkView key={user?.id + ':' + classroom.id + ':' + activityId} classroom={classroom} initialId={activityId} /> : <p>Classwork is not available in this workspace.</p>}
  </div>
}
